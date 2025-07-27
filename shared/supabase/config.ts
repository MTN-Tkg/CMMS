/**
 * Supabase Configuration
 * Central configuration for Supabase client initialization
 */

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://kdrawlsreggojpxavlnh.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const;

// Validate required environment variables
export const validateSupabaseConfig = () => {
  const errors: string[] = [];
  
  if (!supabaseConfig.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!supabaseConfig.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Supabase configuration errors:\n${errors.join('\n')}`);
  }
};

// Database table names
export const TABLES = {
  USERS: 'users',
  ASSETS: 'assets',
  WORK_ORDERS: 'work_orders',
  PARTS: 'parts',
  INVENTORY: 'inventory',
  MAINTENANCE_SCHEDULES: 'maintenance_schedules',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
} as const;

// Real-time subscription channels
export const CHANNELS = {
  WORK_ORDERS: 'work_orders_channel',
  INVENTORY: 'inventory_channel',
  NOTIFICATIONS: 'notifications_channel',
} as const;