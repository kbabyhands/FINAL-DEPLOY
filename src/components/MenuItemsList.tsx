
import React from 'react';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Edit2, Trash2, Eye, EyeOff, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { logger } from '@/utils/logger';

interface MenuItemsListProps {
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleActive: (itemId: string, isActive: boolean) => void;
  isItemPending?: (itemId: string) => boolean;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({
  menuItems,
  onEdit,
  onDelete,
  onToggleActive,
  isItemPending = () => false
}) => {
  const handleEdit = (item: MenuItem) => {
    logger.debug('Edit menu item requested:', item.title);
    onEdit(item);
  };

  const handleDelete = (itemId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      logger.debug('Delete menu item confirmed:', title);
      onDelete(itemId);
    }
  };

  const handleToggleActive = (itemId: string, currentStatus: boolean, title: string) => {
    const newStatus = !currentStatus;
    logger.debug('Toggle menu item status:', { title, from: currentStatus, to: newStatus });
    onToggleActive(itemId, newStatus);
  };

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {menuItems.map((item) => {
        const isPending = isItemPending(item.id);
        
        return (
          <Card key={item.id} className={`${isPending ? 'opacity-75' : ''} transition-opacity`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    {isPending && <LoadingSpinner size="sm" />}
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                    {item.view_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.view_count} views
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Item Image */}
                {item.image_url && (
                  <div className="ml-4">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Dietary Info */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.is_vegetarian && (
                  <Badge variant="outline" className="text-green-600">Vegetarian</Badge>
                )}
                {item.is_vegan && (
                  <Badge variant="outline" className="text-green-700">Vegan</Badge>
                )}
                {item.is_gluten_free && (
                  <Badge variant="outline" className="text-blue-600">Gluten Free</Badge>
                )}
                {item.is_nut_free && (
                  <Badge variant="outline" className="text-orange-600">Nut Free</Badge>
                )}
              </div>

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Allergens: </span>
                  <span className="text-sm">
                    {item.allergens.join(', ')}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  disabled={isPending}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(item.id, item.is_active, item.title)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Clock className="w-4 h-4 mr-1" />
                  ) : item.is_active ? (
                    <EyeOff className="w-4 h-4 mr-1" />
                  ) : (
                    <Eye className="w-4 h-4 mr-1" />
                  )}
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id, item.title)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MenuItemsList;
