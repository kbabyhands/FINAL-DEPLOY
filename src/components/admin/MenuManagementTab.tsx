
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import MenuItemsList from '../MenuItemsList';
import { MenuItem } from '@/types';

interface MenuManagementTabProps {
  menuItems: MenuItem[];
  onAddMenuItem: () => void;
  onEditMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: () => void;
}

const MenuManagementTab = ({ 
  menuItems, 
  onAddMenuItem, 
  onEditMenuItem, 
  onDeleteMenuItem 
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
        <MenuItemsList
          menuItems={menuItems}
          onEdit={onEditMenuItem}
          onDelete={onDeleteMenuItem}
        />
      </CardContent>
    </Card>
  );
};

export default MenuManagementTab;
