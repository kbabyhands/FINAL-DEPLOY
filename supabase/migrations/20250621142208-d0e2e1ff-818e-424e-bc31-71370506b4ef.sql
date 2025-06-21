
-- Create a table for menu item reviews
CREATE TABLE public.menu_item_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.menu_item_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to view all reviews (for displaying on menu)
CREATE POLICY "Public can view all reviews" 
  ON public.menu_item_reviews 
  FOR SELECT 
  USING (true);

-- Allow anyone to create reviews (anonymous reviews allowed)
CREATE POLICY "Anyone can create reviews" 
  ON public.menu_item_reviews 
  FOR INSERT 
  WITH CHECK (true);

-- Create an index for better performance when fetching reviews by menu item
CREATE INDEX idx_menu_item_reviews_menu_item_id ON public.menu_item_reviews(menu_item_id);

-- Create an index for ordering by creation date
CREATE INDEX idx_menu_item_reviews_created_at ON public.menu_item_reviews(created_at DESC);
