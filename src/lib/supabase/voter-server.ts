import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function getVoterSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Missing server Supabase configuration.');
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

