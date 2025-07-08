
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from './FileUpload';
import { Palette, Type } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
  banner_url?: string;
  background_color?: string;
  background_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

interface RestaurantBrandingProps {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Georgia', label: 'Georgia (Classic)' },
  { value: 'Arial', label: 'Arial (Clean)' },
  { value: 'Times New Roman', label: 'Times New Roman (Traditional)' },
  { value: 'Roboto', label: 'Roboto (Friendly)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' }
];

const RestaurantBranding = ({ restaurant, onUpdate }: RestaurantBrandingProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandingData, setBrandingData] = useState({
    logo_url: restaurant.logo_url || '',
    banner_url: restaurant.banner_url || '',
    background_color: restaurant.background_color || '#f9fafb',
    background_image_url: restaurant.background_image_url || '',
    primary_color: restaurant.primary_color || '#1e40af',
    secondary_color: restaurant.secondary_color || '#64748b',
    font_family: restaurant.font_family || 'Inter'
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(brandingData)
        .eq('id', restaurant.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setEditing(false);
      toast({
        title: "Success",
        description: "Branding settings saved successfully"
      });
    } catch (error: any) {
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
    setBrandingData({
      logo_url: restaurant.logo_url || '',
      banner_url: restaurant.banner_url || '',
      background_color: restaurant.background_color || '#f9fafb',
      background_image_url: restaurant.background_image_url || '',
      primary_color: restaurant.primary_color || '#1e40af',
      secondary_color: restaurant.secondary_color || '#64748b',
      font_family: restaurant.font_family || 'Inter'
    });
    setEditing(false);
  };

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Restaurant Branding
              </CardTitle>
              <CardDescription>
                Customize your menu page appearance with logos, colors, and fonts
              </CardDescription>
            </div>
            <Button onClick={() => setEditing(true)} variant="outline">
              Customize
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Branding</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Logo: </span>
                  <span className="text-gray-600">
                    {restaurant.logo_url ? 'Uploaded' : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Banner: </span>
                  <span className="text-gray-600">
                    {restaurant.banner_url ? 'Uploaded' : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Primary Color: </span>
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: restaurant.primary_color || '#1e40af' }}
                  />
                  <span className="text-gray-600">{restaurant.primary_color || '#1e40af'}</span>
                </div>
                <div>
                  <span className="font-medium">Font: </span>
                  <span className="text-gray-600">{restaurant.font_family || 'Inter'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Preview</h4>
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: restaurant.background_color || '#f9fafb',
                  fontFamily: restaurant.font_family || 'Inter'
                }}
              >
                <div 
                  className="text-lg font-bold mb-2"
                  style={{ color: restaurant.primary_color || '#1e40af' }}
                >
                  {restaurant.name}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: restaurant.secondary_color || '#64748b' }}
                >
                  Sample menu item description
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Customize Restaurant Branding
        </CardTitle>
        <CardDescription>
          Upload your logo and banner, choose colors, and select fonts to match your brand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              bucket="restaurant-branding"
              currentUrl={brandingData.logo_url}
              onUpload={(url) => setBrandingData({ ...brandingData, logo_url: url })}
              onRemove={() => setBrandingData({ ...brandingData, logo_url: '' })}
              label="Restaurant Logo"
              accept="image/*"
              recommendedSize="300×300px"
              description="Square format works best. Displays at 80×80px in menu header."
            />
            <FileUpload
              bucket="restaurant-branding"
              currentUrl={brandingData.banner_url}
              onUpload={(url) => setBrandingData({ ...brandingData, banner_url: url })}
              onRemove={() => setBrandingData({ ...brandingData, banner_url: '' })}
              label="Banner Image"
              accept="image/*"
              recommendedSize="1200×400px"
              description="Wide format recommended. Used as background header image."
            />
          </div>

          {/* Color Customization */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="primary-color"
                    type="color"
                    value={brandingData.primary_color}
                    onChange={(e) => setBrandingData({ ...brandingData, primary_color: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={brandingData.primary_color}
                    onChange={(e) => setBrandingData({ ...brandingData, primary_color: e.target.value })}
                    placeholder="#1e40af"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={brandingData.secondary_color}
                    onChange={(e) => setBrandingData({ ...brandingData, secondary_color: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={brandingData.secondary_color}
                    onChange={(e) => setBrandingData({ ...brandingData, secondary_color: e.target.value })}
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="background-color"
                    type="color"
                    value={brandingData.background_color}
                    onChange={(e) => setBrandingData({ ...brandingData, background_color: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={brandingData.background_color}
                    onChange={(e) => setBrandingData({ ...brandingData, background_color: e.target.value })}
                    placeholder="#f9fafb"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4" />
              Font Family
            </Label>
            <Select
              value={brandingData.font_family}
              onValueChange={(value) => setBrandingData({ ...brandingData, font_family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Image Upload */}
          <FileUpload
            bucket="restaurant-branding"
            currentUrl={brandingData.background_image_url}
            onUpload={(url) => setBrandingData({ ...brandingData, background_image_url: url })}
            onRemove={() => setBrandingData({ ...brandingData, background_image_url: '' })}
            label="Background Image (Optional)"
            accept="image/*"
            recommendedSize="1920×1080px"
            description="High-resolution image for page background. Will be automatically optimized."
          />

          {/* Preview */}
          <div>
            <h4 className="font-medium mb-3">Preview</h4>
            <div 
              className="p-6 rounded-lg border relative overflow-hidden"
              style={{ 
                backgroundColor: brandingData.background_color,
                fontFamily: brandingData.font_family,
                backgroundImage: brandingData.background_image_url 
                  ? `url(${brandingData.background_image_url})` 
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {brandingData.background_image_url && (
                <div className="absolute inset-0 bg-white bg-opacity-90"></div>
              )}
              <div className="relative">
                {brandingData.logo_url && (
                  <img 
                    src={brandingData.logo_url} 
                    alt="Logo" 
                    className="h-12 mb-4 object-contain"
                  />
                )}
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: brandingData.primary_color }}
                >
                  {restaurant.name}
                </div>
                <div 
                  className="text-base mb-4"
                  style={{ color: brandingData.secondary_color }}
                >
                  Welcome to our restaurant
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div 
                    className="font-semibold mb-1"
                    style={{ color: brandingData.primary_color }}
                  >
                    Sample Menu Item
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: brandingData.secondary_color }}
                  >
                    This is how your menu items will appear with your chosen styling.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantBranding;
