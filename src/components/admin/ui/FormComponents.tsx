import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/components/admin/designSystem';

// Common interface for validation
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Input field props with validation
export interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number';
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  validate?: (value: string) => ValidationResult;
  helpText?: string;
  maxLength?: number;
  icon?: string;
}

// Textarea props with validation
export interface FormTextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  onChange?: (value: string) => void;
  validate?: (value: string) => ValidationResult;
  helpText?: string;
  maxLength?: number;
  error?: string;
}

// Toggle switch props
export interface FormToggleProps {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
  className?: string;
}

// Status message component props
export interface StatusMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

// Button props
export interface ButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

// Form section props
export interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Input Field Component
export function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  defaultValue,
  value,
  required = false,
  disabled = false,
  className = '',
  onChange,
  validate,
  helpText,
  maxLength,
  icon,
}: FormInputProps) {
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  
  // Handle value changes from parent
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    if (validate && touched) {
      setValidation(validate(newValue));
    }
  };
  
  // Validate on blur
  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      setValidation(validate(inputValue));
    }
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-2.5 bg-black/20 border rounded-lg focus:outline-none text-white transition-all
          ${validation.isValid 
            ? 'border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50' 
            : 'border-red-500/70 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/70'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      />
      
      <AnimatePresence>
        {helpText && (
          <motion.p
            key={`${id}-helptext`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 0.7, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-xs text-gray-400"
          >
            {helpText}
          </motion.p>
        )}
        
        {!validation.isValid && touched && validation.message && (
          <motion.p
            key={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-xs text-red-400"
          >
            {validation.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Textarea Component
export function FormTextarea({
  id,
  label,
  placeholder,
  defaultValue,
  value,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  onChange,
  validate,
  helpText,
  maxLength,
  error,
}: FormTextareaProps) {
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  
  // Handle value changes from parent
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    if (validate && touched) {
      setValidation(validate(newValue));
    }
  };
  
  // Validate on blur
  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      setValidation(validate(inputValue));
    }
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <textarea
          id={id}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-2.5 bg-black/20 border rounded-lg focus:outline-none text-white transition-all
            ${validation.isValid 
              ? 'border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50' 
              : 'border-red-500/70 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/70'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${error ? 'bg-red-900/20 border-red-700/30' : 'bg-white/5 border-gray-600'}
          `}
          {...(error ? { 'aria-invalid': 'true' } : {})}
        />
        
        {maxLength && (
          <div className="absolute right-2 bottom-2 text-xs text-gray-400">
            {inputValue.length}/{maxLength}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {helpText && (
          <motion.p
            key={`${id}-helptext`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 0.7, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-xs text-gray-400"
          >
            {helpText}
          </motion.p>
        )}
        
        {!validation.isValid && touched && validation.message && (
          <motion.p
            key={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-xs text-red-400"
          >
            {validation.message}
          </motion.p>
        )}
      </AnimatePresence>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

// Toggle Switch Component
export function FormToggle({
  id,
  label,
  checked = false,
  disabled = false,
  onChange,
  helpText,
  className = '',
}: FormToggleProps) {
  // Handle toggle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center">
        <div className="relative flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only"
          />
          <div
            className={`h-6 w-11 rounded-full transition-colors ${
              checked ? 'bg-blue-500' : 'bg-gray-700'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full bg-white transition-transform ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
        <label
          htmlFor={id}
          className={`ml-3 text-sm font-medium text-gray-300 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {label}
        </label>
      </div>
      
      {helpText && (
        <p className="mt-1 text-xs text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}

// Status Message Component
export function StatusMessage({
  type,
  message,
  onDismiss,
  autoHideDuration = 5000,
}: StatusMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoHideDuration && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Allow time for exit animation
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onDismiss]);
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      case 'warning':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
      case 'info':
      default:
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-lg border p-3 flex items-start gap-3 my-3 ${getTypeStyles()}`}
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {getIcon()}
          </div>
          <div className="flex-1 text-sm">{message}</div>
          {onDismiss && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="text-sm opacity-70 hover:opacity-100 focus:outline-none"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Button Component
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-white/10 hover:bg-white/20 text-white';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20';
      case 'primary':
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white';
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'md':
      default:
        return 'px-5 py-2.5 text-sm';
    }
  };
  
  return (
    <motion.button
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      onClick={onClick}
      className={`rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 focus:ring-blue-500/50 transition-all 
        ${getVariantStyles()} 
        ${getSizeStyles()} 
        ${(disabled || loading) ? 'opacity-60 cursor-not-allowed' : ''} 
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-4 w-4 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {icon && !loading && <span>{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
}

// Form Section Component
export function FormSection({
  title,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <div className={`bg-white/5 rounded-lg p-5 mb-6 border border-white/10 ${className}`}>
      <h4 className={`text-lg font-bold mb-4 ${colors.text.primary}`}>
        {title}
      </h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Common validation functions
export const validators = {
  required: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    message: 'This field is required'
  }),
  
  email: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: regex.test(value),
      message: 'Please enter a valid email address'
    };
  },
  
  url: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: 'Please enter a valid URL'
      };
    }
  },
  
  minLength: (min: number) => (value: string): ValidationResult => ({
    isValid: value.length >= min,
    message: `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number) => (value: string): ValidationResult => ({
    isValid: value.length <= max,
    message: `Must be no more than ${max} characters`
  }),
  
  // Combine multiple validators
  compose: (...validators: ((value: string) => ValidationResult)[]) => (value: string): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) return result;
    }
    return { isValid: true };
  }
}; 