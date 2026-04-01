-- Execute esse código no SQL Editor do Supabase para habilitar o Calendário de Vagas

CREATE TABLE public.availability_slots (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slot_date date NOT NULL,
  slot_time text NOT NULL, -- Ex: "10:00", "14:00"
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'pending')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable by everyone." ON public.availability_slots FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own availability." ON public.availability_slots FOR ALL USING (auth.uid() = artist_id);
