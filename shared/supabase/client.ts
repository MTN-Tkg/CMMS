/**
 * Supabase Client Initialization
 * Creates and exports Supabase client instances for different use cases
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, validateSupabaseConfig } from './config';
import type { Database } from './types';

// Validate configuration on module load
validateSupabaseConfig();

/**
 * Main Supabase client for client-side operations
 * Uses the anonymous key and includes auth context
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Admin Supabase client for server-side operations
 * Uses the service role key and bypasses RLS
 * Should only be used on the server side
 */
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey || supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Get the current user session
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

/**
 * Get the current session
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error);
    return null;
  }
  return session;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

export default supabase;