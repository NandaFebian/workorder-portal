// src/client-service-request/client-service-request.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientServiceRequest, ClientServiceRequestDocument } from './schemas/client-service-request.schema';
import { FormSubmission, FormSubmissionDocument } from 'src/form/schemas/form-submissions.schema';
import { FormsService } from 'src/form/form.service';

@Injectable()
export class ClientServiceRequestService {
    constructor(
        @InjectModel(ClientServiceRequest.name) private csrModel: Model<ClientServiceRequestDocument>,
        @InjectModel(FormSubmission.name) private submissionModel: Model<FormSubmissionDocument>,
        private readonly formsService: FormsService,
    ) { }

    async create(data: any): Promise<ClientServiceRequestDocument> {
        const newRequest = new this.csrModel(data);
        return newRequest.save();
    }

    // Public: List CSR by User
    async findAllByClientId(userId: string): Promise<any[]> {
        const requests = await this.csrModel.find({ clientId: new Types.ObjectId(userId) })
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('clientId', 'name email role positionId')
            .sort({ createdAt: -1 })
            .exec();

        return requests.map(request => {
            // FIX: Cast ke 'any' agar TypeScript mengenali field createdAt & updatedAt dari Mongoose timestamps
            const doc = request.toObject() as any;

            return {
                _id: doc._id,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                companyId: doc.companyId,
                // Mapping: clientId -> client
                client: doc.clientId,
                // Mapping: serviceId -> service
                service: doc.serviceId,
            };
        });
    }

    // Public: Detail CSR (Updated with Hydration & Submissions)
    async findOneForClient(id: string, userId: string): Promise<any> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

        const csr = await this.csrModel.findOne({
            _id: id,
            clientId: new Types.ObjectId(userId)
        })
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('clientId', 'name email role positionId')
            .exec();

        if (!csr) throw new NotFoundException('Service Request not found');

        // 1. Ambil Data Submissions terkait CSR ini
        const submissions = await this.submissionModel.find({ ownerId: csr._id }).exec();

        // 2. Hydrate Intake Forms dengan Fields dari Template Asli
        const clientIntakeFormsWithFields = await Promise.all(
            csr.clientIntakeForm.map(async (item) => {
                const snapshotForm = item.form;
                let fields: any[] = [];

                try {
                    // Cari template asli untuk mendapatkan fields terbaru/lengkap
                    const template = await this.formsService.findTemplateById(snapshotForm._id.toString());
                    if (template) {
                        fields = template.fields;
                    }
                } catch (error) {
                    console.warn(`Form template not found for snapshot id: ${snapshotForm._id}`);
                }

                return {
                    order: item.order,
                    form: {
                        _id: snapshotForm._id,
                        title: snapshotForm.title,
                        formType: snapshotForm.formType,
                        description: snapshotForm.description,
                        fields: fields // Masukkan fields ke dalam response
                    }
                };
            })
        );

        // FIX: Cast ke 'any' untuk akses properti timestamps
        const doc = csr.toObject() as any;

        return {
            _id: doc._id,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            companyId: doc.companyId,
            client: doc.clientId,
            service: doc.serviceId,
            clientIntakeForms: clientIntakeFormsWithFields,
            submissions: submissions
        };
    }

    // Internal: Untuk Staff/Manager
    async findAllByCompanyId(companyId: string): Promise<ClientServiceRequestDocument[]> {
        return this.csrModel.find({ companyId: new Types.ObjectId(companyId) })
            .populate('serviceId', 'title')
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOneInternal(id: string): Promise<ClientServiceRequestDocument> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');
        const csr = await this.csrModel.findById(id)
            .populate('serviceId')
            .populate('clientId', 'name email')
            .exec();
        if (!csr) throw new NotFoundException('Service Request not found');
        return csr;
    }

    async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<ClientServiceRequestDocument> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');
        const csr = await this.csrModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).exec();
        if (!csr) throw new NotFoundException('Service Request not found');
        return csr;
    }
}