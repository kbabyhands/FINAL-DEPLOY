
-- Create storage buckets for file uploads (skip if they already exist)
INSERT INTO storage.buckets (id, name, public) VALUES 
('menu-images', 'menu-images', true),
('3d-models', '3d-models', true),
('restaurant-branding', 'restaurant-branding', true),
('gaussian-splats', 'gaussian-splats', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
-- For menu-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own menu images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own menu images" ON storage.objects;

-- For 3d-models bucket
DROP POLICY IF EXISTS "Authenticated users can upload 3d models" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own 3d models" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own 3d models" ON storage.objects;

-- For restaurant-branding bucket
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own branding assets" ON storage.objects;

-- For gaussian-splats bucket
DROP POLICY IF EXISTS "Authenticated users can upload gaussian splats" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gaussian splats" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own gaussian splats" ON storage.objects;

-- Create new policies with unique names
CREATE POLICY "Allow public read access to all files" ON storage.objects FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to upload menu images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to update menu images" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to delete menu images" ON storage.objects FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload 3d models" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to update 3d models" ON storage.objects FOR UPDATE USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to delete 3d models" ON storage.objects FOR DELETE USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload branding assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to update branding assets" ON storage.objects FOR UPDATE USING (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to delete branding assets" ON storage.objects FOR DELETE USING (bucket_id = 'restaurant-branding' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload gaussian splats" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gaussian-splats' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to update gaussian splats" ON storage.objects FOR UPDATE USING (bucket_id = 'gaussian-splats' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to delete gaussian splats" ON storage.objects FOR DELETE USING (bucket_id = 'gaussian-splats' AND auth.role() = 'authenticated');
