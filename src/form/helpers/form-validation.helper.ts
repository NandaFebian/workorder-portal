import { UnprocessableEntityException } from '@nestjs/common';
import { FormField } from '../schemas/form-field.schema';
import { FieldType } from '../../common/enums/field-type.enum';

/**
 * Validates a field value against its form field definition
 * For single_select and multi_select fields, ensures that submitted values are valid keys
 *
 * @param field - The form field definition from the template
 * @param value - The submitted value to validate
 * @param fieldOrder - The order of the field (for error messages)
 * @throws UnprocessableEntityException if validation fails
 */
export function validateFieldValue(
  field: FormField,
  value: any,
  fieldOrder: number,
): void {
  // Validate single_select fields
  if (field.type === FieldType.SingleSelect) {
    if (!field.options || field.options.length === 0) {
      throw new UnprocessableEntityException(
        `Field at order ${fieldOrder} (${field.label}) has no options defined`,
      );
    }

    const validKeys = field.options.map((opt) => opt.key);

    if (!validKeys.includes(value)) {
      throw new UnprocessableEntityException(
        `Invalid key "${value}" for field "${field.label}" (order ${fieldOrder}). Valid keys: ${validKeys.join(', ')}`,
      );
    }
  }

  // Validate number fields against their optional min/max bounds
  if (field.type === FieldType.Number) {
    const numValue = typeof value === 'number' ? value : Number(value);

    if (typeof value === 'boolean' || Number.isNaN(numValue)) {
      throw new UnprocessableEntityException(
        `Field "${field.label}" (order ${fieldOrder}) must be a valid number`,
      );
    }

    if (typeof field.min === 'number' && numValue < field.min) {
      throw new UnprocessableEntityException(
        `Value ${numValue} for field "${field.label}" (order ${fieldOrder}) is below the allowed minimum of ${field.min}`,
      );
    }

    if (typeof field.max === 'number' && numValue > field.max) {
      throw new UnprocessableEntityException(
        `Value ${numValue} for field "${field.label}" (order ${fieldOrder}) exceeds the allowed maximum of ${field.max}`,
      );
    }
  }

  // Validate multi_select fields
  if (field.type === FieldType.MultiSelect) {
    if (!Array.isArray(value)) {
      throw new UnprocessableEntityException(
        `Field "${field.label}" (order ${fieldOrder}) must be an array for multi_select type`,
      );
    }

    if (!field.options || field.options.length === 0) {
      throw new UnprocessableEntityException(
        `Field at order ${fieldOrder} (${field.label}) has no options defined`,
      );
    }

    const validKeys = field.options.map((opt) => opt.key);
    const invalidKeys = value.filter((v: any) => !validKeys.includes(v));

    if (invalidKeys.length > 0) {
      throw new UnprocessableEntityException(
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
 * @throws UnprocessableEntityException if any field validation fails
 */
export function validateFormSubmission(
  templateFields: FormField[],
  submittedFields: Array<{ order: number; value: any }>,
): void {
  const errorsAcc: Record<string, string>[] = [];
  const submittedOrders = submittedFields.map((f) => f.order);

  // 1. Check for missing or empty required fields
  for (const tField of templateFields) {
    if (tField.required) {
      const submission = submittedFields.find((f) => f.order === tField.order);
      const isMissing = !submittedOrders.includes(tField.order);
      const isEmpty =
        submission &&
        (submission.value === null ||
          submission.value === undefined ||
          submission.value === '' ||
          (Array.isArray(submission.value) && submission.value.length === 0));

      if (isMissing || isEmpty) {
        errorsAcc.push({
          [tField.label || 'unknown']: `Field "${tField.label}" is required`,
        });
      }
    }
  }

  // 2. Validate values of submitted fields
  for (const submittedField of submittedFields) {
    const templateField = templateFields.find(
      (f) => f.order === submittedField.order,
    );

    if (!templateField) {
      errorsAcc.push({
        [`order_${submittedField.order}`]: `Field with order ${submittedField.order} not found in form template`,
      });
      continue;
    }

    // Only validate non-empty values (empty required fields are already handled above)
    if (
      submittedField.value !== null &&
      submittedField.value !== undefined &&
      submittedField.value !== ''
    ) {
      try {
        validateFieldValue(
          templateField,
          submittedField.value,
          submittedField.order,
        );
      } catch (e: any) {
        if (e instanceof UnprocessableEntityException) {
          errorsAcc.push({ [templateField.label || 'unknown']: e.message });
        } else {
          throw e;
        }
      }
    }
  }

  if (errorsAcc.length > 0) {
    throw new UnprocessableEntityException({
      message: 'Validation failed',
      errors: { field: errorsAcc },
    });
  }
}
