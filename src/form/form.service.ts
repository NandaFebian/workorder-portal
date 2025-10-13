// src/forms/forms.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormTemplate, FormTemplateDocument } from './schemas/form-template.schema';
import { FormSubmission, FormSubmissionDocument } from './schemas/form-submissions.schema';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class FormsService {
    constructor(
        @InjectModel(FormTemplate.name) private formTemplateModel: Model<FormTemplateDocument>,
        @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    ) { }

    async createTemplate(dto: CreateFormTemplateDto) {
        const newTemplate = new this.formTemplateModel(dto);
        return newTemplate.save();
    }

    async findAllTemplates() {
        return this.formTemplateModel.find().exec();
    }

    async findTemplateById(id: string) {
        const template = await this.formTemplateModel.findById(id).exec();
        if (!template) {
            throw new NotFoundException(`Form template with ID ${id} not found`);
        }
        return template;
    }

    // Method to update a form template
    async updateTemplate(id: string, dto: UpdateFormTemplateDto): Promise<FormTemplateDocument> {
        const existingTemplate = await this.formTemplateModel
            .findByIdAndUpdate(id, dto, { new: true }) // { new: true } returns the updated document
            .exec();

        if (!existingTemplate) {
            throw new NotFoundException(`Form template with ID ${id} not found`);
        }
        return existingTemplate;
    }

    async submitForm(user: AuthenticatedUser, dto: SubmitFormDto) {
        // Validasi apakah template-nya ada
        const template = await this.findTemplateById(dto.formTemplateId);

        // (Opsional) Tambahkan validasi di sini untuk memastikan semua field yang
        // required di template ada di dalam `dto.answers`

        const submission = new this.formSubmissionModel({
            ...dto,
            submittedById: user._id,
        });

        return submission.save();
    }
}