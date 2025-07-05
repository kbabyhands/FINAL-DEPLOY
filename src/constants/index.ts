// App configuration constants
export const APP_CONFIG = {
  RESTAURANT_ID: 'c1e4a467-4e2f-4c4d-b7f3-a1b2c3d4e5f6', // Default restaurant ID
  DEFAULT_CATEGORY: 'all',
  PERFORMANCE_THRESHOLDS: {
    LOW_MEMORY_GB: 4,
    SLOW_CONNECTION_TYPES: ['slow-2g', '2g'],
  },
  INTERSECTION_OBSERVER: {
    THRESHOLD: 0.2,
    ROOT_MARGIN: '50px',
  },
  DELAYS: {
    VIEW_TRACKING_MS: 1000,
    MODEL_PRELOAD_MS: 500,
  },
} as const;

// UI constants
export const UI_CONFIG = {
  CARD_DIMENSIONS: {
    IMAGE_SIZE: 80, // w-20 h-20 = 80px
    DIALOG_MAX_WIDTH: '4xl',
    DIALOG_MAX_HEIGHT: '90vh',
  },
  ANIMATIONS: {
    TRANSITION_DURATION: 200,
    HOVER_SCALE: 1.05,
  },
} as const;

// Filter constants
export const FILTER_CONFIG = {
  DIETARY_OPTIONS: [
    { key: 'vegetarian', label: '🌱 Vegetarian', emoji: '🌱' },
    { key: 'vegan', label: '🥬 Vegan', emoji: '🥬' },
    { key: 'glutenFree', label: '🌾 Gluten-Free', emoji: '🌾' },
    { key: 'nutFree', label: '🥜 Nut-Free', emoji: '🥜' },
  ],
  DEFAULT_DIETARY_FILTERS: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
  },
} as const;

// Validation constants
export const VALIDATION = {
  RATING: {
    MIN: 1,
    MAX: 5,
  },
  PRICE: {
    MIN: 0,
    MAX: 9999.99,
  },
  TEXT_LIMITS: {
    TITLE_MAX: 100,
    DESCRIPTION_MAX: 500,
    REVIEW_MAX: 1000,
    NAME_MAX: 50,
  },
} as const;

// File upload constants
export const FILE_CONFIG = {
  STORAGE_BUCKETS: {
    MENU_IMAGES: 'menu-images',
    GAUSSIAN_SPLATS: 'gaussian-splats',
    RESTAURANT_BRANDING: 'restaurant-branding',
    THREE_D_MODELS: '3d-models',
  },
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    MODELS: ['application/octet-stream', '.splat', '.ply'],
  },
  MAX_SIZES: {
    IMAGE_MB: 5,
    MODEL_MB: 50,
  },
} as const;

// API endpoints and pagination
export const API_CONFIG = {
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested item was not found.',
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PRICE: 'Please enter a valid price.',
    INVALID_RATING: 'Please select a rating between 1 and 5.',
  },
  FILE_UPLOAD: {
    SIZE_TOO_LARGE: 'File size is too large.',
    INVALID_TYPE: 'Invalid file type.',
    UPLOAD_FAILED: 'Failed to upload file.',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  ITEM_SAVED: 'Menu item saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
} as const;