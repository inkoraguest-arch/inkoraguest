-- INKORA SQL FIX: Trigger Sincronização Completa
-- Execute no SQL Editor do Supabase para que novos cadastros venham com dados completos

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Inserir no Profile com todos os dados do metadata
  INSERT INTO public.profiles (id, full_name, role, city, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'phone'
  );
  
  -- 2. Inserir na tabela específica de cada cargo
  IF new.raw_user_meta_data->>'role' = 'artist' THEN
    INSERT INTO public.artists (profile_id, years_of_experience, primary_styles) 
    VALUES (
      new.id, 
      (new.raw_user_meta_data->>'experience')::integer,
      -- Converte string "Old School, Blackwork" para array ['Old School', 'Blackwork']
      string_to_array(new.raw_user_meta_data->>'styles', ',')::text[]
    );
  ELSIF new.raw_user_meta_data->>'role' = 'studio' THEN
    INSERT INTO public.studios (profile_id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
