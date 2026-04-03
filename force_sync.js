import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsmzgsrsfpqdippbwkxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbXpnc3JzZnBxZGlwcGJ3a3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjAyNzEsImV4cCI6MjA4ODIzNjI3MX0.xidY5iZKVwcJcVgGn753ZozS-DznK1NWx12GR-yC93Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceCreateUser() {
  const userId = 'user_3BpXF9D7cUXzAKpS23FcYcxH05j';
  const email = 'o9.yuri@gmail.com';
  
  console.log(`Forçando criação do perfil para o ID: ${userId}...`);

  // 1. Create Profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert([
      {
        id: userId,
        full_name: 'Yuri Admin',
        role: 'admin',
        subscription_plan: 'pro',
        subscription_status: 'active'
      }
    ], { onConflict: 'id' })
    .select();

  if (profileError) {
    console.error('Erro ao criar perfil no Supabase:', profileError);
    return;
  }

  console.log('✅ Perfil criado/atualizado com sucesso!');

  // 2. Create Artist entry
  const { error: artistError } = await supabase
    .from('artists')
    .upsert([{ 
      profile_id: userId, 
      bio: 'Administrador e Artista Master do Inkora.',
      portfolio_urls: [] 
    }], { onConflict: 'profile_id' });

  if (artistError) {
    console.error('Erro ao criar entrada de artista:', artistError);
  } else {
    console.log('✅ Entrada de artista vinculada com sucesso!');
  }
}

forceCreateUser();
