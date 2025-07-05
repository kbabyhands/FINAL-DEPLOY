import { VALIDATION, ERROR_MESSAGES } from '@/constants';
import type { ReviewFormData, MenuItemFormData } from '@/types';

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates price format and range
 */
export const isValidPrice = (price: number): boolean => {
  return price >= VALIDATION.PRICE.MIN && price <= VALIDATION.PRICE.MAX;
};

/**
 * Validates rating range
 */
export const isValidRating = (rating: number): boolean => {
  return rating >= VALIDATION.RATING.MIN && rating <= VALIDATION.RATING.MAX;
};

/**
 * Validates review form data
 */
export const validateReviewForm = (data: ReviewFormData): string[] => {
  const errors: string[] = [];

  if (!data.customerName.trim()) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
  }

  if (data.customerName.length > VALIDATION.TEXT_LIMITS.NAME_MAX) {
    errors.push(`Name must be ${VALIDATION.TEXT_LIMITS.NAME_MAX} characters or less`);
  }

  if (data.customerEmail && !isValidEmail(data.customerEmail)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
  }

  if (!isValidRating(data.rating)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_RATING);
  }

  if (data.reviewText && data.reviewText.length > VALIDATION.TEXT_LIMITS.REVIEW_MAX) {
    errors.push(`Review must be ${VALIDATION.TEXT_LIMITS.REVIEW_MAX} characters or less`);
  }

  return errors;
};

/**
 * Validates menu item form data
 */
export const validateMenuItemForm = (data: MenuItemFormData): string[] => {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push('Title is required');
  }

  if (data.title.length > VALIDATION.TEXT_LIMITS.TITLE_MAX) {
    errors.push(`Title must be ${VALIDATION.TEXT_LIMITS.TITLE_MAX} characters or less`);
  }

  if (data.description.length > VALIDATION.TEXT_LIMITS.DESCRIPTION_MAX) {
    errors.push(`Description must be ${VALIDATION.TEXT_LIMITS.DESCRIPTION_MAX} characters or less`);
  }

  if (!isValidPrice(data.price)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_PRICE);
  }

  if (!data.category.trim()) {
    errors.push('Category is required');
  }

  return errors;
};