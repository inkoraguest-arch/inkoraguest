import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsmzgsrsfpqdippbwkxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbXpnc3JzZnBxZGlwcGJ3a3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjAyNzEsImV4cCI6MjA4ODIzNjI3MX0.xidY5iZKVwcJcVgGn753ZozS-DznK1NWx12GR-yC93Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUser() {
  console.log(`Buscando usuários...`);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Erro ao buscar no Supabase:', error);
  } else if (data) {
    console.log('✅ Usuários encontrados:', data);
  } else {
    console.log('❌ Nenhum usuário encontrado.');
  }
}

findUser();
