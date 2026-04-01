-- Execute esse código no SQL Editor do Supabase para suportar o recurso de Geolocalização (Busca de Estúdios Próximos)

ALTER TABLE public.profiles 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;

-- Comentário: Você pode atualizar as coordenadas de um estúdio manualmente para testar, por exemplo:
-- UPDATE public.profiles SET latitude = -23.5505, longitude = -46.6333 WHERE role = 'studio'; -- (Exemplo: São Paulo)
