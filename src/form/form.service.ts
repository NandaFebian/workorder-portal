import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormTemplate, FormTemplateDocument } from './schemas/form-template.schema';
import { FormSubmission, FormSubmissionDocument } from './schemas/form-submissions.schema';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FormsService {
    constructor(
        @InjectModel(FormTemplate.name) private formTemplateModel: Model<FormTemplateDocument>,
        @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    ) { }

    async createTemplate(dto: CreateFormTemplateDto, user: AuthenticatedUser): Promise<FormTemplateDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        const newTemplate = new this.formTemplateModel({
            ...dto,
            formKey: uuidv4(),
            companyId: user.company._id,
            __v: 0, // Versi awal adalah 0
        });
        return newTemplate.save();
    }

    async findAllTemplates(user: AuthenticatedUser): Promise<FormTemplateDocument[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        const latestVersions = await this.formTemplateModel.aggregate([
            { $match: { companyId: user.company._id } },
            // Gunakan __v untuk mengurutkan
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$formKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } }
        ]);

        return latestVersions;
    }

    async findTemplateById(id: string) {
        const template = await this.formTemplateModel.findById(id).exec();
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
            companyId: user.company._id
        }).sort({ __v: -1 }).exec(); // Urutkan berdasarkan __v

        if (!latestVersion) {
            throw new NotFoundException(`Form with key ${formKey} not found`);
        }

        const newVersionData = {
            ...latestVersion.toObject(),
            ...dto,
            _id: undefined,
            // Increment __v secara manual
            __v: latestVersion.__v + 1,
        };

        const newVersion = new this.formTemplateModel(newVersionData);
        return newVersion.save();
    }

    async submitForm(user: AuthenticatedUser, dto: SubmitFormDto) {
        const template = await this.formTemplateModel.findById(dto.formTemplateId).exec();
        if (!template) {
            throw new NotFoundException(`Form template with ID ${dto.formTemplateId} not found`);
        }

        const submission = new this.formSubmissionModel({
            ...dto,
            submittedById: user._id,
        });

        return submission.save();
    }
}