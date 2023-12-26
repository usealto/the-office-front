import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidatorsService {
  requiredValidator(errorMsg?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value ? null : { error: errorMsg ?? 'Field is required' };
    };
  }

  minLengthValidator(length: number, errorMsg?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.length >= length ? null : { error: errorMsg ?? 'Cannot be empty' };
    };
  }
}
