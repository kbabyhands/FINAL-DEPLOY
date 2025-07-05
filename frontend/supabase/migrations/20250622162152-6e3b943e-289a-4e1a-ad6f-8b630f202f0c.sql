
-- Add customization columns to the restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN logo_url TEXT,
ADD COLUMN banner_url TEXT,
ADD COLUMN background_color TEXT DEFAULT '#f9fafb',
ADD COLUMN background_image_url TEXT,
ADD COLUMN primary_color TEXT DEFAULT '#1e40af',
ADD COLUMN secondary_color TEXT DEFAULT '#64748b',
ADD COLUMN font_family TEXT DEFAULT 'Inter';

-- Create a storage bucket for restaurant branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-branding', 'restaurant-branding', true);

-- Storage policies for restaurant branding assets
CREATE POLICY "Anyone can view restaurant branding assets" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'restaurant-branding');

CREATE POLICY "Authenticated users can upload restaurant branding assets" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own restaurant branding assets" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'restaurant-branding' AND auth.uid()::text = (metadata->>'user_id'));

CREATE POLICY "Users can delete their own restaurant branding assets" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'restaurant-branding' AND auth.uid()::text = (metadata->>'user_id'));
