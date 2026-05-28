-- Execute esse script no SQL Editor do Supabase para corrigir os erros ao Editar o Perfil

-- 1. Corrige a tabela de estúdios que estava faltando colunas:
ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS price_range text DEFAULT 'R$ 300 - R$ 800',
ADD COLUMN IF NOT EXISTS schedule_text text DEFAULT 'Horário de funcionamento padrão.',
ADD COLUMN IF NOT EXISTS spots_status text DEFAULT 'Vagas para Guest Abertas';

-- 2. Adiciona a chave PIX aos perfis gerais (necessária para pagamentos)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pix_key text;
