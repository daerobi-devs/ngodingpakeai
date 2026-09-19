import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function sanitizeEnvValue(val?: string): string {
  if (!val) return '';
  let clean = val.trim();
  // Strip quotes if wrapped
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  // If multiple lines or pasted key-value pairs appended accidentally, take first token
  if (clean.includes('\n')) {
    clean = clean.split('\n')[0].trim();
  }
  if (clean.includes('\r')) {
    clean = clean.split('\r')[0].trim();
  }
  if (clean.includes(' ')) {
    clean = clean.split(' ')[0].trim();
  }
  return clean;
}

export function createAdminClient() {
  const supabaseUrl = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL atau Service Role Key belum dikonfigurasi di environment variables');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
