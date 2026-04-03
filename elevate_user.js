import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsmzgsrsfpqdippbwkxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbXpnc3JzZnBxZGlwcGJ3a3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjAyNzEsImV4cCI6MjA4ODIzNjI3MX0.xidY5iZKVwcJcVgGn753ZozS-DznK1NWx12GR-yC93Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function elevateUser() {
  const email = 'o9.yuri@gmail.com';
  console.log(`Elevando o usuário: ${email}...`);

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role: 'admin', 
      subscription_status: 'active',
      subscription_plan: 'pro'
    })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Erro ao atualizar no Supabase:', error);
  } else if (data && data.length > 0) {
    console.log('✅ SUCESSO! Usuário agora é ADMIN e ATIVO no Supabase.');
    console.log('Dados atualizados:', data[0]);
  } else {
    console.log('❌ FALHA: Usuário não encontrado com esse e-mail no Supabase.');
    console.log('Verifique se você já fez o login/cadastro inicial com este e-mail no site.');
  }
}

elevateUser();
