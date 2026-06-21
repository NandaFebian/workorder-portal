// src/form/form.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './form.service';
import { getModelToken } from '@nestjs/mongoose';
import { FormTemplate } from './schemas/form-template.schema';
import { FormSubmission } from '../service/schemas/form-submission.schema';
import { CompaniesInternalService } from '../company/companies.internal.service';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as formValidationHelper from './helpers/form-validation.helper';

describe('FormsService', () => {
  let service: FormsService;
  let formTemplateModel: any;
  let formSubmissionModel: any;
  let companiesService: CompaniesInternalService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'user@test.com',
    role: 'owner_company',
    company: {
      _id: '507f1f77bcf86cd799439012',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        {
          provide: getModelToken(FormTemplate.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(FormSubmission.name),
          useValue: jest.fn().mockImplementation((data) => {
            const saveMock = jest.fn().mockImplementation(() =>
              Promise.resolve({ ...data, save: saveMock }),
            );
            return { ...data, save: saveMock };
          }),
        },
        {
          provide: CompaniesInternalService,
          useValue: {
            findInternalById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FormsService>(FormsService);
    formTemplateModel = module.get(getModelToken(FormTemplate.name));
    formSubmissionModel = module.get(getModelToken(FormSubmission.name));
    companiesService = module.get<CompaniesInternalService>(
      CompaniesInternalService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitForm()', () => {
    const mockTemplate = {
      _id: '507f1f77bcf86cd799439020',
      formKey: 'FORM-001',
      formType: 'work_order',
      companyId: '507f1f77bcf86cd799439012',
      fields: [
        { order: 1, label: 'Name', type: 'text', required: true },
        { order: 2, label: 'Age', type: 'number', required: false },
      ],
    };

    const mockCompany = {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Company',
      ownerId: { _id: '507f1f77bcf86cd799439030' },
    };

    it('UT-FRM-001: should submit form with all valid fields', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockTemplate);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(companiesService, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {});

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [
          { order: 1, value: 'John Doe' },
          { order: 2, value: 25 },
        ],
      };

      // Act
      const result = await service.submitForm(mockUser as any, submissionDto);

      // Assert
      expect(formTemplateModel.findOne).toHaveBeenCalledWith({
        _id: submissionDto.formId,
        deletedAt: null,
      });
      expect(formValidationHelper.validateFormSubmission).toHaveBeenCalledWith(
        mockTemplate.fields,
        submissionDto.fieldsData,
      );
      expect(result.save).toHaveBeenCalled();
    });

    it('UT-FRM-002: should validate text field correctly', async () => {
      // Arrange
      const templateWithTextField = {
        ...mockTemplate,
        fields: [{ order: 1, label: 'Name', type: 'text', required: true }],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithTextField);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(companiesService, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      const validateSpy = jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {});

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [{ order: 1, value: 'Valid Text' }],
      };

      // Act
      await service.submitForm(mockUser as any, submissionDto);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith(
        templateWithTextField.fields,
        submissionDto.fieldsData,
      );
    });

    it('UT-FRM-003: should validate number field correctly', async () => {
      // Arrange
      const templateWithNumberField = {
        ...mockTemplate,
        fields: [{ order: 1, label: 'Age', type: 'number', required: true }],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithNumberField);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(companiesService, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      const validateSpy = jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {});

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [{ order: 1, value: 25 }],
      };

      // Act
      await service.submitForm(mockUser as any, submissionDto);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith(
        templateWithNumberField.fields,
        submissionDto.fieldsData,
      );
    });

    it('UT-FRM-004: should throw UnprocessableEntityException for invalid type on number field', async () => {
      // Arrange
      const templateWithNumberField = {
        ...mockTemplate,
        fields: [{ order: 1, label: 'Age', type: 'number', required: true }],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithNumberField);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {
          throw new UnprocessableEntityException(
            'Invalid type for number field',
          );
        });

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [{ order: 1, value: 'not a number' }],
      };

      // Act & Assert
      await expect(
        service.submitForm(mockUser as any, submissionDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('UT-FRM-005: should throw UnprocessableEntityException when required field is missing', async () => {
      // Arrange
      const templateWithRequiredField = {
        ...mockTemplate,
        fields: [{ order: 1, label: 'Name', type: 'text', required: true }],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithRequiredField);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {
          throw new UnprocessableEntityException('Required field missing');
        });

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [], // Missing required field
      };

      // Act & Assert
      await expect(
        service.submitForm(mockUser as any, submissionDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('UT-FRM-006: should validate single_select with valid option', async () => {
      // Arrange
      const templateWithSelect = {
        ...mockTemplate,
        fields: [
          {
            order: 1,
            label: 'Choice',
            type: 'single_select',
            required: true,
            options: ['A', 'B', 'C'],
          },
        ],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithSelect);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(companiesService, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      const validateSpy = jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {});

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [{ order: 1, value: 'A' }],
      };

      // Act
      await service.submitForm(mockUser as any, submissionDto);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith(
        templateWithSelect.fields,
        submissionDto.fieldsData,
      );
    });

    it('UT-FRM-007: should throw UnprocessableEntityException for invalid single_select option', async () => {
      // Arrange
      const templateWithSelect = {
        ...mockTemplate,
        fields: [
          {
            order: 1,
            label: 'Choice',
            type: 'single_select',
            required: true,
            options: ['A', 'B'],
          },
        ],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithSelect);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {
          throw new UnprocessableEntityException(
            'Invalid option for single_select',
          );
        });

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [{ order: 1, value: 'C' }], // Invalid option
      };

      // Act & Assert
      await expect(
        service.submitForm(mockUser as any, submissionDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('UT-FRM-008: should validate multi_select with valid options', async () => {
      // Arrange
      const templateWithMultiSelect = {
        ...mockTemplate,
        fields: [
          {
            order: 1,
            label: 'Choices',
            type: 'multi_select',
            required: true,
            options: ['A', 'B', 'C'],
          },
        ],
      };
      const mockExec = jest.fn().mockResolvedValue(templateWithMultiSelect);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(companiesService, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      const validateSpy = jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {});

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [{ order: 1, value: ['A', 'B'] }],
      };

      // Act
      await service.submitForm(mockUser as any, submissionDto);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith(
        templateWithMultiSelect.fields,
        submissionDto.fieldsData,
      );
    });

    it('UT-FRM-009: should match fields by order correctly', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockTemplate);
      formTemplateModel.findOne.mockReturnValue({ exec: mockExec });
      jest
        .spyOn(companiesService, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(formValidationHelper, 'validateFormSubmission')
        .mockImplementation(() => {});

      const submissionDto = {
        formId: '507f1f77bcf86cd799439020',
        fieldsData: [
          { order: 1, value: 'John' },
          { order: 2, value: 30 },
        ],
      };

      // Act
      const result = await service.submitForm(mockUser as any, submissionDto);

      // Assert
      expect(result.fieldsData).toEqual([
        { order: 1, value: 'John' },
        { order: 2, value: 30 },
      ]);
    });
  });
});
