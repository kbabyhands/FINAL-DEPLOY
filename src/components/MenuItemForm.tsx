
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { validateMenuItemData, sanitizeInput, sanitizeNumericInput, ValidationError } from '@/utils/validation';
import { logger } from '@/utils/logger';
import { useErrorHandler } from '@/utils/errorHandler';
import BasicInfoSection from './MenuItemForm/BasicInfoSection';
import DietaryOptionsSection from './MenuItemForm/DietaryOptionsSection';
import AllergensSection from './MenuItemForm/AllergensSection';
import FileUploadsSection from './MenuItemForm/FileUploadsSection';

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  allergens: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_nut_free: boolean;
  model_url?: string;
  image_url?: string;
  is_active: boolean;
}

interface MenuItemFormProps {
  restaurantId: string;
  menuItem?: MenuItem | null;
  onSave: () => void;
  onCancel: () => void;
}

const MenuItemForm = ({ restaurantId, menuItem, onSave, onCancel }: MenuItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    allergens: [] as string[],
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: false,
    is_active: true,
    image_url: '',
    model_url: ''
  });
  const { toast } = useToast();
  const { handleSupabaseError } = useErrorHandler();

  useEffect(() => {
    if (menuItem) {
      logger.debug('Loading menu item for editing:', menuItem.title);
      setFormData({
        title: menuItem.title,
        description: menuItem.description || '',
        price: menuItem.price.toString(),
        category: menuItem.category,
        allergens: menuItem.allergens,
        is_vegetarian: menuItem.is_vegetarian,
        is_vegan: menuItem.is_vegan,
        is_gluten_free: menuItem.is_gluten_free,
        is_nut_free: menuItem.is_nut_free,
        is_active: menuItem.is_active,
        image_url: menuItem.image_url || '',
        model_url: menuItem.model_url || ''
      });
    } else {
      logger.debug('Creating new menu item form');
    }
  }, [menuItem]);

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(error => error.field === fieldName)?.message;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'price') {
      // Allow decimal input for price
      processedValue = value;
    } else {
      processedValue = sanitizeInput(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear validation errors for this field when user starts typing
    if (validationErrors.some(error => error.field === field)) {
      setValidationErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleDietaryOptionsChange = (updates: Partial<{
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    is_nut_free: boolean;
    is_active: boolean;
  }>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAllergensChange = (allergens: string[]) => {
    setFormData(prev => ({ ...prev, allergens }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare validation data
    const validationData = {
      ...formData,
      price: parseFloat(formData.price) || 0
    };
    
    // Validate form data
    const validation = validateMenuItemData(validationData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      logger.warn('Menu item form validation failed:', validation.errors);
      return;
    }

    setLoading(true);
    setValidationErrors([]);
    logger.info(menuItem ? 'Updating menu item' : 'Creating new menu item');

    try {
      const price = sanitizeNumericInput(formData.price);
      
      const menuItemData = {
        title: sanitizeInput(formData.title),
        description: formData.description ? sanitizeInput(formData.description) : null,
        price,
        category: sanitizeInput(formData.category),
        allergens: formData.allergens.map(allergen => sanitizeInput(allergen)),
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        is_gluten_free: formData.is_gluten_free,
        is_nut_free: formData.is_nut_free,
        is_active: formData.is_active,
        image_url: formData.image_url || null,
        model_url: formData.model_url || null,
        restaurant_id: restaurantId
      };

      if (menuItem) {
        // Update existing item
        const { data, error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', menuItem.id)
          .select()
          .single();

        if (error) throw error;
        logger.info('Menu item updated successfully:', data.title);
        
        toast({
          title: "Success",
          description: "Menu item updated successfully"
        });
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('menu_items')
          .insert([menuItemData])
          .select()
          .single();

        if (error) throw error;
        logger.info('Menu item created successfully:', data.title);

        toast({
          title: "Success",
          description: "Menu item created successfully"
        });
      }

      onSave();
    } catch (error: any) {
      handleSupabaseError(error, menuItem ? 'menu item update' : 'menu item creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {menuItem ? 'Update the details of your menu item' : 'Create a new menu item for your restaurant'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoSection
            formData={{
              title: formData.title,
              description: formData.description,
              price: formData.price,
              category: formData.category
            }}
            onInputChange={handleInputChange}
            getFieldError={getFieldError}
          />

          <FileUploadsSection
            imageUrl={formData.image_url}
            modelUrl={formData.model_url}
            onImageUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            onImageRemove={() => setFormData(prev => ({ ...prev, image_url: '' }))}
            onModelUpload={(url) => setFormData(prev => ({ ...prev, model_url: url }))}
            onModelRemove={() => setFormData(prev => ({ ...prev, model_url: '' }))}
          />

          <DietaryOptionsSection
            formData={{
              is_vegetarian: formData.is_vegetarian,
              is_vegan: formData.is_vegan,
              is_gluten_free: formData.is_gluten_free,
              is_nut_free: formData.is_nut_free,
              is_active: formData.is_active
            }}
            onFormDataChange={handleDietaryOptionsChange}
          />

          <AllergensSection
            allergens={formData.allergens}
            onAllergensChange={handleAllergensChange}
            validationError={getFieldError('allergens')}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (menuItem ? 'Update' : 'Create')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemForm;
