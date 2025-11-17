// src/service-requests/service-requests.service.ts
import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    Inject,
    forwardRef,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    ClientServiceRequest,
    ClientServiceRequestDocument,
    RequestStatus,
} from './schemas/client-service-request.schema';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { FormsService } from 'src/form/form.service';
import { ServicesClientService } from 'src/service/services.client.service';
import { Role } from 'src/common/enums/role.enum';
import { IntakeSubmissionDto } from './dto/intake-submission.dto';
import { AnswerDto } from 'src/form/dto/submit-form.dto';
import { FormField } from 'src/form/schemas/form-field.schema';

@Injectable()
export class ServiceRequestsService {
    constructor(
        @InjectModel(ClientServiceRequest.name)
        private requestModel: Model<ClientServiceRequestDocument>,
        private readonly formsService: FormsService,
        @Inject(forwardRef(() => ServicesClientService))
        private readonly servicesClientService: ServicesClientService,
    ) { }

    async create(
        serviceId: string,
        intakeSubmissions: IntakeSubmissionDto[],
        user: AuthenticatedUser,
    ): Promise<ClientServiceRequestDocument> {
        if (user.role !== Role.Client) {
            throw new ForbiddenException('Only clients can create service requests.');
        }

        const serviceData = await this.servicesClientService.findServiceDetailById(
            serviceId,
        );
        if (!serviceData?.service) {
            throw new NotFoundException('Service not found or is not public.');
        }
        const companyId = serviceData.service.companyId;

        // 2. Buat semua FormSubmission
        const submissionIds: Types.ObjectId[] = [];
        for (const submission of intakeSubmissions) {
            // 1. Dapatkan template form dari DB
            const template = await this.formsService.findTemplateById(submission.formId);
            if (!template) {
                throw new NotFoundException(
                    `Form template with ID ${submission.formId} not found.`,
                );
            }

            // 2. Buat Peta (Map) untuk konversi: order -> fieldId
            const orderToFieldIdMap = new Map<number, string>();

            // --- 👇 PERBAIKAN DI SINI 👇 ---
            template.fields.forEach((field) => {
                // Cast 'field' untuk memberi tahu TypeScript bahwa ia punya '_id'
                const fieldWithId = field as FormField & { _id: Types.ObjectId };

                if (fieldWithId.order != null && fieldWithId._id) {
                    orderToFieldIdMap.set(fieldWithId.order, fieldWithId._id.toString());
                }
            });
            // --- 👆 AKHIR PERBAIKAN 👆 ---

            // 3. Transformasi `fieldsData` (dari 'image_fee401.png') menjadi `answers` (sesuai skema DB)
            const answers: AnswerDto[] = submission.fieldsData.map((fieldData) => {
                const fieldId = orderToFieldIdMap.get(fieldData.order);
                if (!fieldId) {
                    throw new BadRequestException(
                        `Invalid order number ${fieldData.order} for form ${submission.formId}.`,
                    );
                }
                return {
                    fieldId: fieldId,
                    value: fieldData.value,
                };
            });

            // 4. Submit form menggunakan struktur DTO yang benar
            const submittedForm = await this.formsService.submitForm(user, {
                formTemplateId: submission.formId,
                answers: answers,
            });

            submissionIds.push(submittedForm._id as Types.ObjectId);
        }

        // 3. Buat Service Request
        const newRequest = new this.requestModel({
            serviceId: new Types.ObjectId(serviceId),
            clientId: user._id,
            companyId: companyId,
            status: RequestStatus.RECEIVED,
            clientIntakeFormSubmissionIds: submissionIds,
        });

        return newRequest.save();
    }

    async updateStatus(
        requestId: string,
        dto: UpdateRequestStatusDto,
        user: AuthenticatedUser,
    ): Promise<ClientServiceRequestDocument> {
        if (user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
            throw new ForbiddenException(
                'You do not have permission to update this request.',
            );
        }

        if (!user.company?._id) {
            throw new ForbiddenException('You are not associated with any company.');
        }

        const request = await this.requestModel.findById(requestId);
        if (!request) {
            throw new NotFoundException('Service request not found.');
        }

        if (request.companyId.toString() !== user.company._id.toString()) {
            throw new ForbiddenException(
                'You can only update requests for your own company.',
            );
        }

        // TODO: Tambahkan validasi alur status
        // (misal: tidak bisa 'approve' dari 'rejected')

        request.status = dto.status;

        // TODO: Implementasi logika dari gambar
        // if (dto.status === RequestStatus.APPROVED) {
        //    const workOrder = await this.workOrderService.createFromRequest(request);
        //    request.status = RequestStatus.WORK_ORDER_CREATED;
        // }

        return request.save();
    }

    async findForClient(
        user: AuthenticatedUser,
    ): Promise<ClientServiceRequestDocument[]> {
        return this.requestModel
            .find({ clientId: user._id })
            .populate('serviceId', 'title description')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findForCompany(
        user: AuthenticatedUser,
    ): Promise<ClientServiceRequestDocument[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('You are not associated with any company.');
        }
        return this.requestModel
            .find({ companyId: user.company._id })
            .populate('serviceId', 'title')
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }
}