export interface MenuItem {
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

export const placeholderMenuItems: MenuItem[] = [
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