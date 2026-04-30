import { FormType } from '../../common/enums/form-type.enum';

class OptionResponseDto {
  key: string;
  value: string;
}

class FormFieldResponseDto {
  order: number;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: OptionResponseDto[];
  min?: number;
  max?: number;
}

export class FormTemplateResponseDto {
  _id: string;
  title: string;
  description?: string;
  formType: FormType;
  fields: FormFieldResponseDto[];
}
