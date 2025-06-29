
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import FileUpload from './FileUpload';
import GaussianSplatOptimizer from './GaussianSplatOptimizer';
import { validateMenuItemData, sanitizeInput, sanitizeNumericInput, ValidationError } from '@/utils/validation';
import { logger } from '@/utils/logger';
import { useErrorHandler } from '@/utils/errorHandler';

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
  const [newAllergen, setNewAllergen] = useState('');
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

  const addAllergen = () => {
    const sanitizedAllergen = sanitizeInput(newAllergen.trim());
    if (sanitizedAllergen && !formData.allergens.includes(sanitizedAllergen)) {
      logger.debug('Adding allergen:', sanitizedAllergen);
      setFormData({
        ...formData,
        allergens: [...formData.allergens, sanitizedAllergen]
      });
      setNewAllergen('');
    }
  };

  const removeAllergen = (allergen: string) => {
    logger.debug('Removing allergen:', allergen);
    setFormData({
      ...formData,
      allergens: formData.allergens.filter(a => a !== allergen)
    });
  };

  const handleOptimizationTip = () => {
    toast({
      title: "Optimization Tips",
      description: "Consider using compressed .ply files or reducing point density for faster uploads. Tools like Gaussian Splatting WebGL optimizers can help reduce file sizes significantly.",
      duration: 8000,
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
                onChange={(e) => handleInputChange('category', e.target.value)}
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
              onChange={(e) => handleInputChange('description', e.target.value)}
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
              onChange={(e) => handleInputChange('price', e.target.value)}
              required
              className={getFieldError('price') ? 'border-red-500' : ''}
            />
            {getFieldError('price') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('price')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FileUpload
              bucket="menu-images"
              currentUrl={formData.image_url}
              onUpload={(url) => setFormData({ ...formData, image_url: url })}
              onRemove={() => setFormData({ ...formData, image_url: '' })}
              label="Menu Item Image"
              accept="image/*"
            />
            
            <div>
              <FileUpload
                bucket="gaussian-splats"
                currentUrl={formData.model_url}
                onUpload={(url) => setFormData({ ...formData, model_url: url })}
                onRemove={() => setFormData({ ...formData, model_url: '' })}
                label="Gaussian Splat File"
                accept=".splat,.ply,.gz"
              />
              
              {!formData.model_url && (
                <GaussianSplatOptimizer onOptimizationTip={handleOptimizationTip} />
              )}
            </div>
          </div>

          <div>
            <Label>Dietary Options</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_vegetarian}
                  onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                />
                <span>Vegetarian</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_vegan}
                  onChange={(e) => setFormData({ ...formData, is_vegan: e.target.checked })}
                />
                <span>Vegan</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_gluten_free}
                  onChange={(e) => setFormData({ ...formData, is_gluten_free: e.target.checked })}
                />
                <span>Gluten-Free</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_nut_free}
                  onChange={(e) => setFormData({ ...formData, is_nut_free: e.target.checked })}
                />
                <span>Nut-Free</span>
              </label>
            </div>
          </div>

          <div>
            <Label>Allergens</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                placeholder="Add allergen"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
              />
              <Button type="button" onClick={addAllergen} variant="outline">
                Add
              </Button>
            </div>
            {getFieldError('allergens') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('allergens')}</p>
            )}
            {formData.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergens.map((allergen) => (
                  <div
                    key={allergen}
                    className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active (visible to customers)</span>
            </label>
          </div>

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
