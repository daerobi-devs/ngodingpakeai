import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function createClient() {
  const cookieStore = await cookies();
  const url = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context
          }
        },
      },
    }
  );
}
