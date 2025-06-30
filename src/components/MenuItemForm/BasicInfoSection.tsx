
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInfoSectionProps {
  formData: {
    title: string;
    description: string;
    price: string;
    category: string;
  };
  onInputChange: (field: string, value: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
}

const BasicInfoSection = ({ formData, onInputChange, getFieldError }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            required
            className={getFieldError('title') ? 'border-red-500' : ''}
          />
          {getFieldError('title') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('title')}</p>
          )}
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => onInputChange('category', e.target.value)}
            placeholder="e.g., Appetizer, Main Course, Dessert"
            required
            className={getFieldError('category') ? 'border-red-500' : ''}
          />
          {getFieldError('category') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('category')}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe your menu item"
          className={getFieldError('description') ? 'border-red-500' : ''}
        />
        {getFieldError('description') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('description')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="price">Price ($) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => onInputChange('price', e.target.value)}
          required
          className={getFieldError('price') ? 'border-red-500' : ''}
        />
        {getFieldError('price') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('price')}</p>
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;
