import { Button } from "@/components/ui/button";
import { Settings, Share, ArrowLeft } from "lucide-react";
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
    <header className="relative overflow-hidden">
      {/* Luxury Restaurant Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1687945512099-400cbe94460c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50fGVufDB8fHx8MTc1MjE5NDUzOXww&ixlib=rb-4.1.0&q=85')`,
          filter: 'blur(1px) brightness(0.4)'
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <div className="container">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ShareButton restaurantName={restaurant?.name} />
              <Link to="/admin" className="btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Content with Luxury Background */}
        <div className="container text-center py-20">
          <h1 className="heading-1 mb-6 text-white">
            {restaurant?.name || 'Acadiana Superettte'}
          </h1>
          
          <p className="body-large max-w-2xl mx-auto mb-12 text-white/90">
            Locally loved. Crafted with care. Tap a dish to explore it in 3D.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="btn-primary">
              Order Online
            </button>
            <button className="btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              Reserve Table
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};