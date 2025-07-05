
-- Create a table to track menu item views/interactions
CREATE TABLE public.menu_item_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_session TEXT, -- For tracking unique sessions without requiring auth
  ip_address TEXT
);

-- Create an index for better query performance
CREATE INDEX idx_menu_item_views_item_id ON public.menu_item_views(menu_item_id);
CREATE INDEX idx_menu_item_views_date ON public.menu_item_views(viewed_at);

-- Add a view_count column to menu_items for quick access (denormalized)
ALTER TABLE public.menu_items ADD COLUMN view_count INTEGER DEFAULT 0;

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION increment_menu_item_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items 
  SET view_count = view_count + 1 
  WHERE id = NEW.menu_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update view_count when a view is recorded
CREATE TRIGGER update_menu_item_view_count
  AFTER INSERT ON public.menu_item_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_menu_item_views();

-- Enable RLS for menu_item_views (allow public read access for analytics)
ALTER TABLE public.menu_item_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert view records (for tracking)
CREATE POLICY "Anyone can record menu item views" 
  ON public.menu_item_views 
  FOR INSERT 
  WITH CHECK (true);

-- Allow restaurant owners to view their menu item analytics
CREATE POLICY "Restaurant owners can view their menu analytics" 
  ON public.menu_item_views 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_items mi 
      JOIN public.restaurants r ON mi.restaurant_id = r.id 
      WHERE mi.id = menu_item_views.menu_item_id 
      AND r.user_id = auth.uid()
    )
  );
