/**
 * Input validation utility
 * Provides reusable validation functions for API requests and forms
 */

// Common validation rules with regular expressions
const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^https?:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  ALPHA: /^[a-zA-Z\s]+$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9\s]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
};

// Error interface
export interface ValidationError {
  field: string;
  message: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Field validator interface
export interface FieldValidator {
  validate: (value: unknown, fieldName: string) => ValidationError | null;
}

/**
 * Validator class for validating objects against schemas
 */
export class Validator {
  private validators: Record<string, FieldValidator[]> = {};

  /**
   * Add a field validator
   */
  field(fieldName: string, ...validators: FieldValidator[]): Validator {
    if (!this.validators[fieldName]) {
      this.validators[fieldName] = [];
    }
    this.validators[fieldName].push(...validators);
    return this;
  }

  /**
   * Validate an object against the defined schema
   */
  validate(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];

    // Check each field that has validators
    for (const [fieldName, fieldValidators] of Object.entries(this.validators)) {
      const value = data[fieldName];
      
      // Apply all validators for this field
      for (const validator of fieldValidators) {
        const error = validator.validate(value, fieldName);
        if (error) {
          errors.push(error);
          break; // Stop on first error for this field
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validator builder - creates a new validator
 */
export function createValidator(): Validator {
  return new Validator();
}

// Define reusable field validators
export const Validators = {
  /**
   * Validates that a field is required (not null, undefined, or empty string)
   */
  required(message = 'This field is required'): FieldValidator {
    return {
      validate: (value, fieldName) => {
        if (value === null || value === undefined || value === '') {
          return { field: fieldName, message };
        }
        return null;
      },
    };
  },

  /**
   * Validates that a field matches a specific pattern
   */
  pattern(pattern: RegExp, message = 'Invalid format'): FieldValidator {
    return {
      validate: (value, fieldName) => {
        if (typeof value !== 'string' || !pattern.test(value)) {
          return { field: fieldName, message };
        }
        return null;
      },
    };
  },

  /**
   * Validates that a field is a string with a specific minimum length
   */
  minLength(min: number, message = `Must be at least ${min} characters`): FieldValidator {
    return {
      validate: (value, fieldName) => {
        if (typeof value !== 'string' || value.length < min) {
          return { field: fieldName, message };
        }
        return null;
      },
    };
  },

  /**
   * Validates that a field is a string with a specific maximum length
   */
  maxLength(max: number, message = `Must be no more than ${max} characters`): FieldValidator {
    return {
      validate: (value, fieldName) => {
        if (typeof value !== 'string' || value.length > max) {
          return { field: fieldName, message };
        }
        return null;
      },
    };
  },

  /**
   * Validates that a field is a number within a specific range
   */
  range(min: number, max: number, message = `Must be between ${min} and ${max}`): FieldValidator {
    return {
      validate: (value, fieldName) => {
        const num = Number(value);
        if (isNaN(num) || num < min || num > max) {
          return { field: fieldName, message };
        }
        return null;
      },
    };
  },

  /**
   * Validates that a field is a valid email
   */
  email(message = 'Invalid email address'): FieldValidator {
    return this.pattern(PATTERNS.EMAIL, message);
  },

  /**
   * Validates that a field is a valid URL
   */
  url(message = 'Invalid URL'): FieldValidator {
    return this.pattern(PATTERNS.URL, message);
  },

  /**
   * Validates that a field is a valid phone number
   */
  phone(message = 'Invalid phone number'): FieldValidator {
    return this.pattern(PATTERNS.PHONE, message);
  },

  /**
   * Validates that two fields match
   */
  matches(otherField: string, message = 'Fields do not match'): FieldValidator {
    return {
      validate: (_value, _fieldName) => {
        // This one needs access to the entire data object - will be implemented in a different way
        // For now, just a placeholder returning no error
        return null;
      },
    };
  },
};

// Export common patterns
export { PATTERNS }; 