-- Add sort_order column to menu_items table for custom ordering
ALTER TABLE public.menu_items 
ADD COLUMN sort_order integer DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_menu_items_sort_order ON public.menu_items(restaurant_id, sort_order);

-- Update existing menu items to have sequential sort order based on creation date
UPDATE public.menu_items 
SET sort_order = row_number() OVER (PARTITION BY restaurant_id ORDER BY created_at);