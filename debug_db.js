
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read from .env manually since we are in a simple node script
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);

async function debug() {
    console.log("Searching for Marcelino...");
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .ilike('full_name', '%Marcelino%');

    if (error) console.error(error);
    else console.log("Result:", data);
}

debug();
