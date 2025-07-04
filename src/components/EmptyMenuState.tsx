interface EmptyMenuStateProps {
  hasItems: boolean;
}

export const EmptyMenuState = ({ hasItems }: EmptyMenuStateProps) => {
  return (
    <div className="text-center py-16">
      <h3 className="text-xl font-semibold text-gray-600 mb-2">No menu items found</h3>
      <p className="text-gray-500">
        {!hasItems 
          ? "The restaurant hasn't added any menu items yet."
          : "No items match your current filters. Try adjusting your selection."
        }
      </p>
    </div>
  );
};