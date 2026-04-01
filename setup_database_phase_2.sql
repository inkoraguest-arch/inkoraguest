-- ==========================================
-- INKORA DATABASE SETUP - PHASE 2 (UPDATES)
-- Execute esse script no SQL Editor do Supabase
-- ==========================================

-- 1. GEOLOCALIZAÇÃO (Profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- 2. CAMPOS ADICIONAIS (Artists)
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS price_range text DEFAULT 'R$ 300 - R$ 800',
ADD COLUMN IF NOT EXISTS schedule_text text DEFAULT 'Atendimento na base de São Paulo. Próxima viagem: indeterminada.',
ADD COLUMN IF NOT EXISTS spots_status text DEFAULT 'Aceitando Orçamentos';

-- 3. INTERAÇÕES SOCIAIS (Likes, Comments, Notifications)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'like', 'comment', 'new_post'
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CALENDÁRIO DE DISPONIBILIDADE
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slot_date date NOT NULL,
  slot_time text NOT NULL, -- Ex: "10:00", "14:00"
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'pending')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SEGURANÇA (RLS)
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes are viewable by everyone." ON public.post_likes;
CREATE POLICY "Likes are viewable by everyone." ON public.post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own likes." ON public.post_likes;
CREATE POLICY "Users can manage their own likes." ON public.post_likes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.post_comments;
CREATE POLICY "Comments are viewable by everyone." ON public.post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own comments." ON public.post_comments;
CREATE POLICY "Users can manage their own comments." ON public.post_comments FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own notifications." ON public.notifications;
CREATE POLICY "Users can see their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can create notifications." ON public.notifications;
CREATE POLICY "System can create notifications." ON public.notifications FOR INSERT WITH CHECK (true);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Availability is viewable by everyone." ON public.availability_slots;
CREATE POLICY "Availability is viewable by everyone." ON public.availability_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artists can manage their own availability." ON public.availability_slots;
CREATE POLICY "Artists can manage their own availability." ON public.availability_slots FOR ALL USING (auth.uid() = artist_id);
