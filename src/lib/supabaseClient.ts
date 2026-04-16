import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

function getRequiredEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY') {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseClient() {
  if (!client) {
    client = createClient(getRequiredEnv('VITE_SUPABASE_URL'), getRequiredEnv('VITE_SUPABASE_ANON_KEY'));
  }

  return client;
}