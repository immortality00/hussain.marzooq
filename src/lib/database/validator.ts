// Client-side validators to ensure data conforms to Firestore security rules
// These ensure that client code doesn't attempt operations that would be rejected by the server

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date | number;
  updatedAt: Date | number;
  [key: string]: unknown; // Allow other fields with unknown type
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date | number;
  [key: string]: unknown; // Allow other fields with unknown type
}

export interface CategoryMetadata {
  id?: string;
  title: string;
  description: string;
  updatedAt: Date | number;
  [key: string]: unknown; // Allow other fields with unknown type
}

// Type for function parameters that could be text
type TextValue = string | number | boolean | null | undefined;

// Type for function parameters that could be URLs
type UrlValue = string | null | undefined;

// Type for function parameters that could be timestamps
type TimestampValue = Date | number | null | undefined;

// Validate text fields
const isValidText = (text: TextValue): boolean => {
  return typeof text === 'string' && text.length > 0 && text.length < 5000;
};

// Validate URL fields
const isValidUrl = (url: UrlValue): boolean => {
  if (typeof url !== 'string') return false;
  try {
    const parsedUrl = new URL(url);
    return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && url.length < 1000;
  } catch {
    return false;
  }
};

// Validate timestamp fields
const isValidTimestamp = (timestamp: TimestampValue): boolean => {
  if (timestamp instanceof Date) return true;
  if (typeof timestamp === 'number' && timestamp > 0) return true;
  return false;
};

// Portfolio item validator
export const validatePortfolioItem = (item: PortfolioItem): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidText(item.title)) {
    errors.push('Title must be a string between 1 and 5000 characters');
  }
  
  if (!isValidText(item.description)) {
    errors.push('Description must be a string between 1 and 5000 characters');
  }
  
  if (!isValidUrl(item.imageUrl)) {
    errors.push('Image URL must be a valid HTTP or HTTPS URL');
  }
  
  if (!isValidTimestamp(item.createdAt)) {
    errors.push('Created date must be a valid Date or timestamp number');
  }
  
  if (!isValidTimestamp(item.updatedAt)) {
    errors.push('Updated date must be a valid Date or timestamp number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Inquiry validator
export const validateInquiry = (inquiry: Inquiry): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidText(inquiry.name)) {
    errors.push('Name must be a string between 1 and 5000 characters');
  }
  
  if (!isValidText(inquiry.email)) {
    errors.push('Email must be a string between 1 and 5000 characters');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiry.email)) {
      errors.push('Email must be a valid email address');
    }
  }
  
  if (!isValidText(inquiry.message)) {
    errors.push('Message must be a string between 1 and 5000 characters');
  }
  
  if (!isValidTimestamp(inquiry.createdAt)) {
    errors.push('Created date must be a valid Date or timestamp number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Category metadata validator
export const validateCategoryMetadata = (metadata: CategoryMetadata): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidText(metadata.title)) {
    errors.push('Title must be a string between 1 and 5000 characters');
  }
  
  if (!isValidText(metadata.description)) {
    errors.push('Description must be a string between 1 and 5000 characters');
  }
  
  if (!isValidTimestamp(metadata.updatedAt)) {
    errors.push('Updated date must be a valid Date or timestamp number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}; 