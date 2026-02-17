// lib/validators.ts
import validator from 'validator';
import { ValidationError } from './types';
import { SYSTEM_FIELDS } from './system-fields';

export function validateEmail(email: string): boolean {
  if (!email) return false;
  return validator.isEmail(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  // Must have at least 10 digits
  return digitsOnly.length >= 10;
}

export function validateRequired(value: string): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Validate a single row based on mapped fields
 */
export function validateRow(
  row: Record<string, any>,
  mapping: Record<string, string>
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Check required fields
  const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);

  // for (const field of requiredFields) {
  //   const value = row[field.key];

  //   if (!validateRequired(value)) {
  //     errors.push({
  //       field: field.key,
  //       message: `${field.label} is required`,
  //       value,
  //     });
  //   }
  // }

  // Validate email format
  if (row.email && !validateEmail(row.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      value: row.email,
    });
  }

  // Validate phone format
  if (row.phone && !validatePhone(row.phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format',
      value: row.phone,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Batch validate multiple rows
 */
export function validateRows(
  rows: Record<string, any>[],
  mapping: Record<string, string>
): Array<{ row: Record<string, any>; isValid: boolean; errors: ValidationError[] }> {
  return rows.map((row) => {
    const validation = validateRow(row, mapping);
    return {
      row,
      isValid: validation.isValid,
      errors: validation.errors,
    };
  });
}