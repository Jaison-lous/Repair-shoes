import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Basic client
// We export a helper to get the client or a mock if envs are missing
export const getSupabase = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase credentials missing. Using Mock Mode (basic console logs only, no real DB).");
        return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabase();
