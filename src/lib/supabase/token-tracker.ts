import { createAdminClient } from '@/lib/supabase/admin';

export interface InMemoryGenerationLog {
  id: string;
  user_id: string | null;
  title: string;
  model_used: string;
  gemini_slot_used: string;
  tokens_used: number;
  is_server_key: boolean;
  created_at: string;
  userEmail?: string;
  userName?: string;
  userTier?: string;
}

const globalForTokens = globalThis as unknown as {
  inMemoryServerTokens?: number;
  inMemoryGenerations?: InMemoryGenerationLog[];
};

if (typeof globalForTokens.inMemoryServerTokens === 'undefined') {
  globalForTokens.inMemoryServerTokens = 0;
}
if (!globalForTokens.inMemoryGenerations) {
  globalForTokens.inMemoryGenerations = [];
}

export function getInMemoryTokenStats() {
  return {
    totalServerTokens: globalForTokens.inMemoryServerTokens || 0,
    recentGenerations: globalForTokens.inMemoryGenerations || [],
  };
}

export async function recordTokenUsage(params: {
  userId?: string | null;
  title: string;
  tokensUsed: number;
  modelUsed?: string;
  geminiSlotUsed?: string;
  isServerKey?: boolean;
  isArchitect?: boolean;
  metadata?: any;
}) {
  const {
    userId,
    title,
    tokensUsed,
    modelUsed = 'AI Engine',
    geminiSlotUsed = 'Slot Auto',
    isServerKey = true,
    isArchitect = false,
    metadata = {},
  } = params;

  // 1. In-Memory Tracking (Selalu aktif dan tahan terhadap SQL yang belum dijalankan)
  const logId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  if (isServerKey) {
    globalForTokens.inMemoryServerTokens = (globalForTokens.inMemoryServerTokens || 0) + tokensUsed;
  }

  const memoryLog: InMemoryGenerationLog = {
    id: logId,
    user_id: userId || null,
    title,
    model_used: modelUsed,
    gemini_slot_used: geminiSlotUsed,
    tokens_used: tokensUsed,
    is_server_key: isServerKey,
    created_at: nowIso,
  };

  if (!globalForTokens.inMemoryGenerations) {
    globalForTokens.inMemoryGenerations = [];
  }
  globalForTokens.inMemoryGenerations.unshift(memoryLog);
  if (globalForTokens.inMemoryGenerations.length > 50) {
    globalForTokens.inMemoryGenerations = globalForTokens.inMemoryGenerations.slice(0, 50);
  }

  // 2. Database Supabase Sync (Jika tabel prd_history & profiles sudah ada)
  try {
    const adminSupabase = createAdminClient();

    // A. Update profile total_server_tokens (Tetap dicatat untuk kuota admin)
    if (userId && isServerKey) {
      try {
        const { data: prof } = await adminSupabase
          .from('profiles')
          .select('total_server_tokens')
          .eq('id', userId)
          .single();

        const current = (prof as any)?.total_server_tokens || 0;
        await adminSupabase
          .from('profiles')
          .update({
            total_server_tokens: current + tokensUsed,
            updated_at: nowIso,
          })
          .eq('id', userId);
      } catch (profErr) {
        // Table/column might not exist yet
      }
    }

    // B. Insert into prd_history ONLY untuk PRD/Roadmap nyata.
    // Log arsitek TIDAK boleh masuk ke prd_history agar tidak mencemari sidebar PRD generator pengguna.
    const isArchitectLog = isArchitect || title.toLowerCase().startsWith('[arsitek]') || metadata?.type === 'architect';
    if (!isArchitectLog) {
      try {
        await adminSupabase.from('prd_history').insert({
          user_id: userId || null,
          title,
          prd_data: metadata,
          model_used: modelUsed,
          tokens_used: tokensUsed,
          is_server_key: isServerKey,
          gemini_slot_used: geminiSlotUsed,
        });
      } catch (histErr) {
        // Table might not exist yet
      }
    }
  } catch (err) {
    // Graceful silence for DB
  }
}
