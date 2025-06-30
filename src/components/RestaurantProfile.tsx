import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Restaurant } from '@/types';
import { validateRestaurantData, sanitizeInput, ValidationError } from '@/utils/validation';
import { logger } from '@/utils/logger';

interface RestaurantProfileProps {
  restaurant: Restaurant | null;
  onUpdate: (restaurant: Restaurant) => void;
  isLoading?: boolean;
}

const RestaurantProfile = ({ restaurant, onUpdate, isLoading = false }: RestaurantProfileProps) => {
  const [editing, setEditing] = useState(!restaurant);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || ''
  });
  const { toast } = useToast();

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(error => error.field === fieldName)?.message;
  };

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear validation errors for this field when user starts typing
    if (validationErrors.some(error => error.field === field)) {
      setValidationErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateRestaurantData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setValidationErrors([]);

    try {
      if (restaurant) {
        // Update existing restaurant
        const { data, error } = await supabase
          .from('restaurants')
          .update(formData)
          .eq('id', restaurant.id)
          .select()
          .single();

        if (error) throw error;
        onUpdate(data);
        logger.info('Restaurant updated successfully');
      } else {
        // Create new restaurant
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('restaurants')
          .insert([{ ...formData, user_id: userData.user.id }])
          .select()
          .single();

        if (error) throw error;
        onUpdate(data);
        logger.info('Restaurant created successfully');
      }

      setEditing(false);
      toast({
        title: "Success",
        description: "Restaurant profile saved successfully"
      });
    } catch (error: any) {
      logger.error('Error saving restaurant:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || ''
      });
      setEditing(false);
      setValidationErrors([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Restaurant Profile</CardTitle>
            <CardDescription>
              {restaurant ? 'Your restaurant information' : 'Set up your restaurant profile'}
            </CardDescription>
          </div>
          {restaurant && !editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className={getFieldError('name') ? 'border-red-500' : ''}
              />
              {getFieldError('name') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('name')}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers about your restaurant"
                className={getFieldError('description') ? 'border-red-500' : ''}
              />
              {getFieldError('description') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('description')}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={getFieldError('address') ? 'border-red-500' : ''}
              />
              {getFieldError('address') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('address')}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g., +1 (555) 123-4567"
                className={getFieldError('phone') ? 'border-red-500' : ''}
              />
              {getFieldError('phone') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('phone')}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={getFieldError('email') ? 'border-red-500' : ''}
              />
              {getFieldError('email') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || isLoading}>
                {loading || isLoading ? 'Saving...' : 'Save'}
              </Button>
              {restaurant && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : restaurant ? (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              {restaurant.description && (
                <p className="text-gray-600">{restaurant.description}</p>
              )}
            </div>
            {restaurant.address && (
              <div>
                <span className="font-medium">Address: </span>
                <span className="text-gray-600">{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div>
                <span className="font-medium">Phone: </span>
                <span className="text-gray-600">{restaurant.phone}</span>
              </div>
            )}
            {restaurant.email && (
              <div>
                <span className="font-medium">Email: </span>
                <span className="text-gray-600">{restaurant.email}</span>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default RestaurantProfile;
