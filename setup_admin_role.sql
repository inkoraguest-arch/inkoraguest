-- INKORA ADMIN SETUP
-- Execute no SQL Editor do Supabase

-- 1. Atualizar a constraint de role para incluir 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'artist', 'studio', 'admin'));

-- 2. Definir o usuário específico como admin
-- Substitua pelo ID real se o subquery falhar no seu ambiente
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'yurilojavirtual@gmail.com'
);

-- 3. Criar tabela de Logs do Sistema
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  level text DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 4. RLS para Logs (Apenas admins podem ver)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can see all logs" ON public.system_logs;
CREATE POLICY "Admins can see all logs" 
ON public.system_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
CREATE POLICY "System can insert logs" 
ON public.system_logs FOR INSERT 
WITH CHECK (true); -- Permitir que o app insira logs (erros)

-- 5. Política para Admins verem todos os perfis (Caso queira debugar Marcelino, etc.)
-- O select de perfis já é público, mas vamos garantir acesso total para futuras funções
