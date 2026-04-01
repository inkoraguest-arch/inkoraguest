-- Run esse código no Sql Editor do Supabase para adicionar as novas colunas
-- necessárias para os tatuadores editarem seus valores, agenda e vagas.

ALTER TABLE public.artists 
ADD COLUMN price_range text DEFAULT 'R$ 300 - R$ 800',
ADD COLUMN schedule_text text DEFAULT 'Atendimento na base de São Paulo. Próxima viagem: indeterminada.',
ADD COLUMN spots_status text DEFAULT 'Aceitando Orçamentos';
