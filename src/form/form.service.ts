// src/form/form.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FormTemplate, FormTemplateDocument } from './schemas/form-template.schema';
import { FormSubmission, FormSubmissionDocument } from './schemas/form-submissions.schema';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { CompaniesInternalService } from 'src/company/companies.internal.service';

@Injectable()
export class FormsService {
    constructor(
        @InjectModel(FormTemplate.name) private formTemplateModel: Model<FormTemplateDocument>,
        @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
        private companiesInternalService: CompaniesInternalService,
    ) { }

    async createTemplate(dto: CreateFormTemplateDto, user: AuthenticatedUser): Promise<FormTemplateDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        const newTemplate = new this.formTemplateModel({
            ...dto,
            formKey: uuidv4(),
            companyId: user.company._id,
            __v: 0,
        });
        return newTemplate.save();
    }

    async findAllTemplates(user: AuthenticatedUser): Promise<FormTemplateDocument[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        return this.formTemplateModel.aggregate([
            { $match: { companyId: user.company._id, deletedAt: null } },
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$formKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } }
        ]);
    }

    async findTemplateById(id: string): Promise<FormTemplateDocument> {
        const template = await this.formTemplateModel.findOne({ _id: id, deletedAt: null }).exec();
        if (!template) {
            throw new NotFoundException(`Form template with ID ${id} not found`);
        }
        return template;
    }

    async updateTemplate(formKey: string, dto: UpdateFormTemplateDto, user: AuthenticatedUser): Promise<FormTemplateDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        const latestVersion = await this.formTemplateModel.findOne({
            formKey,
            companyId: user.company._id,
            deletedAt: null
        }).sort({ __v: -1 }).exec();

        if (!latestVersion) {
            throw new NotFoundException(`Form with key ${formKey} not found`);
        }

        const newVersionData = {
            ...latestVersion.toObject(),
            ...dto,
            _id: undefined,
            __v: latestVersion.__v + 1,
        };

        const newVersion = new this.formTemplateModel(newVersionData);
        return newVersion.save();
    }

    async submitForm(user: AuthenticatedUser, dto: { formId: string; fieldsData: any[] }): Promise<FormSubmissionDocument> {
        const template = await this.formTemplateModel.findOne({ _id: dto.formId, deletedAt: null }).exec();
        if (!template) {
            throw new NotFoundException(`Form template with ID ${dto.formId} not found`);
        }

        // Map fieldsData to schema format verifying order
        const fieldsData = dto.fieldsData.map(inputField => {
            const templateField = template.fields.find(f => f.order === inputField.order);
            if (!templateField) {
                // Determine if strict validation is needed. For now, we skip unknown fields or accept them?
                // Given the requirement "follow structure", we assume valid orders are sent.
                // We'll store it if it matches the DTO structure which is just order/value.
                return {
                    order: inputField.order,
                    value: inputField.value
                };
            }
            return {
                order: templateField.order,
                value: inputField.value
            };
        });

        // Fetch Company to get Owner ID
        const company = await this.companiesInternalService.findInternalById(template.companyId.toString());
        // ownerId is populated in findInternalById, so we need to extract _id.
        // Handles cases where ownerId might be populated or not (though service says it populates)
        const ownerId = (company.ownerId as any)._id || company.ownerId;

        const submission = new this.formSubmissionModel({
            submissionType: template.formType,
            ownerId: ownerId,
            formId: template._id,
            submittedById: user._id,
            fieldsData: fieldsData,
        });

        return submission.save();
    }

    async submitPublicForm(dto: { submissions: { formId: string, fieldsData: any[] }[] }, serviceId: string): Promise<FormSubmissionDocument[]> {
        const results: FormSubmissionDocument[] = [];

        // Handle potentially missing submissions array
        const submissions = dto.submissions || [];

        for (const submissionDto of submissions) {
            const template = await this.formTemplateModel.findOne({ _id: submissionDto.formId, deletedAt: null }).exec();
            if (!template) {
                // We could throw here, or skip. Throwing is safer for data integrity.
                throw new NotFoundException(`Form template with ID ${submissionDto.formId} not found`);
            }

            const submission = new this.formSubmissionModel({
                formId: submissionDto.formId,
                fieldsData: submissionDto.fieldsData,
                submittedById: null, // null untuk user publik
                relatedServiceId: serviceId ? new Types.ObjectId(serviceId) : undefined,
                companyId: template.companyId,
            });

            const saved = await submission.save();
            results.push(saved);
        }

        return results;
    }

    async findLatestTemplateByKey(formKey: string): Promise<FormTemplateDocument> {
        const latestTemplate = await this.formTemplateModel.findOne({
            formKey,
            deletedAt: null
        }).sort({ __v: -1 }).exec(); // Urutkan berdasarkan versi (__v) desc

        if (!latestTemplate) {
            throw new NotFoundException(`Form template with key ${formKey} not found`);
        }
        return latestTemplate;
    }

    async removeByFormKey(formKey: string, user: AuthenticatedUser): Promise<void> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        // Find all versions with this formKey
        const templates = await this.formTemplateModel.find({
            formKey,
            companyId: user.company._id,
            deletedAt: null
        }).exec();

        if (templates.length === 0) {
            throw new NotFoundException(`Form template with key ${formKey} not found`);
        }

        // Soft delete all versions
        const updatePromises = templates.map(template => {
            template.deletedAt = new Date();
            return template.save();
        });

        await Promise.all(updatePromises);
    }

    async removeById(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Invalid form template ID');
        }

        // Find single form version by ID
        const template = await this.formTemplateModel.findOne({
            _id: new Types.ObjectId(id),
            companyId: user.company._id,
            deletedAt: null
        }).exec();

        if (!template) {
            throw new NotFoundException(`Form template with ID ${id} not found`);
        }

        // Soft delete only this specific version
        const deletedAt = new Date();
        template.deletedAt = deletedAt;
        await template.save();

        return { deletedAt };
    }
}