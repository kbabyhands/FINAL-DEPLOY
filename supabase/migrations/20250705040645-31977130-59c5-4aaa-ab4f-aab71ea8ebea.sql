-- Add sort_order column to menu_items table for custom ordering
ALTER TABLE public.menu_items 
ADD COLUMN sort_order integer DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_menu_items_sort_order ON public.menu_items(restaurant_id, sort_order);

-- Update existing menu items to have sequential sort order using a CTE
WITH ordered_items AS (
  SELECT id, row_number() OVER (PARTITION BY restaurant_id ORDER BY created_at) as new_order
  FROM public.menu_items
)
UPDATE public.menu_items 
SET sort_order = ordered_items.new_order
FROM ordered_items
WHERE menu_items.id = ordered_items.id;