import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory cache for 30 seconds to prevent database load on high traffic
let cachedStats: { users: number; prds: number; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        {
          success: true,
          users: cachedStats.users,
          prds: cachedStats.prds,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    const adminSupabase = createAdminClient();

    // Run parallel head-only count queries (zero row data transferred, ultra-fast)
    const [userRes, prdRes] = await Promise.all([
      adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
      adminSupabase.from('prd_history').select('*', { count: 'exact', head: true }),
    ]);

    const usersCount = userRes.count || 0;
    const prdsCount = prdRes.count || 0;

    cachedStats = {
      users: usersCount,
      prds: prdsCount,
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        users: usersCount,
        prds: prdsCount,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: true,
        users: cachedStats?.users || 0,
        prds: cachedStats?.prds || 0,
      },
      { status: 200 }
    );
  }
}
