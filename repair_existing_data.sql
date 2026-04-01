-- INKORA SQL: Reparo de Dados Existentes
-- Execute no SQL Editor do Supabase para corrigir artistas que se cadastraram antes das correções

-- 1. Criar entradas faltantes na tabela 'artists' para quem já é 'artist' no profile
INSERT INTO public.artists (profile_id)
SELECT id FROM public.profiles 
WHERE role = 'artist' 
ON CONFLICT (profile_id) DO NOTHING;

-- 2. Criar entradas faltantes na tabela 'studios' para quem já é 'studio' no profile
INSERT INTO public.studios (profile_id)
SELECT id FROM public.profiles 
WHERE role = 'studio' 
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Sincronizar nomes e dados do Auth Metadata para o Profile (caso estejam nulos)
-- Nota: Isso só funciona se você rodar como superuser ou se o metadata estiver acessível.
-- Como alternativa, o próprio artista pode agora salvar o perfil e o 'upsert' que criamos vai resolver.

-- 4. Verificar se existem perfis sem nome
SELECT id, email, role FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
-- Se o comando acima retornar algo, significa que o trigger falhou feio no passado.
