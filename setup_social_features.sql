-- Execute esse código no SQL Editor do Supabase para habilitar Curtidas, Comentários e Notificações

-- 1. Tabela de Curtidas (Likes)
CREATE TABLE public.post_likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 2. Tabela de Comentários (Comments)
CREATE TABLE public.post_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Notificações (Notifications)
CREATE TABLE public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'like', 'comment', 'new_post'
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone." ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes." ON public.post_likes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone." ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage their own comments." ON public.post_comments FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications." ON public.notifications FOR INSERT WITH CHECK (true);
