import { NextRequest, NextResponse } from 'next/server';

// CORS headers for local MCP agent clients (Cursor, Windsurf, Antigravity, Claude Code)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
};

// Global in-memory cache for active architect MCP sessions
interface ArchitectMcpSession {
  sessionId: string;
  projectTitle: string;
  sourceFiles: { path: string; content: string }[];
  diagrams?: any;
  lastUpdated: number;
}

const globalForMcp = globalThis as unknown as {
  architectMcpStore?: Map<string, ArchitectMcpSession>;
};

export const architectMcpStore =
  globalForMcp.architectMcpStore || new Map<string, ArchitectMcpSession>();

if (process.env.NODE_ENV !== 'production') {
  globalForMcp.architectMcpStore = architectMcpStore;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'default';
  const includeFiles = searchParams.get('includeFiles') === 'true';

  let session = architectMcpStore.get(sessionId);

  // If specific sessionId not found, check if there's any active session in store
  if (!session && (sessionId === 'default' || searchParams.get('checkAny') === 'true')) {
    const allSessions = Array.from(architectMcpStore.values());
    if (allSessions.length > 0) {
      allSessions.sort((a, b) => b.lastUpdated - a.lastUpdated);
      session = allSessions[0];
    }
  }

  if (!session) {
    return NextResponse.json(
      {
        status: 'ready',
        message: 'ngodingpakeprd-architect MCP Server aktif.',
        sessionId,
        tools: [
          'push_local_codebase',
          'get_academic_diagrams',
          'get_thesis_defense_qa',
          'request_diagram_revision',
        ],
      },
      { headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      status: 'active',
      sessionId: session.sessionId,
      projectTitle: session.projectTitle,
      sourceFilesCount: session.sourceFiles.length,
      diagramsAvailable: Boolean(session.diagrams),
      lastUpdated: session.lastUpdated,
      sourceFiles: includeFiles ? session.sourceFiles : undefined,
    },
    { headers: corsHeaders }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Standard JSON-RPC 2.0 Handler
    if (body.jsonrpc === '2.0') {
      const id = body.id || 1;
      const method = body.method;
      const params = body.params || {};
      const sessionId = params.sessionId || 'default';

      if (method === 'initialize') {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: {
                name: 'ngodingpakeprd-architect',
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
                  name: 'push_local_codebase',
                  description: 'Kirimkan berkas kodingan lokal (schema.sql, routes, prisma) dari Cursor/IDE ke Studio Arsitek Sistem.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string', description: 'ID sesi ruang kerja arsitek' },
                      projectTitle: { type: 'string', description: 'Judul aplikasi/proyek' },
                      files: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            path: { type: 'string' },
                            content: { type: 'string' },
                          },
                          required: ['path', 'content'],
                        },
                        description: 'Daftar berkas tulang punggung proyek',
                      },
                    },
                    required: ['projectTitle', 'files'],
                  },
                },
                {
                  name: 'get_academic_diagrams',
                  description: 'Ambil seluruh paket diagram akademik (Use Case, Sequence, ERD, Class, DFD) yang telah digenerate.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string' },
                    },
                  },
                },
                {
                  name: 'get_thesis_defense_qa',
                  description: 'Ambil daftar pertanyaan kritis dosen penguji skripsi dan kunci jawaban ilmiahnya.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string' },
                    },
                  },
                },
              ],
            },
          },
          { headers: corsHeaders }
        );
      }

      if (method === 'tools/call') {
        const toolName = params.name;
        const toolArgs = params.arguments || {};

        if (toolName === 'push_local_codebase') {
          const { projectTitle, files } = toolArgs;
          architectMcpStore.set(sessionId, {
            sessionId,
            projectTitle: projectTitle || 'Proyek Kodingan Lokal',
            sourceFiles: files || [],
            lastUpdated: Date.now(),
          });

          return NextResponse.json(
            {
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `Berhasil menyinkronkan ${files?.length || 0} berkas kodingan ke Studio Arsitek Sistem (Sesi: ${sessionId}). Silakan buka dashboard web untuk melihat hasil diagram.`,
                  },
                ],
              },
            },
            { headers: corsHeaders }
          );
        }

        if (toolName === 'get_academic_diagrams') {
          const session = architectMcpStore.get(sessionId);
          return NextResponse.json(
            {
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: session?.diagrams
                      ? JSON.stringify(session.diagrams, null, 2)
                      : 'Diagram sedang diproses di web dashboard.',
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
            error: { code: -32601, message: `Tool '${toolName}' tidak ditemukan.` },
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

    // Direct REST API format
    const { action, sessionId = 'default', projectTitle, files } = body;
    if (action === 'push') {
      architectMcpStore.set(sessionId, {
        sessionId,
        projectTitle: projectTitle || 'Proyek Kodingan Lokal',
        sourceFiles: files || [],
        lastUpdated: Date.now(),
      });
      return NextResponse.json({ success: true, message: 'Sinkronisasi berhasil.' }, { headers: corsHeaders });
    }

    return NextResponse.json({ success: true, status: 'ready' }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (sessionId) {
    architectMcpStore.delete(sessionId);
  } else {
    architectMcpStore.clear();
  }
  return NextResponse.json(
    { success: true, message: 'Sesi MCP berhasil dibersihkan.' },
    { headers: corsHeaders }
  );
}
