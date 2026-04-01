-- Create guest_spots table
CREATE TABLE IF NOT EXISTS public.guest_spots (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  location_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.guest_spots ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Guest spots are viewable by everyone." ON public.guest_spots;
CREATE POLICY "Guest spots are viewable by everyone." ON public.guest_spots 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Artists can insert their own guest spots." ON public.guest_spots;
CREATE POLICY "Artists can insert their own guest spots." ON public.guest_spots 
FOR INSERT WITH CHECK (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Artists can update their own guest spots." ON public.guest_spots;
CREATE POLICY "Artists can update their own guest spots." ON public.guest_spots 
FOR UPDATE USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Artists can delete their own guest spots." ON public.guest_spots;
CREATE POLICY "Artists can delete their own guest spots." ON public.guest_spots 
FOR DELETE USING (auth.uid() = artist_id);
