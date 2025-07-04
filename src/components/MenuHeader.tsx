import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Settings, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { shareViaText } from "@/utils/shareMenu";
import { Restaurant } from "@/hooks/useMenuData";

interface MenuHeaderProps {
  restaurant: Restaurant | null;
}

export const MenuHeader = ({ restaurant }: MenuHeaderProps) => {
  const handleShare = () => {
    shareViaText(restaurant?.name);
  };

  const customStyles = restaurant ? {
    backgroundColor: restaurant.background_color || '#f9fafb',
    backgroundImage: restaurant.background_image_url 
      ? `url(${restaurant.background_image_url})` 
      : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: restaurant.font_family || 'Inter'
  } : {};

  return (
    <>
      {/* Background overlay for better readability when background image is used */}
      {restaurant?.background_image_url && (
        <div className="fixed inset-0 bg-white bg-opacity-90 -z-10"></div>
      )}

      {/* Header with custom branding */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center relative">
          {/* Banner Image */}
          {restaurant?.banner_url && (
            <div className="mb-6">
              <img 
                src={restaurant.banner_url} 
                alt="Restaurant Banner" 
                className="w-full h-32 md:h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Logo */}
          {restaurant?.logo_url && (
            <div className="mb-4">
              <img 
                src={restaurant.logo_url} 
                alt="Restaurant Logo" 
                className="h-16 md:h-20 mx-auto object-contain"
              />
            </div>
          )}

          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              color: restaurant?.primary_color || '#1e40af',
              fontFamily: restaurant?.font_family || 'Inter'
            }}
          >
            {restaurant?.name || 'Our Menu'}
          </h1>
          <p 
            className="text-lg"
            style={{ color: restaurant?.secondary_color || '#6b7280' }}
          >
            {restaurant?.description || 'Explore our delicious offerings. Filter by category or dietary needs.'}
          </p>
          
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <DarkModeToggle />
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share Menu
            </Button>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};