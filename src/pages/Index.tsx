import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MenuCard from "@/components/MenuCard";
import CategoryFilter from "@/components/CategoryFilter";
import DietaryFilter from "@/components/DietaryFilter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
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

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState([
    { id: "all", name: "All", icon: "🍽️" }
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMenuItems(data || []);
      
      // Extract unique categories and create category filter options
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center relative">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Our Menu</h1>
          <p className="text-gray-600 text-lg">
            Explore our delicious offerings. Filter by category or dietary needs.
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
                title={item.title}
                description={item.description || ''}
                price={item.price}
                allergens={item.allergens}
                isVegetarian={item.is_vegetarian}
                isVegan={item.is_vegan}
                isGlutenFree={item.is_gluten_free}
                isNutFree={item.is_nut_free}
                imageUrl={item.image_url}
                modelUrl={item.model_url}
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
