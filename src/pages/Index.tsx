
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MenuCard from "@/components/MenuCard";
import CategoryFilter from "@/components/CategoryFilter";
import DietaryFilter from "@/components/DietaryFilter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings, Share } from "lucide-react";
import { Link } from "react-router-dom";

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
  image_url?: string;
  model_url?: string;
  is_active: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  background_color?: string;
  background_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

// Placeholder menu items for demonstration
const placeholderMenuItems: MenuItem[] = [
  {
    id: "placeholder-1",
    title: "Classic Caesar Salad",
    description: "Fresh romaine lettuce, parmesan cheese, croutons, and our signature Caesar dressing",
    price: 12.99,
    category: "appetizers",
    allergens: ["dairy", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    id: "placeholder-2",
    title: "Grilled Salmon",
    description: "Atlantic salmon grilled to perfection, served with roasted vegetables and lemon butter sauce",
    price: 24.99,
    category: "main course",
    allergens: ["fish"],
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: true,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    id: "placeholder-3",
    title: "Vegan Buddha Bowl",
    description: "Quinoa, roasted chickpeas, avocado, sweet potato, and tahini dressing",
    price: 16.99,
    category: "main course",
    allergens: ["sesame"],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    id: "placeholder-4",
    title: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 8.99,
    category: "desserts",
    allergens: ["dairy", "eggs", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    id: "placeholder-5",
    title: "Margherita Pizza",
    description: "Traditional pizza with fresh mozzarella, tomato sauce, and basil",
    price: 18.99,
    category: "pizza",
    allergens: ["dairy", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    id: "placeholder-6",
    title: "Craft Beer Selection",
    description: "Local craft beer rotating selection - ask your server for today's options",
    price: 6.99,
    category: "drinks",
    allergens: ["gluten"],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: false,
    is_nut_free: true,
    is_active: true
  },
  {
    id: "placeholder-7",
    title: "Truffle Pasta",
    description: "Handmade fettuccine with truffle cream sauce and wild mushrooms",
    price: 22.99,
    category: "pasta",
    allergens: ["dairy", "eggs", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    is_active: true
  },
  {
    id: "placeholder-8",
    title: "Thai Green Curry",
    description: "Spicy coconut curry with vegetables, served with jasmine rice",
    price: 19.99,
    category: "main course",
    allergens: [],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_nut_free: false,
    image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    is_active: true
  }
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState([
    { id: "all", name: "All", icon: "🍽️" }
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load restaurant branding data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .single();

      if (restaurantError && restaurantError.code !== 'PGRST116') {
        console.log('Restaurant not found, using defaults');
      } else {
        setRestaurant(restaurantData);
      }

      // Load menu items
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Use placeholder items if no real items exist
      const itemsToShow = data && data.length > 0 ? data : placeholderMenuItems;
      setMenuItems(itemsToShow);
      
      // Extract unique categories and create category filter options
      const uniqueCategories = [...new Set(itemsToShow.map(item => item.category))];
      const categoryOptions = [
        { id: "all", name: "All", icon: "🍽️" },
        ...uniqueCategories.map(category => ({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: getCategoryIcon(category)
        }))
      ];
      setCategories(categoryOptions);
    } catch (error: any) {
      toast({
        title: "Error loading menu",
        description: error.message,
        variant: "destructive"
      });
      // Fall back to placeholder items on error
      setMenuItems(placeholderMenuItems);
      const uniqueCategories = [...new Set(placeholderMenuItems.map(item => item.category))];
      const categoryOptions = [
        { id: "all", name: "All", icon: "🍽️" },
        ...uniqueCategories.map(category => ({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: getCategoryIcon(category)
        }))
      ];
      setCategories(categoryOptions);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      appetizers: "🥗",
      main: "🍖",
      "main course": "🍖",
      "main courses": "🍖",
      desserts: "🍰",
      dessert: "🍰",
      drinks: "🥤",
      drink: "🥤",
      beverages: "🥤",
      salads: "🥗",
      salad: "🥗",
      pizza: "🍕",
      pasta: "🍝",
      soup: "🍲",
      soups: "🍲"
    };
    return icons[category.toLowerCase()] || "🍽️";
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleFilterChange = (filter: string, value: boolean) => {
    setDietaryFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const filteredItems = menuItems.filter(item => {
    // Category filter
    if (activeCategory !== "all" && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }

    // Dietary filters
    if (dietaryFilters.vegetarian && !item.is_vegetarian) {
      return false;
    }
    if (dietaryFilters.vegan && !item.is_vegan) {
      return false;
    }
    if (dietaryFilters.glutenFree && !item.is_gluten_free) {
      return false;
    }
    if (dietaryFilters.nutFree && !item.is_nut_free) {
      return false;
    }

    return true;
  });

  const shareViaText = () => {
    const menuUrl = `${window.location.origin}/`;
    const restaurantName = restaurant?.name || 'Our Menu';
    const message = `Check out ${restaurantName}'s digital menu! Visit: ${menuUrl}`;
    
    // Try to use Web Share API first (mobile-friendly)
    if (navigator.share) {
      navigator.share({
        title: `${restaurantName} Menu`,
        text: message,
        url: menuUrl
      }).catch(err => {
        console.log('Share failed:', err);
        // Fallback to SMS
        fallbackToSMS(message);
      });
    } else {
      // Fallback to SMS
      fallbackToSMS(message);
    }
  };

  const fallbackToSMS = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const smsUrl = `sms:?body=${encodedMessage}`;
    window.open(smsUrl, '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

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
    <div 
      className="min-h-screen"
      style={customStyles}
    >
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
            <Button onClick={shareViaText} variant="outline" size="sm">
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

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <DietaryFilter
          filters={dietaryFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                menuItemId={item.id}
                title={item.title}
                description={item.description || ''}
                price={item.price}
                allergens={item.allergens}
                isVegetarian={item.is_vegetarian}
                isVegan={item.is_vegan}
                isGlutenFree={item.is_gluten_free}
                isNutFree={item.is_nut_free}
                imageUrl={item.image_url}
                splatUrl={item.model_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No menu items found</h3>
            <p className="text-gray-500">
              {menuItems.length === 0 
                ? "The restaurant hasn't added any menu items yet."
                : "No items match your current filters. Try adjusting your selection."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
