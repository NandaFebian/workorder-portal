// src/service/services.client.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';

@Injectable()
export class ServicesClientService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        private readonly formsService: FormsService,
    ) { }

    private async findAndValidatePublicService(id: string): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }

        // Pilih field yang diperlukan
        const service = await this.serviceModel.findById(id).select(
            'companyId title description accessType isActive workOrderForms reportForms clientIntakeForms formKey' // Tambahkan formKey untuk getLatestForms
        ).exec();

        if (!service || !service.isActive || service.accessType !== 'public') {
            throw new NotFoundException(`Service with ID ${id} not found or is not public`);
        }
        return service;
    }

    async findAllByCompanyId(companyId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new NotFoundException(`Invalid company ID: ${companyId}`);
        }
        // Gunakan helper agregasi, tapi jangan populate forms (false)
        const latestPublicServices = await getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            {
                companyId: new Types.ObjectId(companyId),
                isActive: true,
                accessType: 'public'
            },
            false // includeForms = false
        );
        return latestPublicServices;
    }

    // Ini untuk GET /public/services/{id} (Service Detail)
    async findServiceDetailById(id: string): Promise<any> {
        const service = await this.findAndValidatePublicService(id);

        const formQuantity = (service.workOrderForms?.length || 0) +
            (service.reportForms?.length || 0) +
            (service.clientIntakeForms?.length || 0);

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

    // Ini untuk GET /public/services/{id}/intake-forms
    async getClientIntakeFormsForService(serviceId: string): Promise<any[]> {
        const service = await this.findAndValidatePublicService(serviceId);

        const intakeFormsInfo = service.clientIntakeForms || [];

        intakeFormsInfo.sort((a, b) => a.order - b.order);

        const populatedForms = await Promise.all(
            intakeFormsInfo.map(async (formInfo) => {
                try {
                    // findLatestTemplateByKey sudah diubah untuk return null jika tidak ada
                    const latestForm = await this.formsService.findLatestTemplateByKey(formInfo.formKey);
                    if (!latestForm) {
                        console.warn(`Form template with key ${formInfo.formKey} not found for service ${serviceId}.`);
                        return null;
                    }
                    return {
                        order: formInfo.order,
                        form: latestForm, // Mengembalikan seluruh objek template form
                    };
                } catch (error) {
                    console.error(`Error processing formKey ${formInfo.formKey} for service ${serviceId}: ${error.message}`);
                    return null;
                }
            })
        );

        return populatedForms.filter(pf => pf !== null);
    }
}