import { Button } from "@/components/ui/button";
import { Settings, Share, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { shareViaText } from "@/utils/shareMenu";
import { Restaurant } from "@/hooks/useMenuData";

interface ShareButtonProps {
  restaurantName: string | undefined;
}

const ShareButton = ({ restaurantName }: ShareButtonProps) => {
  const handleShare = () => {
    shareViaText(restaurantName);
  };

  return (
    <Button onClick={handleShare} variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
      <Share className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
};

interface MenuHeaderProps {
  restaurant: Restaurant | null;
}

export const MenuHeader = ({ restaurant }: MenuHeaderProps) => {
  const handleShare = () => {
    shareViaText(restaurant?.name);
  };

  return (
    <header className="relative min-h-[400px] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950 dark:via-orange-950 dark:to-red-950 overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop&crop=center')`,
          filter: 'blur(2px) brightness(0.3)'
        }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-white/80 hover:text-white transition-colors">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
          <ShareButton restaurantName={restaurant?.name} />
        </div>

        {/* Hero Content */}
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-6xl font-serif font-light mb-4 tracking-wide text-shadow-lg">
            {restaurant?.name || 'Acadiana Superettte'}
          </h1>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-xl font-medium">4.6</span>
            <span className="text-white/80">(500+ ratings)</span>
          </div>
          
          <p className="text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
            Locally loved. Crafted with care. Tap a dish to explore it in 3D.
          </p>
        </div>
      </div>
    </header>
  );
};