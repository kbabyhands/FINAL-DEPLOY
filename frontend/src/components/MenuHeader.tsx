import { Button } from "@/components/ui/button";
import { Settings, Share, Star, ArrowLeft } from "lucide-react";
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
    <button 
      onClick={handleShare} 
      className="btn-secondary"
    >
      <Share className="w-4 h-4 mr-2" />
      Share
    </button>
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
    <header className="relative" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
      {/* Top Navigation */}
      <div className="container">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <Link to="/admin" className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Link>
          </div>
          <ShareButton restaurantName={restaurant?.name} />
        </div>
      </div>

      {/* Hero Content */}
      <div className="hero-section" style={{ minHeight: '400px' }}>
        <div className="container text-center">
          <h1 className="heading-1 mb-6">
            {restaurant?.name || 'Acadiana Superettte'}
          </h1>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Star className="w-6 h-6 fill-current" style={{ color: 'var(--brand-primary)' }} />
            <span className="heading-3">4.6</span>
            <span className="body-medium" style={{ color: 'var(--text-secondary)' }}>(500+ ratings)</span>
          </div>
          
          <p className="body-large max-w-2xl mx-auto mb-12" style={{ color: 'var(--text-secondary)' }}>
            Locally loved. Crafted with care. Tap a dish to explore it in 3D.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="btn-primary">
              Order Online
            </button>
            <button className="btn-secondary">
              Reserve Table
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};