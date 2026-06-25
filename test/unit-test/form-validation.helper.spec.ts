import { UnprocessableEntityException } from '@nestjs/common';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';

/**
 * Unit test untuk validasi field bertipe `number` pada submission formulir.
 * Memverifikasi bahwa nilai number divalidasi terhadap batas min/max yang
 * dikonfigurasi pada template field.
 */
describe('FormValidationHelper - Number Field', () => {
  const numberField: any = {
    order: 1,
    label: 'Jumlah Unit',
    type: 'number',
    required: true,
    min: 10,
    max: 100,
  };

  it('UT-FORM-001: Number dalam rentang min-max → lolos validasi', () => {
    expect(() =>
      validateFormSubmission([numberField], [{ order: 1, value: 50 }]),
    ).not.toThrow();
  });

  it('UT-FORM-002: Number melebihi batas maksimal → throw UnprocessableEntity', () => {
    expect(() =>
      validateFormSubmission([numberField], [{ order: 1, value: 150 }]),
    ).toThrow(UnprocessableEntityException);
  });

  it('UT-FORM-003: Number di bawah batas minimal → throw UnprocessableEntity', () => {
    expect(() =>
      validateFormSubmission([numberField], [{ order: 1, value: 5 }]),
    ).toThrow(UnprocessableEntityException);
  });

  it('UT-FORM-004: Nilai bukan angka (non-numeric) → throw UnprocessableEntity', () => {
    expect(() =>
      validateFormSubmission([numberField], [{ order: 1, value: 'abc' }]),
    ).toThrow(UnprocessableEntityException);
  });

  // ─── Field single_select ───

  const singleSelectField: any = {
    order: 2,
    label: 'Prioritas',
    type: 'single_select',
    required: false,
    options: [
      { key: 'low', value: 'Rendah' },
      { key: 'high', value: 'Tinggi' },
    ],
  };

  it('UT-FORM-005: single_select dengan key valid → lolos validasi', () => {
    expect(() =>
      validateFormSubmission([singleSelectField], [{ order: 2, value: 'low' }]),
    ).not.toThrow();
  });

  it('UT-FORM-006: single_select dengan key tidak valid → throw UnprocessableEntity', () => {
    expect(() =>
      validateFormSubmission([singleSelectField], [{ order: 2, value: 'urgent' }]),
    ).toThrow(UnprocessableEntityException);
  });

  // ─── Field multi_select ───

  const multiSelectField: any = {
    order: 3,
    label: 'Kategori',
    type: 'multi_select',
    required: false,
    options: [
      { key: 'a', value: 'A' },
      { key: 'b', value: 'B' },
    ],
  };

  it('UT-FORM-007: multi_select dengan seluruh key valid → lolos validasi', () => {
    expect(() =>
      validateFormSubmission([multiSelectField], [{ order: 3, value: ['a', 'b'] }]),
    ).not.toThrow();
  });

  it('UT-FORM-008: multi_select dengan key tidak valid → throw UnprocessableEntity', () => {
    expect(() =>
      validateFormSubmission([multiSelectField], [{ order: 3, value: ['a', 'z'] }]),
    ).toThrow(UnprocessableEntityException);
  });

  it('UT-FORM-009: multi_select dengan nilai bukan array → throw UnprocessableEntity', () => {
    expect(() =>
      validateFormSubmission([multiSelectField], [{ order: 3, value: 'a' }]),
    ).toThrow(UnprocessableEntityException);
  });

  // ─── Field wajib (required) ───

  it('UT-FORM-010: Field wajib tidak diisi → throw UnprocessableEntity', () => {
    expect(() => validateFormSubmission([numberField], [])).toThrow(
      UnprocessableEntityException,
    );
  });
});
