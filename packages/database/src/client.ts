
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

export const createClient = (): SupabaseClient<Database> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("Supabase credentials missing. Returning stub client.");
        return {} as any; // Better than throwing at top level
    }

    return createBrowserClient<Database>(url, key);
};
