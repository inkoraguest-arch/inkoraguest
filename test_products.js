import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://gsmzgsrsfpqdippbwkxy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbXpnc3JzZnBxZGlwcGJ3a3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjAyNzEsImV4cCI6MjA4ODIzNjI3MX0.xidY5iZKVwcJcVgGn753ZozS-DznK1NWx12GR-yC93Y');

supabase.from('products').select('*').limit(1)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(err => console.error(err));
