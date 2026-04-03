import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsmzgsrsfpqdippbwkxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbXpnc3JzZnBxZGlwcGJ3a3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjAyNzEsImV4cCI6MjA4ODIzNjI3MX0.xidY5iZKVwcJcVgGn753ZozS-DznK1NWx12GR-yC93Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Erro ao acessar profiles:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Colunas encontradas:', Object.keys(data[0]));
  } else {
    console.log('❌ Tabela vazia ou erro ao ler colunas.');
  }
}

checkSchema();
