import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import PlayCanvasViewer from "@/components/PlayCanvasViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import ReviewsSection from "@/components/ReviewsSection";
import DietaryBadges from "@/components/DietaryBadges";

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  model_url?: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_nut_free?: boolean;
  allergens?: string[];
}

const MenuItemViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("id, title, description, price, model_url, image_url, is_vegetarian, is_vegan, is_gluten_free, is_nut_free, allergens")
          .eq("id", id)
          .single();

        if (error) throw error;
        setMenuItem(data);
      } catch (error) {
        console.error("Error fetching menu item:", error);
        toast({
          title: "Error",
          description: "Failed to load menu item",
          variant: "destructive",
        });
        navigate("/menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }} className="body-medium">Loading menu item...</p>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div style={{ background: 'var(--bg-page)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-2 mb-6" style={{ color: 'var(--text-primary)' }}>Menu item not found</h2>
          <button onClick={() => navigate("/menu")} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      {/* Header Navigation */}
      <div className="container py-6">
        <button
          onClick={() => navigate("/menu")}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </button>
      </div>

      {/* Main Content - Premium Layout */}
      <div className="container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column - 3D Viewer (Takes 2/3 of space) */}
          <div className="lg:col-span-2">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="heading-1 mb-4" style={{ color: 'var(--text-primary)' }}>
                {menuItem.title}
              </h1>
              {menuItem.description && (
                <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
                  {menuItem.description}
                </p>
              )}
            </div>

            {/* Large 3D Viewer - Main Focus */}
            <div 
              className="service-card p-0 overflow-hidden mb-8"
              style={{ height: '600px', borderRadius: '20px' }}
            >
              <div className="w-full h-full">
                {menuItem.model_url ? (
                  <PlayCanvasViewer
                    splatUrl={menuItem.model_url}
                    width="100%"
                    height="600"
                    autoRotate={true}
                    enableControls={true}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-section)' }}>
                    <div className="text-center">
                      <p className="body-large mb-2" style={{ color: 'var(--text-muted)' }}>No 3D model available</p>
                      <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                        This item doesn't have a 3D model to display
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="service-card">
              <h3 className="heading-3 mb-6" style={{ color: 'var(--text-primary)' }}>
                Customer Reviews
              </h3>
              <ReviewsSection menuItemId={menuItem.id} />
            </div>
          </div>

          {/* Right Column - Details (Takes 1/3 of space) */}
          <div className="space-y-6">
            
            {/* Price Card */}
            <div className="service-card text-center">
              <div 
                className="text-4xl font-bold mb-2 px-6 py-4 rounded-xl"
                style={{ 
                  color: 'var(--brand-primary)',
                  background: 'var(--bg-section)'
                }}
              >
                ${menuItem.price.toFixed(2)}
              </div>
              <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                Premium Quality
              </p>
            </div>

            {/* Dietary Information */}
            <div className="service-card">
              <h3 className="heading-3 mb-4" style={{ color: 'var(--brand-primary)' }}>
                🌿 Dietary Information
              </h3>
              <div className="flex flex-wrap gap-2">
                <DietaryBadges
                  isVegetarian={menuItem.is_vegetarian}
                  isVegan={menuItem.is_vegan}
                  isGlutenFree={menuItem.is_gluten_free}
                  isNutFree={menuItem.is_nut_free}
                />
              </div>
            </div>

            {/* Allergen Information */}
            <div className="service-card">
              <h3 className="heading-3 mb-4" style={{ color: 'var(--brand-primary)' }}>
                🛡️ Allergen Information
              </h3>
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  background: 'var(--bg-section)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <p className="body-medium" style={{ color: 'var(--text-primary)' }}>
                  <strong>Contains:</strong> {menuItem.allergens?.length ? menuItem.allergens.join(', ') : 'None'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button className="btn-primary w-full">
                Add to Order
              </button>
              <button className="btn-secondary w-full">
                Share Item
              </button>
            </div>

            {/* Quick Stats */}
            <div className="service-card">
              <h3 className="heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
                Item Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="body-medium" style={{ color: 'var(--text-secondary)' }}>Category</span>
                  <span className="body-medium font-medium" style={{ color: 'var(--text-primary)' }}>Sandwich</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-medium" style={{ color: 'var(--text-secondary)' }}>Prep Time</span>
                  <span className="body-medium font-medium" style={{ color: 'var(--text-primary)' }}>8-12 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-medium" style={{ color: 'var(--text-secondary)' }}>Calories</span>
                  <span className="body-medium font-medium" style={{ color: 'var(--text-primary)' }}>~650</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemViewer;