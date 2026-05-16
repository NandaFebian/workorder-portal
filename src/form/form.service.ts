// src/form/form.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FormTemplate,
  FormTemplateDocument,
} from './schemas/form-template.schema';
import {
  FormSubmission,
  FormSubmissionDocument,
} from './schemas/form-submissions.schema';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { CompaniesInternalService } from 'src/company/companies.internal.service';
import { validateFormSubmission } from './helpers/form-validation.helper';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(FormTemplate.name)
    private formTemplateModel: Model<FormTemplateDocument>,
    @InjectModel(FormSubmission.name)
    private formSubmissionModel: Model<FormSubmissionDocument>,
    private companiesInternalService: CompaniesInternalService,
  ) { }

  async createTemplate(
    dto: CreateFormTemplateDto,
    user: AuthenticatedUser,
  ): Promise<FormTemplateDocument> {
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

  async findAllTemplates(
    user: AuthenticatedUser,
  ): Promise<FormTemplateDocument[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    return this.formTemplateModel.aggregate([
      { $match: { companyId: user.company._id } },
      { $sort: { __v: -1 } },
      {
        $group: {
          _id: '$formKey',
          latest_doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$latest_doc' } },
      { $match: { deletedAt: null } },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async findTemplateById(
    id: string,
    user?: AuthenticatedUser,
  ): Promise<FormTemplateDocument> {
    const template = await this.formTemplateModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!template) {
      throw new NotFoundException(`Form template with ID ${id} not found`);
    }
    // Enforce company scope for non-admin company users
    if (user && user.role !== 'admin_app') {
      if (!user.company?._id) {
        throw new ForbiddenException('User is not associated with any company.');
      }
      if (template.companyId.toString() !== user.company._id.toString()) {
        // Return 404 to avoid leaking existence of other company's forms
        throw new NotFoundException(`Form template with ID ${id} not found`);
      }
    }
    return template;
  }

  async updateTemplate(
    formId: string,
    dto: UpdateFormTemplateDto,
    user: AuthenticatedUser,
  ): Promise<FormTemplateDocument> {
    // Department Manager can only create forms, not update
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      throw new ForbiddenException(
        'Department managers are not allowed to update form templates.',
      );
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Payload for update cannot be empty');
    }

    if (!Types.ObjectId.isValid(formId)) {
      throw new NotFoundException('Invalid form template ID');
    }

    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const existingForm = await this.formTemplateModel
      .findOne({
        _id: new Types.ObjectId(formId),
        companyId: user.company._id,
        deletedAt: null,
      })
      .exec();

    if (!existingForm) {
      throw new NotFoundException(`Form template with ID ${formId} not found`);
    }

    const latestVersion = (await this.formTemplateModel
      .findOne({ formKey: existingForm.formKey, companyId: user.company._id })
      .sort({ __v: -1 })
      .exec()) as any;

    if (latestVersion && latestVersion._id.toString() !== formId) {
      throw new UnprocessableEntityException(
        `Cannot edit this form template. A newer version exists. Please refresh to edit the latest version.`,
      );
    }

    const newVersionData = {
      ...existingForm.toObject(),
      ...dto,
      _id: undefined,
      __v: existingForm.__v + 1,
    };

    const newVersion = new this.formTemplateModel(newVersionData);
    return newVersion.save();
  }

  async submitForm(
    user: AuthenticatedUser,
    dto: { formId: string; fieldsData: any[] },
  ): Promise<FormSubmissionDocument> {
    const template = await this.formTemplateModel
      .findOne({ _id: dto.formId, deletedAt: null })
      .exec();
    if (!template) {
      throw new NotFoundException(
        `Form template with ID ${dto.formId} not found`,
      );
    }

    // Validate field values (especially for single_select and multi_select)
    validateFormSubmission(template.fields, dto.fieldsData);

    // Map fieldsData to schema format verifying order
    const fieldsData = dto.fieldsData.map((inputField) => {
      const templateField = template.fields.find(
        (f) => f.order === inputField.order,
      );
      if (!templateField) {
        // This should not happen as validateFormSubmission already checks this
        return {
          order: inputField.order,
          value: inputField.value,
        };
      }
      return {
        order: templateField.order,
        value: inputField.value,
      };
    });

    // Fetch Company to get Owner ID
    const company = await this.companiesInternalService.findInternalById(
      template.companyId.toString(),
    );
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

  async submitPublicForm(
    dto: { submissions: { formId: string; fieldsData: any[] }[] },
    serviceId: string,
  ): Promise<FormSubmissionDocument[]> {
    const results: FormSubmissionDocument[] = [];

    // Handle potentially missing submissions array
    const submissions = dto.submissions || [];

    for (const submissionDto of submissions) {
      const template = await this.formTemplateModel
        .findOne({ _id: submissionDto.formId, deletedAt: null })
        .exec();
      if (!template) {
        // We could throw here, or skip. Throwing is safer for data integrity.
        throw new NotFoundException(
          `Form template with ID ${submissionDto.formId} not found`,
        );
      }

      // Validate field values (especially for single_select and multi_select)
      validateFormSubmission(template.fields, submissionDto.fieldsData);

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

  async findLatestTemplateByKey(
    formKey: string,
  ): Promise<FormTemplateDocument> {
    const latestTemplate = await this.formTemplateModel
      .findOne({ formKey })
      .sort({ __v: -1 })
      .exec();

    if (!latestTemplate || latestTemplate.deletedAt !== null) {
      throw new NotFoundException(
        `Form template with key ${formKey} not found or has been deleted.`,
      );
    }
    return latestTemplate;
  }

  async removeByFormKey(
    formKey: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    // Find all versions with this formKey
    const templates = await this.formTemplateModel
      .find({
        formKey,
        companyId: user.company._id,
        deletedAt: null,
      })
      .exec();

    if (templates.length === 0) {
      throw new NotFoundException(
        `Form template with key ${formKey} not found`,
      );
    }

    // Soft delete all versions
    const updatePromises = templates.map((template) => {
      template.deletedAt = new Date();
      return template.save();
    });

    await Promise.all(updatePromises);
  }

  async removeById(
    id: string,
    user: AuthenticatedUser,
  ): Promise<any> {
    // Department Manager can only create forms, not delete
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      throw new ForbiddenException(
        'Department managers are not allowed to delete form templates.',
      );
    }

    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid form template ID');
    }

    // Find single form version by ID
    const template = await this.formTemplateModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: user.company._id,
        deletedAt: null,
      })
      .exec();

    if (!template) {
      throw new NotFoundException(`Form template with ID ${id} not found`);
    }

    // Check if it is the latest version
    const latestVersion = (await this.formTemplateModel
      .findOne({ formKey: template.formKey, companyId: user.company._id, deletedAt: null })
      .sort({ __v: -1 })
      .exec()) as any;

    if (latestVersion && latestVersion._id.toString() !== id) {
      throw new UnprocessableEntityException(
        'Hanya versi form terbaru yang dapat dihapus. Silakan muat ulang untuk mendapatkan versi terakhir.',
      );
    }

    // Capture data before deleting
    const deletedData = template.toObject();

    // Soft delete all versions with the same formKey
    const deletedAt = new Date();
    await this.formTemplateModel.updateMany(
      { formKey: template.formKey, companyId: user.company._id, deletedAt: null },
      { $set: { deletedAt } }
    );

    return { ...deletedData, deletedAt };
  }
}
