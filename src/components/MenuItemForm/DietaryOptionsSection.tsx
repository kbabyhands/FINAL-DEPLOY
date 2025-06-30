
import React from 'react';
import { Label } from '@/components/ui/label';

interface DietaryOptionsSectionProps {
  formData: {
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    is_nut_free: boolean;
    is_active: boolean;
  };
  onFormDataChange: (updates: Partial<DietaryOptionsSectionProps['formData']>) => void;
}

const DietaryOptionsSection = ({ formData, onFormDataChange }: DietaryOptionsSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Dietary Options</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_vegetarian}
              onChange={(e) => onFormDataChange({ is_vegetarian: e.target.checked })}
            />
            <span>Vegetarian</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_vegan}
              onChange={(e) => onFormDataChange({ is_vegan: e.target.checked })}
            />
            <span>Vegan</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_gluten_free}
              onChange={(e) => onFormDataChange({ is_gluten_free: e.target.checked })}
            />
            <span>Gluten-Free</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_nut_free}
              onChange={(e) => onFormDataChange({ is_nut_free: e.target.checked })}
            />
            <span>Nut-Free</span>
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => onFormDataChange({ is_active: e.target.checked })}
          />
          <span>Active (visible to customers)</span>
        </label>
      </div>
    </div>
  );
};

export default DietaryOptionsSection;
