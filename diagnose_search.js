import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsmzgsrsfpqdippbwkxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbXpnc3JzZnBxZGlwcGJ3a3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjAyNzEsImV4cCI6MjA4ODIzNjI3MX0.xidY5iZKVwcJcVgGn753ZozS-DznK1NWx12GR-yC93Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSearch() {
  console.log('--- Diagnóstico de Busca ---');
  
  // 1. Check all profiles with artist/studio role
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, role, latitude, longitude')
    .in('role', ['artist', 'studio', 'admin']); // Admin should also appear if they are artists

  if (pError) console.error('Erro ao buscar perfis:', pError);
  console.log(`Perfis encontrados (Admin/Artist/Studio): ${profiles ? profiles.length : 0}`);
  profiles?.forEach(p => console.log(`- ${p.full_name} (${p.role}): Lat=${p.latitude}, Lng=${p.longitude}`));

  // 2. Check artists table
  const { data: artists, error: aError } = await supabase.from('artists').select('profile_id');
  console.log(`Registros em 'artists': ${artists ? artists.length : 0}`);

  // 3. Check studios table
  const { data: studios, error: sError } = await supabase.from('studios').select('profile_id');
  console.log(`Registros em 'studios': ${studios ? studios.length : 0}`);
}

diagnoseSearch();
