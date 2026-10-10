import { FormControl } from '@angular/forms';
import {
  taxIdValidator,
  routingNumberValidator,
  accountNumberValidator,
  phoneValidator,
  urlValidator,
  positiveNumberValidator,
} from './application.validators';

function ctrl(value: string | number | null) {
  return new FormControl(value) as FormControl;
}

describe('Application Validators', () => {

  describe('taxIdValidator', () => {
    it('should pass for valid format XX-XXXXXXX', () => {
      expect(taxIdValidator(ctrl('12-3456789'))).toBeNull();
    });

    it('should fail for missing hyphen', () => {
      expect(taxIdValidator(ctrl('123456789'))).toEqual({ taxIdFormat: true });
    });

    it('should fail for letters', () => {
      expect(taxIdValidator(ctrl('AB-CDEFGHI'))).toEqual({ taxIdFormat: true });
    });

    it('should fail for empty string', () => {
      expect(taxIdValidator(ctrl(''))).toEqual({ taxIdFormat: true });
    });

    it('should fail for wrong digit count', () => {
      expect(taxIdValidator(ctrl('1-234567'))).toEqual({ taxIdFormat: true });
    });
  });

  describe('routingNumberValidator', () => {
    it('should pass for exactly 9 digits', () => {
      expect(routingNumberValidator(ctrl('021000021'))).toBeNull();
    });

    it('should fail for 8 digits', () => {
      expect(routingNumberValidator(ctrl('02100002'))).toEqual({ routingFormat: true });
    });

    it('should fail for 10 digits', () => {
      expect(routingNumberValidator(ctrl('0210000211'))).toEqual({ routingFormat: true });
    });

    it('should fail for letters', () => {
      expect(routingNumberValidator(ctrl('02100002A'))).toEqual({ routingFormat: true });
    });

    it('should fail for empty string', () => {
      expect(routingNumberValidator(ctrl(''))).toEqual({ routingFormat: true });
    });
  });

  describe('accountNumberValidator', () => {
    it('should pass for 8 digits (minimum)', () => {
      expect(accountNumberValidator(ctrl('12345678'))).toBeNull();
    });

    it('should pass for 17 digits (maximum)', () => {
      expect(accountNumberValidator(ctrl('12345678901234567'))).toBeNull();
    });

    it('should fail for 7 digits', () => {
      expect(accountNumberValidator(ctrl('1234567'))).toEqual({ accountFormat: true });
    });

    it('should fail for 18 digits', () => {
      expect(accountNumberValidator(ctrl('123456789012345678'))).toEqual({ accountFormat: true });
    });

    it('should fail for letters', () => {
      expect(accountNumberValidator(ctrl('1234567A'))).toEqual({ accountFormat: true });
    });
  });

  describe('phoneValidator', () => {
    it('should pass for US format +1-555-1234', () => {
      expect(phoneValidator(ctrl('+1-555-1234'))).toBeNull();
    });

    it('should pass for simple digits', () => {
      expect(phoneValidator(ctrl('5551234567'))).toBeNull();
    });

    it('should pass for international format', () => {
      expect(phoneValidator(ctrl('+44 20 7946 0958'))).toBeNull();
    });

    it('should fail for too short input', () => {
      expect(phoneValidator(ctrl('123'))).toEqual({ phoneFormat: true });
    });

    it('should fail for empty string', () => {
      expect(phoneValidator(ctrl(''))).toEqual({ phoneFormat: true });
    });
  });

  describe('urlValidator', () => {
    it('should pass for valid https URL', () => {
      expect(urlValidator(ctrl('https://example.com'))).toBeNull();
    });

    it('should pass for http URL', () => {
      expect(urlValidator(ctrl('http://example.com/path'))).toBeNull();
    });

    it('should return null for empty string (optional field)', () => {
      expect(urlValidator(ctrl(''))).toBeNull();
    });

    it('should fail for URL without protocol', () => {
      expect(urlValidator(ctrl('example.com'))).toEqual({ urlFormat: true });
    });

    it('should fail for plain text', () => {
      expect(urlValidator(ctrl('not a url'))).toEqual({ urlFormat: true });
    });
  });

  describe('positiveNumberValidator', () => {
    it('should pass for positive integer', () => {
      expect(positiveNumberValidator(ctrl(100))).toBeNull();
    });

    it('should pass for positive decimal', () => {
      expect(positiveNumberValidator(ctrl(0.01))).toBeNull();
    });

    it('should fail for zero', () => {
      expect(positiveNumberValidator(ctrl(0))).toEqual({ positiveNumber: true });
    });

    it('should fail for negative number', () => {
      expect(positiveNumberValidator(ctrl(-5))).toEqual({ positiveNumber: true });
    });

    it('should fail for null', () => {
      expect(positiveNumberValidator(ctrl(null))).toEqual({ positiveNumber: true });
    });

    it('should fail for non-numeric string', () => {
      expect(positiveNumberValidator(ctrl('abc' as any))).toEqual({ positiveNumber: true });
    });
  });

});
