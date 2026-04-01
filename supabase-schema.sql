CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone,
  role text NOT NULL CHECK (role IN ('client', 'artist', 'studio')),
  full_name text,
  avatar_url text,
  city text,
  state text,
  phone text,
  instagram text
);

CREATE TABLE public.artists (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  cpf text,
  years_of_experience integer,
  primary_styles text[],
  bio text,
  portfolio_urls text[]
);

CREATE TABLE public.studios (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  cnpj text,
  creation_date date,
  total_benches integer,
  guest_spots_available text,
  studio_photos text[]
);

CREATE TABLE public.posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  coupon_code text
);

CREATE TABLE public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  category text CHECK (category IN ('flash', 'print', 'supply', 'other'))
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'role'
  );
  
  IF new.raw_user_meta_data->>'role' = 'artist' THEN
    INSERT INTO public.artists (profile_id) VALUES (new.id);
  ELSIF new.raw_user_meta_data->>'role' = 'studio' THEN
    INSERT INTO public.studios (profile_id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public artists are viewable by everyone." ON public.artists FOR SELECT USING (true);
CREATE POLICY "Artists can update own details." ON public.artists FOR UPDATE USING (auth.uid() = profile_id);

ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public studios are viewable by everyone." ON public.studios FOR SELECT USING (true);
CREATE POLICY "Studios can update own details." ON public.studios FOR UPDATE USING (auth.uid() = profile_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can create products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
