'use client';

import { useState, useCallback } from 'react';

type ValidationRule<T> = {
  validate: (value: T, formValues?: Record<string, unknown>) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export default function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle field changes
  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field on change if it's been touched
    if (touched[field]) {
      validateField(field, value);
    }
  }, [touched]);

  // Mark field as touched on blur
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  }, [values]);

  // Validate a single field
  const validateField = useCallback((field: keyof T, value: unknown) => {
    const fieldRules = validationRules[field] || [];
    
    for (const rule of fieldRules) {
      if (!rule.validate(value as T[typeof field], values)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }
    
    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    return true;
  }, [values, validationRules]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: ValidationErrors<T> = {};
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);
    
    // Validate each field
    for (const field in validationRules) {
      const fieldKey = field as keyof T;
      const fieldRules = validationRules[fieldKey] || [];
      
      for (const rule of fieldRules) {
        if (!rule.validate(values[fieldKey] as T[typeof fieldKey], values)) {
          newErrors[fieldKey] = rule.message;
          isValid = false;
          break;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    try {
      if (validateForm()) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Set a specific form value
  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    validateField,
    resetForm,
    setValue
  };
}

// Common validation rules
export const validators = {
  required: <T,>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(value);
    },
    message
  }),
  
  minLength: (length: number, message = `Must be at least ${length} characters`): ValidationRule<string> => ({
    validate: (value) => value.length >= length,
    message
  }),
  
  maxLength: (length: number, message = `Must be at most ${length} characters`): ValidationRule<string> => ({
    validate: (value) => value.length <= length,
    message
  }),
  
  matches: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message
  }),
  
  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: (value) => {
      try {
        // Empty string is considered valid (use required validator if needed)
        if (!value) return true;
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  }),
  
  sameAs: <T,>(field: string, message = 'Fields do not match'): ValidationRule<T> => ({
    validate: (value, formValues) => {
      return formValues !== undefined && value === formValues[field];
    },
    message
  })
}; 