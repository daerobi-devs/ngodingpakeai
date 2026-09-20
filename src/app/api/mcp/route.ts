import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// CORS headers for local MCP agent clients (Cursor, Claude Code, Antigravity)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-prd-id, x-token',
};

export interface TaskRecord {
  id: string;
  title: string;
  priority: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  phase: string;
  agentPrompt: string;
  userStory?: string;
  techMapping?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
  };
  notes?: string;
  updatedAt: string;
}

// Global in-memory cache for active project tasks & specs (fallback if Supabase table not created)
interface CachedProject {
  prdId: string;
  token?: string;
  title: string;
  markdownSpec: string;
  tasks: TaskRecord[];
  lastUpdated: number;
}

const projectStore = new Map<string, CachedProject>();

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prdId = searchParams.get('prdId') || 'default';
  const token = searchParams.get('token') || '';

  // 1. Coba ambil dari Supabase database jika tabel studio_tasks sudah ada
  try {
    const adminSupabase = createAdminClient();
    const { data: dbTasks, error } = await adminSupabase
      .from('studio_tasks')
      .select('*')
      .eq('prd_id', prdId)
      .order('created_at', { ascending: true });

    if (!error && dbTasks && dbTasks.length > 0) {
      const formattedTasks: TaskRecord[] = dbTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        priority: t.priority || 'P1',
        status: t.status || 'todo',
        phase: t.phase || 'Fase 1: Inisialisasi',
        agentPrompt: t.agent_prompt || '',
        userStory: t.user_story || '',
        techMapping: t.tech_mapping || {},
        notes: t.notes || '',
        updatedAt: t.updated_at || new Date().toISOString(),
      }));

      const project = projectStore.get(prdId);

      return NextResponse.json(
        {
          success: true,
          prdId,
          title: project?.title || 'Dokumen PRD',
          tasks: formattedTasks,
          totalTasks: formattedTasks.length,
          doneCount: formattedTasks.filter((t) => t.status === 'done').length,
          source: 'supabase_cloud',
          lastUpdated: Date.now(),
        },
        { headers: corsHeaders }
      );
    }
  } catch {
    // Fallback ke in-memory store
  }

  // 2. Fallback in-memory store
  const project = projectStore.get(prdId);
  if (!project) {
    return NextResponse.json(
      {
        success: true,
        message: 'MCP Server Aktif. Belum ada snapshot tugas proyek.',
        prdId,
        tasks: [],
      },
      { headers: corsHeaders }
    );
  }

  // Token isolation check if token is registered
  if (project.token && project.token !== token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Akses Ditolak: Token keamanan tidak cocok dengan proyek ini.',
      },
      { status: 403, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      success: true,
      prdId,
      title: project.title,
      tasks: project.tasks,
      totalTasks: project.tasks.length,
      doneCount: project.tasks.filter((t) => t.status === 'done').length,
      source: 'memory_cache',
      lastUpdated: project.lastUpdated,
    },
    { headers: corsHeaders }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // Dynamic identifier extraction
    const headerPrdId = req.headers.get('x-prd-id');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

    const prdId = body.prdId || headerPrdId || searchParams.get('prdId') || 'default';
    const token = body.token || bearerToken || searchParams.get('token') || '';

    // Handle standard project registration / sync from Studio web client
    if (body.action === 'sync_project' || body.action === 'register') {
      const existing = projectStore.get(prdId);

      // Preserve existing statuses if updating
      const incomingTasks = body.tasks || [];
      const mergedTasks: TaskRecord[] = incomingTasks.map((newTask: any) => {
        const prev = existing?.tasks.find((t) => t.id === newTask.id);
        return {
          id: newTask.id,
          title: newTask.title,
          priority: newTask.priority || 'P1',
          status: prev ? prev.status : newTask.status || 'todo',
          phase: newTask.phase || 'Fase 1: Inisialisasi',
          agentPrompt: newTask.agentPrompt || '',
          userStory: newTask.userStory || '',
          techMapping: newTask.techMapping || {},
          notes: prev?.notes || newTask.notes || '',
          updatedAt: new Date().toISOString(),
        };
      });

      const newRecord: CachedProject = {
        prdId,
        token: token || existing?.token,
        title: body.title || existing?.title || 'Dokumen PRD',
        markdownSpec: body.markdownSpec || existing?.markdownSpec || '',
        tasks: mergedTasks,
        lastUpdated: Date.now(),
      };

      projectStore.set(prdId, newRecord);

      // Sync ke Supabase tabel studio_tasks jika tabel ada
      try {
        const adminSupabase = createAdminClient();
        const dbPayload = mergedTasks.map((t) => ({
          id: t.id,
          prd_id: prdId,
          title: t.title,
          priority: t.priority,
          phase: t.phase,
          status: t.status,
          user_story: t.userStory,
          agent_prompt: t.agentPrompt,
          tech_mapping: t.techMapping,
          notes: t.notes,
          updated_at: new Date().toISOString(),
        }));
        await adminSupabase.from('studio_tasks').upsert(dbPayload, { onConflict: 'id' });
      } catch {
        // Fallback in-memory
      }

      return NextResponse.json(
        {
          success: true,
          message: `Proyek ${prdId} berhasil disinkronkan ke MCP Server.`,
          taskCount: mergedTasks.length,
        },
        { headers: corsHeaders }
      );
    }

    // Check JSON-RPC 2.0 standard protocol (for Cursor, Claude, Antigravity MCP clients)
    if (body.jsonrpc === '2.0') {
      return handleJsonRpc(body, prdId, token);
    }

    // Direct REST API for updating task status
    if (body.action === 'update_task_status') {
      const project = projectStore.get(prdId);
      if (project) {
        const task = project.tasks.find((t) => t.id === body.taskId);
        if (task) {
          task.status = body.status;
          if (body.notes) task.notes = body.notes;
          task.updatedAt = new Date().toISOString();
          project.lastUpdated = Date.now();
        }
      }

      // Update di Supabase database jika tabel ada
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('studio_tasks')
          .update({
            status: body.status,
            notes: body.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.taskId);
      } catch {
        // Fallback
      }

      return NextResponse.json(
        {
          success: true,
          taskId: body.taskId,
          newStatus: body.status,
          message: `Status tugas ${body.taskId} berhasil diubah ke ${body.status}.`,
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Action atau metode JSON-RPC tidak dikenali.' },
      { status: 400, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('MCP Server Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// JSON-RPC 2.0 Handler for official Model Context Protocol
async function handleJsonRpc(body: any, prdId: string, token: string) {
  const { id, method, params } = body;

  if (method === 'initialize') {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'ngodingpakeprd-mcp-server',
            version: '1.0.0',
          },
        },
      },
      { headers: corsHeaders }
    );
  }

  if (method === 'tools/list') {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'get_prd_spec',
              description: 'Mengambil seluruh teks spesifikasi PRD lengkap beserta arsitektur dan skema database.',
              inputSchema: {
                type: 'object',
                properties: {
                  prdId: { type: 'string', description: 'ID dokumen PRD (opsional jika sudah disetel)' },
                },
              },
            },
            {
              name: 'get_tasks',
              description: 'Mengambil daftar tugas Kanban produk beserta status terkini (todo, in_progress, done).',
              inputSchema: {
                type: 'object',
                properties: {
                  prdId: { type: 'string', description: 'ID dokumen PRD' },
                  statusFilter: { type: 'string', enum: ['all', 'todo', 'in_progress', 'done'] },
                },
              },
            },
            {
              name: 'get_next_task',
              description: 'Mengambil tugas prioritas tertinggi berikutnya yang belum selesai beserta prompt koding siap pakai.',
              inputSchema: {
                type: 'object',
                properties: {
                  prdId: { type: 'string', description: 'ID dokumen PRD' },
                },
              },
            },
            {
              name: 'update_task_status',
              description: 'Memperbarui status kartu Kanban secara real-time dari agen AI (todo, in_progress, done).',
              inputSchema: {
                type: 'object',
                properties: {
                  prdId: { type: 'string', description: 'ID dokumen PRD' },
                  taskId: { type: 'string', description: 'ID tugas yang sedang dikerjakan' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
                  notes: { type: 'string', description: 'Catatan progres atau file yang dibuat' },
                },
                required: ['taskId', 'status'],
              },
            },
            {
              name: 'report_progress',
              description: 'Melaporkan kemajuan pengkodean atau kendala yang dihadapi agen AI ke sistem.',
              inputSchema: {
                type: 'object',
                properties: {
                  prdId: { type: 'string', description: 'ID dokumen PRD' },
                  summary: { type: 'string', description: 'Ringkasan pencapaian pengkodean' },
                },
                required: ['summary'],
              },
            },
          ],
        },
      },
      { headers: corsHeaders }
    );
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};
    const targetPrdId = args.prdId || prdId;
    const project = projectStore.get(targetPrdId);

    if (toolName === 'get_prd_spec') {
      if (!project || !project.markdownSpec) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Spesifikasi PRD untuk ID [${targetPrdId}] belum tersedia atau belum disinkronkan. Buka halaman Studio untuk menyinkronkan spesifikasi.`,
                },
              ],
            },
          },
          { headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `# ${project.title}\n\n${project.markdownSpec}`,
              },
            ],
          },
        },
        { headers: corsHeaders }
      );
    }

    if (toolName === 'get_tasks') {
      if (!project) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Belum ada tugas terdaftar untuk PRD [${targetPrdId}].`,
                },
              ],
            },
          },
          { headers: corsHeaders }
        );
      }

      const filter = args.statusFilter || 'all';
      const list = filter === 'all' ? project.tasks : project.tasks.filter((t) => t.status === filter);

      const taskSummary = list
        .map(
          (t, i) =>
            `[TUGAS ${i + 1}] ID: ${t.id}
Judul: ${t.title}
Status: ${t.status.toUpperCase()}
Prioritas: ${t.priority}
Fase: ${t.phase}
User Story: ${t.userStory || '-'}
Komponen Terkait: ${(t.techMapping?.frontend || []).join(', ') || '-'}
API Endpoints: ${(t.techMapping?.backend || []).join(', ') || '-'}
Skema DB: ${(t.techMapping?.database || []).join(', ') || '-'}

Prompt Instruksi Lengkap Agen:
${t.agentPrompt}

Catatan Implementasi: ${t.notes || 'Belum ada catatan'}`
        )
        .join('\n\n========================================\n\n');

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Daftar Tugas Kanban Beserta Prompt Lengkap (${list.length} tugas):\n\n${taskSummary}`,
              },
            ],
          },
        },
        { headers: corsHeaders }
      );
    }

    if (toolName === 'get_next_task') {
      if (!project || project.tasks.length === 0) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: 'Tidak ada tugas yang tersedia dalam antrean.',
                },
              ],
            },
          },
          { headers: corsHeaders }
        );
      }

      // Cari tugas in_progress terlebih dahulu, kemudian todo P0 dan P1
      const activeTask = project.tasks.find((t) => t.status === 'in_progress');
      const nextTodoP0 = project.tasks.find((t) => t.status === 'todo' && t.priority === 'P0');
      const nextTodo = project.tasks.find((t) => t.status === 'todo');
      const target = activeTask || nextTodoP0 || nextTodo;

      if (!target) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: 'Semua tugas dalam Kanban telah selesai dikerjakan.',
                },
              ],
            },
          },
          { headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `TUGAS EKSEKUSI OTONOM BERIKUTNYA:

ID Tugas: ${target.id}
Judul: ${target.title}
Status Saat Ini: ${target.status}
Prioritas: ${target.priority}
Fase: ${target.phase}

User Story & Kebutuhan:
${target.userStory || '-'}

Komponen & Pemetaan Teknis:
- Frontend: ${(target.techMapping?.frontend || []).join(', ') || '-'}
- API / Server Action: ${(target.techMapping?.backend || []).join(', ') || '-'}
- Database Tables: ${(target.techMapping?.database || []).join(', ') || '-'}

Prompt Instruksi Lengkap untuk Agen AI:
${target.agentPrompt}

Instruksi Agen AI:
1. Panggil tool 'update_task_status' dengan status 'in_progress' dan taskId '${target.id}' sebelum memulai pengerjaan kode.
2. Bangun antarmuka frontend menyeluruh terlebih dahulu, lalu backend dan migrasi database yang dibutuhkan.
3. Setelah implementasi tuntas dan diverifikasi, panggil tool 'update_task_status' dengan status 'done' dan sertakan catatan ringkas tentang kode/file yang dibuat.`,
              },
            ],
          },
        },
        { headers: corsHeaders }
      );
    }

    if (toolName === 'update_task_status') {
      if (!project) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Proyek [${targetPrdId}] tidak ditemukan di memori server.` }],
            },
          },
          { headers: corsHeaders }
        );
      }

      const target = project.tasks.find((t) => t.id === args.taskId);
      if (!target) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Tugas ID [${args.taskId}] tidak ditemukan.` }],
            },
          },
          { headers: corsHeaders }
        );
      }

      target.status = args.status;
      if (args.notes) target.notes = args.notes;
      target.updatedAt = new Date().toISOString();
      project.lastUpdated = Date.now();

      // Sinkronkan ke Supabase database jika tabel ada
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('studio_tasks')
          .update({
            status: args.status,
            notes: args.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', args.taskId);
      } catch {
        // Fallback
      }

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Berhasil memperbarui tugas [${target.title}] menjadi [${args.status}]. Papan Kanban di web telah tersinkronisasi secara otomatis.`,
              },
            ],
          },
        },
        { headers: corsHeaders }
      );
    }

    if (toolName === 'report_progress') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Laporan progres berhasil diterima: "${args.summary}".`,
              },
            ],
          },
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool '${toolName}' tidak dikenali.` },
      },
      { headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method '${method}' tidak didukung.` },
    },
    { headers: corsHeaders }
  );
}
