'use client';

import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

type InputType = 
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'url'
  | 'textarea';

interface FormFieldProps {
  id: string;
  label: string;
  type?: InputType;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  rows?: number;
  helperText?: string;
}

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder,
    autoComplete,
    className = '',
    min,
    max,
    disabled = false,
    rows = 3,
    helperText,
    ...props
  }, ref) => {
    const [focused, setFocused] = useState(false);
    const isTextarea = type === 'textarea';
    
    // Add strong focus indicators for keyboard users
    const focusRingClass = focused 
      ? 'ring-2 ring-blue-500 ring-opacity-50' 
      : 'ring-0';

    const inputClass = `
      w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} 
      rounded-lg px-4 py-2 text-white ${focusRingClass} outline-none
      placeholder:text-gray-500 transition-all duration-200
      disabled:opacity-60 disabled:cursor-not-allowed
      backdrop-blur-sm
    `;

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    // Handle the error state for ARIA
    const errorId = error ? `${id}-error` : undefined;
    const helperId = !error && helperText ? `${id}-help` : undefined;
    const describedById = errorId || helperId;

    return (
      <div className={`mb-4 ${className}`}>
        {/* Label with required indicator */}
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        
        {/* Input or Textarea based on type */}
        {isTextarea ? (
          <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            className={inputClass}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-describedby={describedById}
            aria-required={required}
            {...props}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            min={min}
            max={max}
            required={required}
            disabled={disabled}
            ref={ref as React.RefObject<HTMLInputElement>}
            className={inputClass}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-describedby={describedById}
            aria-required={required}
            {...props}
          />
        )}
        
        {/* Error message with animation */}
        {error && (
          <motion.div
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1"
          >
            <p className="text-sm text-red-400" role="alert">{error}</p>
          </motion.div>
        )}
        
        {/* Helper text */}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-xs text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField; 