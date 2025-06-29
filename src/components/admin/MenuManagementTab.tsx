
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MenuItemsList from '@/components/MenuItemsList';
import { MenuItem } from '@/types';
import { useOptimisticMenuItems } from '@/hooks/useOptimisticMenuItems';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RetryButton } from '@/components/ui/retry-button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { logger } from '@/utils/logger';

interface MenuManagementTabProps {
  menuItems: MenuItem[];
  isLoading: boolean;
  onAddMenuItem: () => void;
  onEditMenuItem: (item: MenuItem) => void;
  restaurantId: string;
}

const MenuManagementTab: React.FC<MenuManagementTabProps> = ({
  onAddMenuItem,
  onEditMenuItem,
  restaurantId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    menuItems,
    isLoading,
    error,
    deleteMenuItem,
    toggleMenuItemActive,
    isItemPending,
    refreshMenuItems,
    hasPendingOperations
  } = useOptimisticMenuItems(restaurantId);

  // Get unique categories for filter
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  // Filter menu items based on search and filters
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && item.is_active) ||
                         (statusFilter === 'inactive' && !item.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRetry = async () => {
    logger.debug('Retrying menu items fetch');
    refreshMenuItems();
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Menu Items</CardTitle>
          <CardDescription>
            There was a problem loading your menu items. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <RetryButton onRetry={handleRetry} />
            <span className="text-sm text-gray-600">
              {error.message || 'An unexpected error occurred'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Menu Management
                {hasPendingOperations && (
                  <div className="flex items-center gap-1">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-500">Saving...</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Manage your restaurant's menu items
              </CardDescription>
            </div>
            <Button onClick={onAddMenuItem} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Menu Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading menu items..." />
            </div>
          ) : (
            <MenuItemsList
              menuItems={filteredItems}
              onEdit={onEditMenuItem}
              onDelete={deleteMenuItem}
              onToggleActive={toggleMenuItemActive}
              isItemPending={isItemPending}
            />
          )}

          {/* Empty State */}
          {!isLoading && filteredItems.length === 0 && menuItems.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No menu items match your current filters.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {!isLoading && menuItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't added any menu items yet.</p>
              <Button onClick={onAddMenuItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Menu Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default MenuManagementTab;
