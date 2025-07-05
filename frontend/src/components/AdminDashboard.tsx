
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RestaurantProfile from './RestaurantProfile';
import RestaurantBranding from './RestaurantBranding';
import MenuItemForm from './MenuItemForm';
import QRCodeGenerator from './QRCodeGenerator';
import AdminHeader from './admin/AdminHeader';
import AdminTabNavigation from './admin/AdminTabNavigation';
import MenuManagementTab from './admin/MenuManagementTab';
import AnalyticsTab from './admin/AnalyticsTab';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  banner_url?: string;
  background_color?: string;
  background_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

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

interface AdminDashboardProps {
  onSignOut: () => void;
}

const AdminDashboard = ({ onSignOut }: AdminDashboardProps) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'analytics'>('menu');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRestaurantData();
  }, []);

  const loadRestaurantData = async () => {
    try {
      // Load restaurant profile with branding data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .single();

      if (restaurantError && restaurantError.code !== 'PGRST116') {
        throw restaurantError;
      }

      setRestaurant(restaurantData);

      // Load menu items if restaurant exists
      if (restaurantData) {
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .order('sort_order', { ascending: true });

        if (menuError) throw menuError;
        setMenuItems(menuData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantUpdate = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
    loadRestaurantData(); // Reload to get menu items after restaurant is created
  };

  const handleMenuItemSave = () => {
    setShowMenuForm(false);
    setEditingItem(null);
    loadRestaurantData();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const handleAddMenuItem = () => {
    setShowMenuForm(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowMenuForm(true);
  };

  const handleReorderItems = (items: MenuItem[]) => {
    setMenuItems(items);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!restaurant ? (
          <RestaurantProfile
            restaurant={null}
            onUpdate={handleRestaurantUpdate}
          />
        ) : (
          <div className="space-y-8">
            <RestaurantProfile
              restaurant={restaurant}
              onUpdate={handleRestaurantUpdate}
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
                onAddMenuItem={handleAddMenuItem}
                onEditMenuItem={handleEditMenuItem}
                onDeleteMenuItem={loadRestaurantData}
                onReorderItems={handleReorderItems}
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
