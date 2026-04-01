-- 1. Coluna de Endereço (Profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

-- 2. Limpar políticas antigas (Standalone DROP commands)
DROP POLICY IF EXISTS "Artists can update own details." ON public.artists;
DROP POLICY IF EXISTS "Artists can insert own details." ON public.artists;
DROP POLICY IF EXISTS "Studios can update own details." ON public.studios;
DROP POLICY IF EXISTS "Studios can insert own details." ON public.studios;

-- 3. Criar novas políticas de gerenciamento total (ALL)
CREATE POLICY "Artists can manage own details." ON public.artists FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Studios can manage own details." ON public.studios FOR ALL USING (auth.uid() = profile_id);
