
import { MenuItemFormData, RestaurantFormData } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Menu Item Validation
export const validateMenuItemData = (data: Partial<MenuItemFormData>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Menu item title is required' });
  } else if (data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be less than 100 characters' });
  }

  if (!data.category?.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (data.price < 0) {
    errors.push({ field: 'price', message: 'Price must be positive' });
  } else if (data.price > 10000) {
    errors.push({ field: 'price', message: 'Price seems unreasonably high' });
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
  }

  // URL validation
  if (data.image_url && !isValidUrl(data.image_url)) {
    errors.push({ field: 'image_url', message: 'Please enter a valid image URL' });
  }

  if (data.model_url && !isValidUrl(data.model_url)) {
    errors.push({ field: 'model_url', message: 'Please enter a valid model URL' });
  }

  // Allergens validation
  if (data.allergens && data.allergens.length > 20) {
    errors.push({ field: 'allergens', message: 'Too many allergens specified' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Restaurant Validation
export const validateRestaurantData = (data: Partial<RestaurantFormData>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Restaurant name is required' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  // Optional field validations
  if (data.description && data.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // URL validations
  const urlFields = ['logo_url', 'banner_url', 'background_image_url'] as const;
  urlFields.forEach(field => {
    if (data[field] && !isValidUrl(data[field]!)) {
      errors.push({ field, message: `Please enter a valid ${field.replace('_', ' ')}` });
    }
  });

  // Color validations
  const colorFields = ['primary_color', 'secondary_color', 'background_color'] as const;
  colorFields.forEach(field => {
    if (data[field] && !isValidColor(data[field]!)) {
      errors.push({ field, message: `Please enter a valid ${field.replace('_', ' ')} (hex format)` });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility validation functions
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
};

export const isValidColor = (color: string): boolean => {
  // Validate hex color format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeNumericInput = (input: string | number): number => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? 0 : Math.max(0, num);
};
