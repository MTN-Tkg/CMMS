/**
 * Supabase Admin Client (Server-Side)
 *
 * This client is intended for server-side use only (e.g., in Netlify functions, Node.js scripts).
 * It uses the Service Role Key and bypasses all RLS policies.
 *
 * WARNING: NEVER import or use this client in your client-side React code.
 * Exposing the service role key in the browser is a major security vulnerability.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, validateSupabaseConfig } from './config';

// Ensure config is loaded and validated
validateSupabaseConfig();

if (!supabaseConfig.serviceRoleKey) {
  throw new Error('Supabase service role key is not defined. This client is for server-side use only.');
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);