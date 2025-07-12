import { createClient } from '@supabase/supabase-js';

// These environment variables must be defined in your `.env` file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
