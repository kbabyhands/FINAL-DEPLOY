
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import MenuItemsList from '../MenuItemsList';
import { MenuItemsListSkeleton } from '@/components/ui/menu-item-skeleton';
import { MenuItem } from '@/types';

interface MenuManagementTabProps {
  menuItems: MenuItem[];
  isLoading?: boolean;
  onAddMenuItem: () => void;
  onEditMenuItem: (item: MenuItem) => void;
  restaurantId: string;
}

const MenuManagementTab = ({ 
  menuItems, 
  isLoading = false,
  onAddMenuItem, 
  onEditMenuItem, 
  restaurantId
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
        {isLoading ? (
          <MenuItemsListSkeleton />
        ) : (
          <MenuItemsList
            menuItems={menuItems}
            onEdit={onEditMenuItem}
            restaurantId={restaurantId}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MenuManagementTab;
