import { AbstractControl, ValidationErrors } from '@angular/forms';

export function taxIdValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  return /^\d{2}-\d{7}$/.test(val) ? null : { taxIdFormat: true };
}

export function routingNumberValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  return /^\d{9}$/.test(val) ? null : { routingFormat: true };
}

export function accountNumberValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  return /^\d{8,17}$/.test(val) ? null : { accountFormat: true };
}

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  return /^\+?[\d\s\-().]{7,20}$/.test(val) ? null : { phoneFormat: true };
}

export function urlValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null;
  try {
    new URL(val);
    return null;
  } catch {
    return { urlFormat: true };
  }
}

export function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  const val = Number(control.value);
  return !isNaN(val) && val > 0 ? null : { positiveNumber: true };
}
