
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.menu_item_reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.menu_item_reviews;
DROP POLICY IF EXISTS "Restaurant owners can view reviews for their items" ON public.menu_item_reviews;
DROP POLICY IF EXISTS "Anyone can create views" ON public.menu_item_views;
DROP POLICY IF EXISTS "Restaurant owners can view analytics for their items" ON public.menu_item_views;
DROP POLICY IF EXISTS "Users can view their own restaurant profile" ON public.restaurants;
DROP POLICY IF EXISTS "Users can create their own restaurant profile" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurant profile" ON public.restaurants;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create missing storage buckets (they may already exist, so we use ON CONFLICT to avoid errors)
INSERT INTO storage.buckets (id, name, public) VALUES 
('menu-images', 'menu-images', true),
('3d-models', '3d-models', true),
('restaurant-branding', 'restaurant-branding', true),
('gaussian-splats', 'gaussian-splats', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables that need it
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_views ENABLE ROW LEVEL SECURITY;

-- Restaurant policies
CREATE POLICY "Users can view their own restaurant profile" 
  ON public.restaurants 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own restaurant profile" 
  ON public.restaurants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant profile" 
  ON public.restaurants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Menu items policies
CREATE POLICY "Public can view active menu items from all restaurants" 
  ON public.menu_items 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Restaurant owners can view all their menu items" 
  ON public.menu_items 
  FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Restaurant owners can create menu items" 
  ON public.menu_items 
  FOR INSERT 
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Restaurant owners can update their menu items" 
  ON public.menu_items 
  FOR UPDATE 
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Restaurant owners can delete their menu items" 
  ON public.menu_items 
  FOR DELETE 
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Menu item reviews policies
CREATE POLICY "Anyone can view reviews" 
  ON public.menu_item_reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create reviews" 
  ON public.menu_item_reviews 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Restaurant owners can view reviews for their items" 
  ON public.menu_item_reviews 
  FOR SELECT 
  USING (menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi 
    JOIN public.restaurants r ON mi.restaurant_id = r.id 
    WHERE r.user_id = auth.uid()
  ));

-- Menu item views policies (for analytics)
CREATE POLICY "Anyone can create views" 
  ON public.menu_item_views 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Restaurant owners can view analytics for their items" 
  ON public.menu_item_views 
  FOR SELECT 
  USING (menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi 
    JOIN public.restaurants r ON mi.restaurant_id = r.id 
    WHERE r.user_id = auth.uid()
  ));

-- Storage policies for all buckets
CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload files" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own files" ON storage.objects 
FOR DELETE USING (auth.role() = 'authenticated');
