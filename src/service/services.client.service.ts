// src/service/services.client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';
import { ClientServiceRequestService } from 'src/client-service-request/client-service-request.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { SubmitIntakeFormDto } from './dto/submit-intake-forms.dto'; // DTO Baru
import { FormSubmission, FormSubmissionDocument } from 'src/form/schemas/form-submissions.schema';

@Injectable()
export class ServicesClientService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(FormSubmission.name) private submissionModel: Model<FormSubmissionDocument>,
        private readonly formsService: FormsService,
        private readonly csrService: ClientServiceRequestService,
    ) { }

    private async findAndValidatePublicService(id: string): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel.findById(id).select(
            'companyId title description accessType isActive workOrderForms reportForms clientIntakeForms formKey'
        ).exec();

        if (!service || !service.isActive || service.accessType !== 'public') {
            throw new NotFoundException(`Service with ID ${id} not found or is not public`);
        }
        return service;
    }

    async findAllByCompanyId(companyId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(companyId)) throw new NotFoundException(`Invalid company ID: ${companyId}`);
        return getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            { companyId: new Types.ObjectId(companyId), isActive: true, accessType: 'public' },
            false
        );
    }

    async findServiceDetailById(id: string): Promise<any> {
        const service = await this.findAndValidatePublicService(id);
        const formQuantity = (service.workOrderForms?.length || 0) + (service.reportForms?.length || 0) + (service.clientIntakeForms?.length || 0);

        return {
            service: {
                _id: service._id,
                companyId: service.companyId,
                title: service.title,
                description: service.description,
                accessType: service.accessType,
                isActive: service.isActive,
            },
            formQuantity: formQuantity,
        };
    }

    async getClientIntakeFormsForService(serviceId: string): Promise<any[]> {
        const service = await this.findAndValidatePublicService(serviceId);
        const intakeFormsInfo = service.clientIntakeForms || [];
        intakeFormsInfo.sort((a, b) => a.order - b.order);

        const populatedForms = await Promise.all(
            intakeFormsInfo.map(async (formInfo) => {
                try {
                    const latestForm = await this.formsService.findLatestTemplateByKey(formInfo.formKey);
                    if (!latestForm) return null;
                    return { order: formInfo.order, form: latestForm };
                } catch (error) {
                    return null;
                }
            })
        );
        return populatedForms.filter(pf => pf !== null);
    }

    // === LOGIC POST SUBMISSION ===
    async processIntakeSubmission(serviceId: string, user: AuthenticatedUser, dto: any) {
        // 1. Validasi Service
        const service = await this.findAndValidatePublicService(serviceId);

        // 2. Snapshot Client Intake Form
        const intakeFormsInfo = service.clientIntakeForms || [];
        const formSnapshots = await Promise.all(
            intakeFormsInfo.map(async (item) => {
                try {
                    const template = await this.formsService.findLatestTemplateByKey(item.formKey);
                    if (!template) return null;
                    return {
                        order: item.order,
                        form: {
                            // FIX TS Error: Cast _id ke any atau ObjectId agar compatible dengan Schema Snapshot
                            _id: template._id as any,
                            title: template.title,
                            description: template.description,
                            formType: template.formType
                        }
                    };
                } catch (error) {
                    return null;
                }
            })
        );
        const validFormSnapshots = formSnapshots.filter(f => f !== null);

        // 3. Create CSR (Tabel 1)
        // FIX TS Error: Cast property ID ke 'any' untuk mengatasi strict type checking Mongoose/TS
        const newCSR = await this.csrService.create({
            serviceId: service._id as any,
            clientId: user._id as any,
            companyId: service.companyId as any,
            status: 'received',
            clientIntakeForm: validFormSnapshots as any, // Snapshot form structure at time of submission
        });

        // 4. Create Submissions (Tabel 2)
        // Handle array of submissions
        const submissions = dto.submissions || [];
        const submissionDocs = submissions.map((submission: any) => ({
            ownerId: newCSR._id, // Link ke CSR
            formId: new Types.ObjectId(submission.formId),
            submissionType: 'intake',
            submittedBy: new Types.ObjectId(user._id.toString()),
            fieldsData: submission.fieldsData,
            status: 'submitted',
            submittedAt: new Date()
        }));

        if (submissionDocs.length > 0) {
            await this.submissionModel.insertMany(submissionDocs);
        }

        return newCSR;
    }
}