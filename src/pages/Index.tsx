
import { useState } from "react";
import MenuCard from "@/components/MenuCard";
import CategoryFilter from "@/components/CategoryFilter";
import DietaryFilter from "@/components/DietaryFilter";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
  });

  const categories = [
    { id: "all", name: "All", icon: "🍽️" },
    { id: "appetizers", name: "Appetizers", icon: "🥗" },
    { id: "main", name: "Main Courses", icon: "🍖" },
    { id: "desserts", name: "Desserts", icon: "🍰" },
    { id: "drinks", name: "Drinks", icon: "🥤" },
  ];

  const menuItems = [
    {
      id: 1,
      title: "Margherita Pizza",
      description: "Classic delight with AOP San Marzano tomatoes, mozzarella di bufala campana AOP, fresh basil, salt, extra virgin olive oil. Our pizza dough is...",
      price: 12.99,
      category: "main",
      allergens: ["Gluten", "Dairy"],
      isVegetarian: true,
    },
    {
      id: 2,
      title: "Caesar Salad",
      description: "Crisp romaine lettuce, Parmesan cheese, house-made croutons, and a creamy Caesar dressing. Option to add grilled chicken for an additional...",
      price: 9.50,
      category: "appetizers",
      allergens: ["Gluten", "Dairy", "Fish (dressing)"],
    },
    {
      id: 3,
      title: "Chocolate Lava Cake",
      description: "Decadent molten chocolate cake with a gooey center, served warm with a scoop of vanilla bean ice cream and a fresh raspberry coulis.",
      price: 7.99,
      category: "desserts",
      allergens: ["Gluten", "Dairy", "Eggs"],
      isVegetarian: true,
    },
    {
      id: 4,
      title: "Spaghetti Carbonara",
      description: "Authentic Italian pasta dish made with spaghetti, crispy pancetta, pecorino romano cheese, fresh egg yolks, and a generous amount of black...",
      price: 15.00,
      category: "main",
      allergens: ["Gluten", "Dairy", "Eggs"],
    },
  ];

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
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }

    // Dietary filters
    if (dietaryFilters.vegetarian && !item.isVegetarian) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Our Menu</h1>
          <p className="text-gray-600 text-lg">
            Explore our delicious offerings. Filter by category or dietary needs.
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              title={item.title}
              description={item.description}
              price={item.price}
              allergens={item.allergens}
              isVegetarian={item.isVegetarian}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
