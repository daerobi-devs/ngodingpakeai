import { createBrowserClient } from '@supabase/ssr';

function sanitizeEnvValue(val?: string): string {
  if (!val) return '';
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  if (clean.includes('\n')) clean = clean.split('\n')[0].trim();
  if (clean.includes('\r')) clean = clean.split('\r')[0].trim();
  if (clean.includes(' ')) clean = clean.split(' ')[0].trim();
  return clean;
}

export function createClient() {
  const url = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return createBrowserClient(url, key);
}
