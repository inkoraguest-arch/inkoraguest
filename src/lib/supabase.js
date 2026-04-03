import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Standard client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a specialized Supabase client that uses the Clerk JWT for RLS.
 * @param {string} clerkToken - The JWT token from Clerk (supabase template)
 */
export const createClerkSupabaseClient = (clerkToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};
