/**
 * API Input Validation Middleware
 * 
 * This utility provides a middleware function to validate API requests against schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { Validator, ValidationResult } from '../utils/validator';

export interface ValidatorOptions {
  // If true, apply validation to query parameters instead of request body
  validateQuery?: boolean;
  // Custom status code to use for validation failures (default 400)
  errorStatusCode?: number;
  // Custom error message format function
  formatErrorResponse?: (result: ValidationResult) => Record<string, unknown>;
}

/**
 * Middleware function to validate API requests against a schema
 * 
 * @param validator The validator to use for schema validation
 * @param options Options for validation behavior
 * @returns A handler function that will validate the request
 */
export function validateSchema(validator: Validator, options: ValidatorOptions = {}) {
  const { 
    validateQuery = false,
    errorStatusCode = 400,
    formatErrorResponse = defaultErrorFormatter
  } = options;
  
  return async function validationHandler(request: NextRequest) {
    let dataToValidate: Record<string, unknown>;
    
    try {
      if (validateQuery) {
        // Extract query parameters
        const url = new URL(request.url);
        dataToValidate = Object.fromEntries(url.searchParams.entries());
      } else {
        // Extract request body
        try {
          dataToValidate = await request.json();
        } catch (_error) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }
      }
      
      // Validate the data against the schema
      const validationResult = validator.validate(dataToValidate);
      
      // If validation fails, return error response
      if (!validationResult.isValid) {
        return NextResponse.json(
          formatErrorResponse(validationResult),
          { status: errorStatusCode }
        );
      }
      
      // If validation succeeds, continue with the request
      return null;
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { error: 'Validation processing error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Default error response formatter
 */
function defaultErrorFormatter(result: ValidationResult): Record<string, unknown> {
  return {
    success: false,
    error: 'Validation failed',
    validationErrors: result.errors.map(err => ({
      field: err.field,
      message: err.message
    }))
  };
}

/**
 * Helper to create a validator and apply it to an API route
 * 
 * @param validatorBuilder Function that builds a validator
 * @param options Validation options
 * @returns Validation handler function
 */
export function withValidation(
  validatorBuilder: () => Validator,
  options: ValidatorOptions = {}
) {
  const validator = validatorBuilder();
  return validateSchema(validator, options);
} 