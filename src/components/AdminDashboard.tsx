
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, BarChart3 } from 'lucide-react';
import RestaurantProfile from './RestaurantProfile';
import RestaurantBranding from './RestaurantBranding';
import MenuItemsList from './MenuItemsList';
import MenuItemForm from './MenuItemForm';
import QRCodeGenerator from './QRCodeGenerator';
import AnalyticsDashboard from './AnalyticsDashboard';

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
          .order('created_at', { ascending: false });

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Admin</h1>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

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

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'menu' ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Menu Items</CardTitle>
                      <CardDescription>
                        Manage your restaurant's menu items
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowMenuForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MenuItemsList
                    menuItems={menuItems}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowMenuForm(true);
                    }}
                    onDelete={loadRestaurantData}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Insights into your menu performance and customer preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard restaurantId={restaurant.id} />
                </CardContent>
              </Card>
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
