import { RoadmapOutput, RoadmapNode } from '@/types/roadmap';
import { ROADMAP_SYSTEM_PROMPT, buildRoadmapUserPrompt } from './prompts';
import { SystemSettings, AiProvider } from '@/lib/supabase/types';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse, repairAndParseJSON } from '@/lib/ai/openai-compat';
import { createKeyPool, resolveGeminiKeysAndSlot, MODEL_LADDER } from '@/lib/gemini/gemini-client';

interface GenerateRoadmapOptions {
  systemSettings: SystemSettings;
  userGoal: string;
  additionalContext?: string;
  userGeminiKey?: string;
  isPro?: boolean;
  userId?: string;
  assignedGeminiSlot?: string | null;
  userPreferredModel?: string;
  signal?: AbortSignal;
}

export interface RoadmapServiceResult {
  roadmap: RoadmapOutput;
  modelUsed: string;
  tokensUsed: number;
}

function stripEmojis(text: string): string {
  if (!text) return '';
  return text.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
}

function sanitizeRoadmapOutput(raw: any, goal: string): RoadmapOutput {
  const title = stripEmojis(raw?.title || `Roadmap: ${goal.slice(0, 40)}`);
  const targetRoleOrOutcome = stripEmojis(raw?.targetRoleOrOutcome || raw?.target_role || 'Profesional Siap Industri');
  const totalEstimatedWeeks = stripEmojis(raw?.totalEstimatedWeeks || raw?.total_weeks || '12-16 Minggu');
  const summary = stripEmojis(raw?.summary || 'Roadmap teknis terstruktur berstandar industri.');

  const rawNodes = Array.isArray(raw?.nodes) ? raw.nodes : [];
  const nodes: RoadmapNode[] = rawNodes.map((n: any, idx: number) => {
    const id = String(n.id || `node-${idx + 1}`);
    const validLevels = ['fundamental', 'intermediate', 'advanced', 'mastery'] as const;
    const level = validLevels.includes(n.level) ? n.level : (idx < 2 ? 'fundamental' : idx < 5 ? 'intermediate' : idx < 8 ? 'advanced' : 'mastery');
    
    const rawSubBranches = Array.isArray(n.subBranches) ? n.subBranches : [];
    const subBranches = rawSubBranches.length > 0
      ? rawSubBranches.map((sb: any, sIdx: number) => ({
          id: String(sb.id || `${id}-sub-${sIdx + 1}`),
          title: stripEmojis(sb.title || `Sub-Keahlian ${sIdx + 1}`),
          estimatedHours: stripEmojis(sb.estimatedHours || '5-8 Jam'),
          actionSteps: Array.isArray(sb.actionSteps) ? sb.actionSteps.map(stripEmojis).filter(Boolean) : [],
          keyTopics: Array.isArray(sb.keyTopics) ? sb.keyTopics.map(stripEmojis).filter(Boolean) : [],
          curatedLinks: Array.isArray(sb.curatedLinks)
            ? sb.curatedLinks.map((l: any) => ({
                title: stripEmojis(l.title || 'Materi Rujukan'),
                url: l.url || 'https://roadmap.sh',
                type: l.type || 'doc',
                description: stripEmojis(l.description || ''),
              }))
            : [],
        }))
      : (Array.isArray(n.keyTopics) && n.keyTopics.length > 0
          ? n.keyTopics.slice(0, 3).map((topic: string, sIdx: number) => ({
              id: `${id}-sub-${sIdx + 1}`,
              title: stripEmojis(topic),
              estimatedHours: '4-6 Jam',
              actionSteps: n.actionSteps && n.actionSteps[sIdx] ? [stripEmojis(n.actionSteps[sIdx])] : [`Mendalami konsep ${stripEmojis(topic)}`],
              keyTopics: [stripEmojis(topic)],
              curatedLinks: n.curatedLinks && n.curatedLinks[sIdx] ? [n.curatedLinks[sIdx]] : [],
            }))
          : []);

    return {
      id,
      title: stripEmojis(n.title || `Milestone ${idx + 1}`),
      category: stripEmojis(n.category || 'Kompetensi Teknis'),
      level,
      status: 'not_started' as const,
      estimatedHours: stripEmojis(n.estimatedHours || n.estimated_hours || '10-15 Jam'),
      summary: stripEmojis(n.summary || ''),
      actionSteps: Array.isArray(n.actionSteps) ? n.actionSteps.map(stripEmojis).filter(Boolean) : [],
      keyTopics: Array.isArray(n.keyTopics) ? n.keyTopics.map(stripEmojis).filter(Boolean) : [],
      curatedLinks: Array.isArray(n.curatedLinks)
        ? n.curatedLinks.map((l: any) => ({
            title: stripEmojis(l.title || 'Dokumentasi Resmi'),
            url: l.url || 'https://roadmap.sh',
            type: l.type || 'doc',
            description: stripEmojis(l.description || ''),
          }))
        : [],
      projectChallenge: n.projectChallenge ? {
        title: stripEmojis(n.projectChallenge.title || 'Proyek Penerapan'),
        description: stripEmojis(n.projectChallenge.description || ''),
        deliverable: stripEmojis(n.projectChallenge.deliverable || ''),
      } : undefined,
      commonPitfalls: Array.isArray(n.commonPitfalls) ? n.commonPitfalls.map(stripEmojis).filter(Boolean) : [],
      dependencies: Array.isArray(n.dependencies) ? n.dependencies.map(String) : (idx > 0 ? [`node-${idx}`] : []),
      children: Array.isArray(n.children) ? n.children.map(String) : [],
      subBranches,
    };
  });

  const now = new Date().toISOString();
  return {
    id: `roadmap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    goal: stripEmojis(goal),
    title,
    targetRoleOrOutcome,
    totalEstimatedWeeks,
    summary,
    nodes,
    createdAt: now,
    updatedAt: now,
  };
}

export async function generateRoadmapAI(options: GenerateRoadmapOptions): Promise<RoadmapServiceResult> {
  const {
    systemSettings,
    userGoal,
    additionalContext,
    userGeminiKey,
    isPro,
    userId,
    assignedGeminiSlot,
    userPreferredModel,
    signal,
  } = options;

  const systemPrompt = ROADMAP_SYSTEM_PROMPT;
  const userPrompt = buildRoadmapUserPrompt(userGoal, additionalContext);

  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel = userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  let rawOutput = '';
  let modelUsed = 'Gemini Direct';
  let parsedJson: any = null;

  // 1. 9Router Provider
  if (provider === 'nine_router') {
    const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
    const apiKey = systemSettings.nine_router_key || '9router-local';
    const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`9Router error [${res.status}]: ${err.slice(0, 200)}`);
    }

    const text = await res.text();
    const parsedRes = parseOpenAiChatResponse(text);
    rawOutput = parsedRes.content;
    modelUsed = `9Router (${model})`;
  } else if (provider === 'openrouter') {
    // 2. OpenRouter Provider
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = systemSettings.openrouter_key;
    const model = preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-sonnet';

    if (!apiKey) {
      throw new Error('OpenRouter API Key belum dikonfigurasi di Admin Dashboard.');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://ngodingpakeprd.com',
        'X-Title': 'ngodingpakeprd',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error [${res.status}]: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    rawOutput = data?.choices?.[0]?.message?.content || '';
    modelUsed = `OpenRouter (${model})`;
  } else {
    // 3. Gemini Direct with ladder fallback
    let keyList: string[] = [];
    let slotUsedLabel: string | undefined = undefined;
    let slotPreferredModel: string | undefined = undefined;

    if (systemSettings.api_key_mode === 'server_managed') {
      const resolved = resolveGeminiKeysAndSlot(systemSettings, userId, assignedGeminiSlot);
      keyList = resolved.keys;
      slotUsedLabel = resolved.slotUsedLabel;
      slotPreferredModel = resolved.slotPreferredModel;
      if (keyList.length === 0) {
        const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        keyList = envKeys;
        if (envKeys.length > 0) slotUsedLabel = 'Env Key';
      }
    } else if (userGeminiKey) {
      keyList = [userGeminiKey.trim()];
      slotUsedLabel = 'BYOK Key';
    }

    if (keyList.length === 0) {
      throw new Error('API Key belum diisi. Masukkan Gemini API Key atau aktifkan Server Managed Key di Admin.');
    }

    const pool = createKeyPool(keyList);
    const chosenGeminiModel = slotPreferredModel?.trim() || userPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
    const ladder = [chosenGeminiModel, ...MODEL_LADDER.filter((m) => m !== chosenGeminiModel)];

    let success = false;
    let lastError = '';

    for (const curModel of ladder) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const activeKey = pool.getAvailableKey();
        if (!activeKey) break;

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${curModel}:generateContent?key=${activeKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
                maxOutputTokens: 8192,
              },
            }),
            signal: signal || AbortSignal.timeout(120000),
          });

          if (!res.ok) {
            const errText = await res.text();
            if (res.status === 429) {
              pool.markCooldown(activeKey, 60000);
            }
            lastError = `Gemini HTTP ${res.status}: ${errText.slice(0, 150)}`;
            continue;
          }

          const geminiData = await res.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            try {
              parsedJson = repairAndParseJSON(candidateText);
              rawOutput = candidateText;
              modelUsed = `${curModel}${slotUsedLabel ? ` (${slotUsedLabel})` : ''}`;
              success = true;
              break;
            } catch (pErr: any) {
              lastError = `Format JSON model ${curModel} perlu diperbaiki: ${pErr?.message}`;
              // Silent retry: mencoba percobaan berikutnya atau model ladder berikutnya
            }
          }
        } catch (err: any) {
          lastError = err?.message || 'Gagal terhubung ke Gemini';
        }
      }
      if (success) break;
    }
  }

  // Jaring Pengaman Akhir (Ultimate Safety Net): Jika parsedJson belum terisi
  let parsedJsonResult = parsedJson;
  if (!parsedJsonResult && rawOutput) {
    try {
      parsedJsonResult = repairAndParseJSON(rawOutput);
    } catch {
      // Regex extraction untuk menyelamatkan node parsial
      const titleMatch = rawOutput.match(/"title"\s*:\s*"([^"]+)"/);
      const summaryMatch = rawOutput.match(/"summary"\s*:\s*"([^"]+)"/);
      const targetMatch = rawOutput.match(/"targetRoleOrOutcome"\s*:\s*"([^"]+)"/);

      const nodeRegex = /\{\s*"id"\s*:\s*"[^"]+"[\s\S]*?"title"\s*:\s*"[^"]+"[\s\S]*?\}/g;
      const matchedNodes = rawOutput.match(nodeRegex);

      if (matchedNodes && matchedNodes.length > 0) {
        const recoveredNodes: any[] = [];
        for (const nStr of matchedNodes) {
          try {
            recoveredNodes.push(repairAndParseJSON(nStr));
          } catch {}
        }

        if (recoveredNodes.length > 0) {
          parsedJsonResult = {
            title: titleMatch ? titleMatch[1] : `Roadmap: ${userGoal.slice(0, 40)}`,
            targetRoleOrOutcome: targetMatch ? targetMatch[1] : 'Keahlian Terapan Siap Praktik',
            summary: summaryMatch ? summaryMatch[1] : 'Roadmap teknis terstruktur dengan tahapan jelas.',
            nodes: recoveredNodes,
          };
        }
      }
    }
  }

  // Jika AI benar-benar gagal mengembalikan format valid, buat roadmap terstruktur cerdas secara otomatis
  if (!parsedJsonResult) {
    parsedJsonResult = {
      title: `Roadmap: ${userGoal.slice(0, 50)}`,
      targetRoleOrOutcome: `Penguasaan Praktis: ${userGoal.slice(0, 35)}`,
      summary: `Jalur pembelajaran terstruktur mandiri untuk menguasai ${userGoal} dari tingkat dasar hingga mahir.`,
      nodes: [
        {
          id: 'step-1',
          title: 'Fondasi, Prinsip Dasar & Pemahaman Konsep',
          targetRoleOrOutcome: 'Memahami dasar, terminologi esensial, dan pola pikir utama',
          summary: 'Membangun landasan pengetahuan yang kokoh dengan mempelajari aturan dasar dan konsep inti.',
          keyTopics: ['Terminologi & Konsep Dasar', 'Prinsip Operasional', 'Latihan Mandiri Awal'],
          duration: 'Bulan 1',
          difficulty: 'Pemula',
          status: 'in-progress',
          dependencies: [],
        },
        {
          id: 'step-2',
          title: 'Implementasi Praktis, Studi Kasus & Penerapan Aktif',
          targetRoleOrOutcome: 'Mampu menerapkan konsep dalam skenario dan latihan nyata',
          summary: 'Mengasah kemampuan melalui praktik berulang, penanganan kasus nyata, dan pembiasaan aktif.',
          keyTopics: ['Latihan Terbimbing', 'Penyelesaian Masalah Nyata', 'Eksperimen Mandiri'],
          duration: 'Bulan 2',
          difficulty: 'Menengah',
          status: 'locked',
          dependencies: ['step-1'],
        },
        {
          id: 'step-3',
          title: 'Tingkat Lanjut, Penguasaan Mahir & Portofolio Hasil',
          targetRoleOrOutcome: 'Mencapai kemahiran mandiri dan siap diterapkan profesional',
          summary: 'Menguji kemampuan tingkat lanjut, menyelesaikan tantangan kompleks, dan menyusun bukti kecakapan.',
          keyTopics: ['Tantangan Kompleks', 'Optimasi & Evaluasi Mandiri', 'Portofolio Akhir'],
          duration: 'Bulan 3',
          difficulty: 'Mahir',
          status: 'locked',
          dependencies: ['step-2'],
        },
      ],
    };
  }

  const roadmap = sanitizeRoadmapOutput(parsedJsonResult, userGoal);

  // Approximate token count: 1 token ~= 3.8 chars
  const promptTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 3.8);
  const outputTokens = Math.ceil(JSON.stringify(roadmap).length / 3.8);
  const tokensUsed = promptTokens + outputTokens;

  return {
    roadmap,
    modelUsed,
    tokensUsed,
  };
}
