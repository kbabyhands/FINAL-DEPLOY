
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

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

interface MenuItemsListProps {
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: () => void;
}

const MenuItemsList = ({ menuItems, onEdit, onDelete }: MenuItemsListProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
      onDelete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Menu item ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      onDelete(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDietaryBadges = (item: MenuItem) => {
    const badges = [];
    if (item.is_vegetarian) badges.push('Vegetarian');
    if (item.is_vegan) badges.push('Vegan');
    if (item.is_gluten_free) badges.push('Gluten-Free');
    if (item.is_nut_free) badges.push('Nut-Free');
    return badges;
  };

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No menu items yet. Click "Add Menu Item" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {menuItems.map((item) => (
        <Card key={item.id} className={`${!item.is_active ? 'opacity-60' : ''}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <Badge variant="outline">{item.category}</Badge>
                  {!item.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-gray-600 mb-2">{item.description}</p>
                )}
                
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xl font-bold text-green-600">
                    ${item.price.toFixed(2)}
                  </span>
                  
                  {getDietaryBadges(item).map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                {item.allergens.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Allergens: </span>
                    {item.allergens.join(', ')}
                  </div>
                )}
                
                <div className="flex gap-2 mt-2">
                  {item.image_url && (
                    <Badge variant="outline" className="text-xs">
                      📷 Image
                    </Badge>
                  )}
                  {item.model_url && (
                    <Badge variant="outline" className="text-xs">
                      🎯 3D Model
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => handleToggleActive(item.id, item.is_active)}
                  variant="outline"
                  size="sm"
                >
                  {item.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => onEdit(item)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuItemsList;
