
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import RestaurantProfile from './RestaurantProfile';
import RestaurantBranding from './RestaurantBranding';
import MenuItemForm from './MenuItemForm';
import QRCodeGenerator from './QRCodeGenerator';
import AdminHeader from './admin/AdminHeader';
import AdminTabNavigation from './admin/AdminTabNavigation';
import MenuManagementTab from './admin/MenuManagementTab';
import AnalyticsTab from './admin/AnalyticsTab';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Restaurant, MenuItem } from '@/types';
import { logger } from '@/utils/logger';

const AdminDashboard = () => {
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'analytics'>('menu');
  const { toast } = useToast();

  const { 
    restaurant, 
    isLoading: restaurantLoading, 
    updateRestaurant, 
    createRestaurant,
    isUpdating,
    isCreating
  } = useRestaurantData();

  const { 
    menuItems, 
    isLoading: menuItemsLoading, 
    refreshMenuItems 
  } = useMenuItems(restaurant?.id);

  const handleRestaurantUpdate = (updatedRestaurant: Restaurant) => {
    logger.info('Updating restaurant data');
    if (restaurant) {
      updateRestaurant(updatedRestaurant);
    } else {
      createRestaurant(updatedRestaurant);
    }
  };

  const handleMenuItemSave = () => {
    logger.info('Menu item saved, refreshing list');
    setShowMenuForm(false);
    setEditingItem(null);
    refreshMenuItems();
  };

  const handleAddMenuItem = () => {
    logger.debug('Adding new menu item');
    setShowMenuForm(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    logger.debug('Editing menu item:', item.title);
    setEditingItem(item);
    setShowMenuForm(true);
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!restaurant ? (
          <RestaurantProfile
            restaurant={null}
            onUpdate={handleRestaurantUpdate}
            isLoading={isCreating}
          />
        ) : (
          <div className="space-y-8">
            <RestaurantProfile
              restaurant={restaurant}
              onUpdate={handleRestaurantUpdate}
              isLoading={isUpdating}
            />

            <RestaurantBranding
              restaurant={restaurant}
              onUpdate={handleRestaurantUpdate}
            />

            <QRCodeGenerator 
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />

            <AdminTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {activeTab === 'menu' ? (
              <MenuManagementTab
                menuItems={menuItems}
                isLoading={menuItemsLoading}
                onAddMenuItem={handleAddMenuItem}
                onEditMenuItem={handleEditMenuItem}
                restaurantId={restaurant.id}
              />
            ) : (
              <AnalyticsTab restaurantId={restaurant.id} />
            )}
          </div>
        )}

        {showMenuForm && (
          <MenuItemForm
            restaurantId={restaurant?.id || ''}
            menuItem={editingItem}
            onSave={handleMenuItemSave}
            onCancel={() => {
              logger.debug('Menu item form cancelled');
              setShowMenuForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
