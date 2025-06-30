
-- Create storage buckets only if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('menu-images', 'menu-images', true),
  ('3d-models', '3d-models', true),
  ('restaurant-branding', 'restaurant-branding', true),
  ('gaussian-splats', 'gaussian-splats', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access on menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own menu-images" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access on 3d-models" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload 3d-models" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own 3d-models" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own 3d-models" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access on restaurant-branding" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload restaurant-branding" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own restaurant-branding" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own restaurant-branding" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access on gaussian-splats" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload gaussian-splats" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own gaussian-splats" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own gaussian-splats" ON storage.objects;

-- Create storage policies for menu-images bucket
CREATE POLICY "Allow public read access on menu-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Allow authenticated users to upload menu-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own menu-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own menu-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Create storage policies for 3d-models bucket
CREATE POLICY "Allow public read access on 3d-models" ON storage.objects
  FOR SELECT USING (bucket_id = '3d-models');

CREATE POLICY "Allow authenticated users to upload 3d-models" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own 3d-models" ON storage.objects
  FOR UPDATE USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own 3d-models" ON storage.objects
  FOR DELETE USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');

-- Create storage policies for restaurant-branding bucket
CREATE POLICY "Allow public read access on restaurant-branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-branding');

CREATE POLICY "Allow authenticated users to upload restaurant-branding" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own restaurant-branding" ON storage.objects
  FOR UPDATE USING (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own restaurant-branding" ON storage.objects
  FOR DELETE USING (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');

-- Create storage policies for gaussian-splats bucket
CREATE POLICY "Allow public read access on gaussian-splats" ON storage.objects
  FOR SELECT USING (bucket_id = 'gaussian-splats');

CREATE POLICY "Allow authenticated users to upload gaussian-splats" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gaussian-splats' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own gaussian-splats" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gaussian-splats' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own gaussian-splats" ON storage.objects
  FOR DELETE USING (bucket_id = 'gaussian-splats' AND auth.role() = 'authenticated');
