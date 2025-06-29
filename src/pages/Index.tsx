import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MenuCard from "@/components/MenuCard";
import SortingFilterDropdown from "@/components/SortingFilterDropdown";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { MenuItem, Restaurant, Category, DietaryFilters } from "@/types";
import { useErrorHandler } from "@/utils/errorHandler";

// Placeholder menu items for demonstration with proper UUID format
const placeholderMenuItems: MenuItem[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Classic Caesar Salad",
    description: "Fresh romaine lettuce, parmesan cheese, croutons, and our signature Caesar dressing",
    price: 12.99,
    category: "appetizers",
    allergens: ["dairy", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Grilled Salmon",
    description: "Atlantic salmon grilled to perfection, served with roasted vegetables and lemon butter sauce",
    price: 24.99,
    category: "main course",
    allergens: ["fish"],
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: true,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Vegan Buddha Bowl",
    description: "Quinoa, roasted chickpeas, avocado, sweet potato, and tahini dressing",
    price: 16.99,
    category: "main course",
    allergens: ["sesame"],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 8.99,
    category: "desserts",
    allergens: ["dairy", "eggs", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Margherita Pizza",
    description: "Traditional pizza with fresh mozzarella, tomato sauce, and basil",
    price: 18.99,
    category: "pizza",
    allergens: ["dairy", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Craft Beer Selection",
    description: "Local craft beer rotating selection - ask your server for today's options",
    price: 6.99,
    category: "drinks",
    allergens: ["gluten"],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Truffle Pasta",
    description: "Handmade fettuccine with truffle cream sauce and wild mushrooms",
    price: 22.99,
    category: "pasta",
    allergens: ["dairy", "eggs", "gluten"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_nut_free: true,
    image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    title: "Thai Green Curry",
    description: "Spicy coconut curry with vegetables, served with jasmine rice",
    price: 19.99,
    category: "main course",
    allergens: [],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_nut_free: false,
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    is_active: true,
    restaurant_id: "your_restaurant_id"
  }
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All", icon: "🍽️" }
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { handleSupabaseError } = useErrorHandler();

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
      const categoryOptions: Category[] = [
        { id: "all", name: "All", icon: "🍽️" },
        ...uniqueCategories.map(category => ({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: getCategoryIcon(category)
        }))
      ];
      setCategories(categoryOptions);
    } catch (error: any) {
      handleSupabaseError(error, 'loading menu');
      // Fall back to placeholder items on error
      setMenuItems(placeholderMenuItems);
      const uniqueCategories = [...new Set(placeholderMenuItems.map(item => item.category))];
      const categoryOptions: Category[] = [
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
          
          {/* Admin Link */}
          <div className="absolute top-4 right-4">
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
        <SortingFilterDropdown
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          dietaryFilters={dietaryFilters}
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
