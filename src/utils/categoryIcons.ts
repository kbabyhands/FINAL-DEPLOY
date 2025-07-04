export const getCategoryIcon = (category: string) => {
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