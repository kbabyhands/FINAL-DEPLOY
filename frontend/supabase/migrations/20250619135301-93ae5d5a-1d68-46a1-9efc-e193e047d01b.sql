
-- Create a table for restaurant profiles
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for menu items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  allergens TEXT[] DEFAULT '{}',
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_nut_free BOOLEAN DEFAULT false,
  model_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public)
VALUES ('3d-models', '3d-models', true);

-- Create a storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Restaurant policies
CREATE POLICY "Restaurants can view their own profile" 
  ON public.restaurants 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Restaurants can create their own profile" 
  ON public.restaurants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurants can update their own profile" 
  ON public.restaurants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Menu items policies
CREATE POLICY "Restaurants can view their own menu items" 
  ON public.menu_items 
  FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Restaurants can create their own menu items" 
  ON public.menu_items 
  FOR INSERT 
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Restaurants can update their own menu items" 
  ON public.menu_items 
  FOR UPDATE 
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Restaurants can delete their own menu items" 
  ON public.menu_items 
  FOR DELETE 
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Public can view active menu items from all restaurants
CREATE POLICY "Public can view active menu items" 
  ON public.menu_items 
  FOR SELECT 
  USING (is_active = true);

-- Storage policies for 3D models
CREATE POLICY "Anyone can view 3D models" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = '3d-models');

CREATE POLICY "Authenticated users can upload 3D models" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own 3D models" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = '3d-models' AND auth.uid()::text = (metadata->>'user_id'));

CREATE POLICY "Users can delete their own 3D models" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = '3d-models' AND auth.uid()::text = (metadata->>'user_id'));

-- Storage policies for menu images
CREATE POLICY "Anyone can view menu images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload menu images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own menu images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'menu-images' AND auth.uid()::text = (metadata->>'user_id'));

CREATE POLICY "Users can delete their own menu images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'menu-images' AND auth.uid()::text = (metadata->>'user_id'));
