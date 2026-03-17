import { BadRequestException } from '@nestjs/common';
import { FormField } from '../schemas/form-field.schema';

/**
 * Validates a field value against its form field definition
 * For single_select and multi_select fields, ensures that submitted values are valid keys
 *
 * @param field - The form field definition from the template
 * @param value - The submitted value to validate
 * @param fieldOrder - The order of the field (for error messages)
 * @throws BadRequestException if validation fails
 */
export function validateFieldValue(
  field: FormField,
  value: any,
  fieldOrder: number,
): void {
  // Validate single_select fields
  if (field.type === 'single_select') {
    if (!field.options || field.options.length === 0) {
      throw new BadRequestException(
        `Field at order ${fieldOrder} (${field.label}) has no options defined`,
      );
    }

    const validKeys = field.options.map((opt) => opt.key);

    if (!validKeys.includes(value)) {
      throw new BadRequestException(
        `Invalid key "${value}" for field "${field.label}" (order ${fieldOrder}). Valid keys: ${validKeys.join(', ')}`,
      );
    }
  }

  // Validate multi_select fields
  if (field.type === 'multi_select') {
    if (!Array.isArray(value)) {
      throw new BadRequestException(
        `Field "${field.label}" (order ${fieldOrder}) must be an array for multi_select type`,
      );
    }

    if (!field.options || field.options.length === 0) {
      throw new BadRequestException(
        `Field at order ${fieldOrder} (${field.label}) has no options defined`,
      );
    }

    const validKeys = field.options.map((opt) => opt.key);
    const invalidKeys = value.filter((v: any) => !validKeys.includes(v));

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid keys for field "${field.label}" (order ${fieldOrder}): ${invalidKeys.join(', ')}. Valid keys: ${validKeys.join(', ')}`,
      );
    }
  }
}

/**
 * Validates all fields in a submission against the form template
 *
 * @param templateFields - Array of form fields from the template
 * @param submittedFields - Array of submitted field data with order and value
 * @throws BadRequestException if any field validation fails
 */
export function validateFormSubmission(
  templateFields: FormField[],
  submittedFields: Array<{ order: number; value: any }>,
): void {
  for (const submittedField of submittedFields) {
    const templateField = templateFields.find(
      (f) => f.order === submittedField.order,
    );

    if (!templateField) {
      throw new BadRequestException(
        `Field with order ${submittedField.order} not found in form template`,
      );
    }

    // Validate the field value
    validateFieldValue(
      templateField,
      submittedField.value,
      submittedField.order,
    );
  }
}
