
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import SortableMenuItemsList from './SortableMenuItemsList';

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
  sort_order: number;
}

interface MenuManagementTabProps {
  menuItems: MenuItem[];
  onAddMenuItem: () => void;
  onEditMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: () => void;
  onReorderItems: (items: MenuItem[]) => void;
}

const MenuManagementTab = ({ 
  menuItems, 
  onAddMenuItem, 
  onEditMenuItem, 
  onDeleteMenuItem,
  onReorderItems 
}: MenuManagementTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>
              Manage your restaurant's menu items
            </CardDescription>
          </div>
          <Button onClick={onAddMenuItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SortableMenuItemsList
          menuItems={menuItems}
          onEdit={onEditMenuItem}
          onDelete={onDeleteMenuItem}
          onReorder={onReorderItems}
        />
      </CardContent>
    </Card>
  );
};

export default MenuManagementTab;
