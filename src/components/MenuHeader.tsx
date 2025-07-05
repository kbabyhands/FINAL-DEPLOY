import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Settings, Share, Star } from "lucide-react";
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

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with controls */}
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Restaurant info */}
        <div className="pb-6">
          <div className="flex items-start space-x-4">
            {restaurant?.logo_url && (
              <img 
                src={restaurant.logo_url} 
                alt="Restaurant Logo" 
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {restaurant?.name || 'Our Menu'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>4.6 (500+ ratings)</span>
                </div>
                <span>•</span>
                <span>25-40 min</span>
                <span>•</span>
                <span>$2.99 delivery</span>
              </div>
              <p className="text-muted-foreground">
                {restaurant?.description || 'Explore our delicious offerings'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};