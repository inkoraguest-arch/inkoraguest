-- Script SQL para o Sistema de Avaliações
-- Adiciona suporte a notas (estrelas) e marcação de artistas nas postagens

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tagged_profile_id UUID REFERENCES public.profiles(id);

-- Opcional: Adicionar índices para performance de busca por artista marcado
CREATE INDEX IF NOT EXISTS idx_posts_tagged_profile ON public.posts(tagged_profile_id);
