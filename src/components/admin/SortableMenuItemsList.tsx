import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableMenuItem } from './SortableMenuItem';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  model_url?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

interface SortableMenuItemsListProps {
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: () => void;
  onReorder: (items: MenuItem[]) => void;
}

const SortableMenuItemsList = ({ 
  menuItems, 
  onEdit, 
  onDelete, 
  onReorder 
}: SortableMenuItemsListProps) => {
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = menuItems.findIndex(item => item.id === active.id);
      const newIndex = menuItems.findIndex(item => item.id === over?.id);
      
      const newItems = arrayMove(menuItems, oldIndex, newIndex);
      
      // Update sort order values
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        sort_order: index + 1
      }));
      
      // Optimistically update the UI
      onReorder(updatedItems);
      
      try {
        // Update sort order in database
        const updates = updatedItems.map((item, index) => ({
          id: item.id,
          sort_order: index + 1
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from('menu_items')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id);
            
          if (error) throw error;
        }

        toast({
          title: "Success",
          description: "Menu items reordered successfully"
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to save new order: " + error.message,
          variant: "destructive"
        });
        // Revert on error
        onDelete(); // This will trigger a reload
      }
    }
  };

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No menu items yet. Click "Add Menu Item" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
        <span>💡 Tip: Drag and drop items to reorder them on your menu</span>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={menuItems.map(item => item.id)} 
          strategy={verticalListSortingStrategy}
        >
          {menuItems.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableMenuItemsList;