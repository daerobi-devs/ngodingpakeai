import { NextRequest, NextResponse } from 'next/server';
import {
  parseSqlDDL,
  parsePrismaSchema,
  parseLaravelMigrations,
  parseTypeScriptEntities,
  extractRoutesFromCode,
  isBackupOrStaleFile,
  sortMigrationFiles,
  ParsedTable,
  ParsedRoute,
} from '@/lib/academic-architect/parser';
import {
  ACADEMIC_ARCHITECT_SYSTEM_PROMPT,
  buildBlueprintExtractionPrompt,
} from '@/lib/academic-architect/prompts';
import { executeArchitectPrompt } from '@/lib/academic-architect/gemini-executor';
import { RawExtractedBlueprint } from '@/lib/academic-architect/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordTokenUsage } from '@/lib/supabase/token-tracker';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      rawIdea,
      files,
      githubUrl,
      prdId,
      userId,
    }: {
      rawIdea?: string;
      files?: { path: string; content: string }[];
      githubUrl?: string;
      prdId?: string;
      userId?: string;
    } = body;

    let detectedTables: ParsedTable[] = [];
    let detectedRoutes: ParsedRoute[] = [];
    let fileSummaries: string[] = [];
    let filesCount = 0;

    // 1. Jika pengguna mengunggah berkas lokal (Drag & Drop)
    if (files && Array.isArray(files) && files.length > 0) {
      filesCount = files.length;
      // Filter out stale/backup files
      const validFiles = files.filter((f) => !isBackupOrStaleFile(f.path));
      const sortedSqlFiles = sortMigrationFiles(
        validFiles.filter((f) => f.path.endsWith('.sql'))
      );
      const prismaFiles = validFiles.filter((f) => f.path.endsWith('.prisma'));
      const routeFiles = validFiles.filter(
        (f) =>
          f.path.includes('/api/') ||
          f.path.includes('/routes/') ||
          f.path.includes('Controller')
      );

      // Parse SQL
      for (const sqlFile of sortedSqlFiles) {
        const parsed = parseSqlDDL(sqlFile.content);
        if (parsed.length > 0) {
          detectedTables.push(...parsed);
          fileSummaries.push(`SQL Schema [${sqlFile.path}]: ${parsed.map((t) => t.name).join(', ')}`);
        }
      }

      // Parse Prisma
      for (const prFile of prismaFiles) {
        const parsed = parsePrismaSchema(prFile.content);
        if (parsed.length > 0) {
          detectedTables.push(...parsed);
          fileSummaries.push(`Prisma Models [${prFile.path}]: ${parsed.map((t) => t.name).join(', ')}`);
        }
      }

      // Parse Laravel Migrations
      const laravelMigrationFiles = validFiles.filter((f) => /migration.*\.php$/i.test(f.path));
      for (const mFile of laravelMigrationFiles) {
        const parsed = parseLaravelMigrations(mFile.content);
        if (parsed.length > 0) {
          detectedTables.push(...parsed);
          fileSummaries.push(`Laravel Migration [${mFile.path}]: ${parsed.map((t) => t.name).join(', ')}`);
        }
      }

      // Parse TypeScript Entities & Models
      const tsEntityFiles = validFiles.filter(
        (f) =>
          /\.(entity|model|schema)\.(ts|js)$/i.test(f.path) ||
          /(?:entities|models)\/.*\.(ts|js)$/i.test(f.path)
      );
      for (const eFile of tsEntityFiles) {
        const parsed = parseTypeScriptEntities(eFile.content);
        if (parsed.length > 0) {
          detectedTables.push(...parsed);
          fileSummaries.push(`TypeScript Entities [${eFile.path}]: ${parsed.map((t) => t.name).join(', ')}`);
        }
      }

      // Parse Routes
      for (const rFile of routeFiles) {
        const parsed = extractRoutesFromCode(rFile.path, rFile.content);
        if (parsed.length > 0) {
          detectedRoutes.push(...parsed);
          fileSummaries.push(`Routes [${rFile.path}]: ${parsed.map((r) => `${r.method} ${r.path}`).join(', ')}`);
        }
      }

      // If no SQL tables were found, feed model definitions directly so AI extracts tables accurately
      const modelFiles = validFiles.filter((f) =>
        /models?\/|entities\/|schemas?\/|models\.py|entities\.ts|\.entity\.(ts|js)|\.model\.(ts|js)/i.test(f.path)
      );
      for (const mFile of modelFiles.slice(0, 15)) {
        fileSummaries.push(`Data Model Definition [${mFile.path}]:\n${mFile.content.slice(0, 800)}`);
      }
      // Parse Project Manifests (package.json, composer.json, etc.)
      const manifestFiles = validFiles.filter((f) =>
        /(?:package\.json|composer\.json|requirements\.txt|go\.mod)$/i.test(f.path)
      );
      for (const mFile of manifestFiles) {
        try {
          if (mFile.path.endsWith('package.json') || mFile.path.endsWith('composer.json')) {
            const parsedJson = JSON.parse(mFile.content);
            const name = parsedJson.name || parsedJson.title || '';
            const desc = parsedJson.description || '';
            fileSummaries.push(`Project Manifest [${mFile.path}]: Nama: "${name}", Deskripsi: "${desc}"`);
          } else {
            fileSummaries.push(`Manifest [${mFile.path}]:\n${mFile.content.slice(0, 300)}`);
          }
        } catch {}
      }

      // Add full directory structure so AI sees every file in the project
      const allPaths = validFiles.map((f) => f.path);
      fileSummaries.push(`Struktur Berkas Proyek (${allPaths.length} berkas):\n${allPaths.slice(0, 100).join('\n')}`);
    }

    // 2. Jika pengguna mengimpor dari PRD yang ada
    if (prdId && detectedTables.length === 0) {
      try {
        const adminSupabase = createAdminClient();
        const { data: prdRow } = await adminSupabase
          .from('prd_history')
          .select('*')
          .eq('id', prdId)
          .single();

        if (prdRow && prdRow.prd_data) {
          const prdData = prdRow.prd_data as any;
          fileSummaries.push(`PRD Source: ${prdData.title || 'Untitled PRD'}`);
          if (prdData.sql_migration_script) {
            const parsed = parseSqlDDL(prdData.sql_migration_script);
            detectedTables.push(...parsed);
          }
          if (prdData.feature_breakdown) {
            prdData.feature_breakdown.forEach((f: any) => {
              detectedRoutes.push({
                path: `/api/${(f.module_name || 'fitur').toLowerCase().replace(/\s+/g, '-')}`,
                method: 'POST',
                sourceFile: 'prd_feature_breakdown',
                inferredRole: 'Pengguna',
              });
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load prdId in architect extract:', err);
      }
    }

    // 3. Jika pengguna menyertakan GitHub Repo URL
    if (githubUrl && detectedTables.length === 0) {
      fileSummaries.push(`GitHub Repository: ${githubUrl}`);
      // Parse owner and repo
      const repoMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (repoMatch) {
        const owner = repoMatch[1];
        const repo = repoMatch[2].replace(/\.git$/, '');
        try {
          const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
            headers: { 'User-Agent': 'ngodingpakeprd-academic-architect' },
          });
          if (treeRes.ok) {
            const treeData = await treeRes.json();
            const treeFiles = (treeData.tree || []).filter((item: any) => item.type === 'blob');
            filesCount = treeFiles.length;
            const keyFiles = treeFiles.filter((item: any) =>
              /schema\.sql|schema\.prisma|migrations\/.*\.sql|routes\/|app\/api\//.test(item.path) &&
              !isBackupOrStaleFile(item.path)
            );
            fileSummaries.push(`Detected ${keyFiles.length} key architecture files from GitHub.`);
          }
        } catch {
          // fallback
        }
      }
    }

    // Deduplicate detected tables
    const uniqueTablesMap = new Map<string, ParsedTable>();
    for (const t of detectedTables) {
      uniqueTablesMap.set(t.name.toLowerCase(), t);
    }
    const finalTables = Array.from(uniqueTablesMap.values());

    // 4. Panggil AI untuk menyintesis Blueprint Arsitektur
    const extractionPrompt = buildBlueprintExtractionPrompt({
      rawIdea,
      sourceFilesSummary: fileSummaries.join('\n'),
      detectedTablesJson: JSON.stringify(finalTables, null, 2),
      detectedRoutesJson: JSON.stringify(detectedRoutes.slice(0, 30), null, 2),
    });

    const aiRes = await executeArchitectPrompt<RawExtractedBlueprint>(
      ACADEMIC_ARCHITECT_SYSTEM_PROMPT,
      extractionPrompt,
      { temperature: 0.2 }
    );

    if (aiRes.success && aiRes.data) {
      const blueprint = aiRes.data;
      blueprint.sourceFilesCount = filesCount;

      // Catat penggunaan token ke in-memory dan database
      recordTokenUsage({
        userId,
        title: `[Arsitek] Ekstraksi: ${blueprint.systemTitle || 'Arsitektur Sistem'}`,
        tokensUsed:
          aiRes.tokensUsed ||
          Math.ceil((extractionPrompt.length + (aiRes.rawText?.length || 2000)) / 3.8),
        modelUsed: aiRes.modelUsed || 'gemini-3.5-flash',
        geminiSlotUsed: 'Slot Auto',
        isServerKey: true,
        metadata: { blueprint, type: 'architect_extract' },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        blueprint,
        detectedTables: finalTables,
        detectedRoutes,
      });
    }

    // Dynamic fallback blueprint if AI fails
    let inferredTitle = rawIdea?.slice(0, 60) || '';
    if (!inferredTitle && files && Array.isArray(files)) {
      const pkg = files.find((f) => f.path.endsWith('package.json') || f.path.endsWith('composer.json'));
      if (pkg) {
        try {
          const parsed = JSON.parse(pkg.content);
          if (parsed.name) {
            inferredTitle = `Sistem ${parsed.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}`;
          }
        } catch {}
      }
    }
    if (!inferredTitle && finalTables.length > 0) {
      inferredTitle = `Sistem Informasi Pengelolaan ${finalTables.map((t) => t.name).slice(0, 3).map((n) => n.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())).join(' dan ')}`;
    }
    if (!inferredTitle) {
      inferredTitle = 'Sistem Informasi Layanan Digital';
    }

    const dynamicModules = finalTables.length > 0
      ? finalTables.map((t, idx) => {
          const formattedName = t.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          return {
            id: `mod_${t.name.toLowerCase()}`,
            name: `Modul Pengelolaan Data ${formattedName}`,
            actor: idx === 0 ? 'Pengguna' : 'Administrator',
            endpoints: [`GET /api/${t.name.toLowerCase()}`, `POST /api/${t.name.toLowerCase()}`],
            tables: [t.name],
            steps: [
              `Aktor mengakses antarmuka kelola ${formattedName}`,
              `Sistem memvalidasi hak akses dan mengambil data dari tabel ${t.name}`,
              `Aktor menyimpan atau memperbarui catatan data ${formattedName}`,
              `Sistem menyimpan mutasi data ke dalam basis data`,
            ],
          };
        })
      : [
          {
            id: 'mod_1',
            name: 'Modul Layanan Inti Sistem',
            actor: 'Pengguna',
            endpoints: ['POST /api/layanan'],
            tables: ['layanan_data'],
            steps: ['Pengguna memasukkan data transaksi', 'Sistem memproses dan memvalidasi permintaan'],
          },
          {
            id: 'mod_2',
            name: 'Modul Pengelolaan dan Laporan',
            actor: 'Administrator',
            endpoints: ['GET /api/laporan'],
            tables: ['laporan_audit'],
            steps: ['Administrator membuka laporan rekapitulasi', 'Sistem mengagregasi data transaksi'],
          },
        ];

    const fallbackBlueprint: RawExtractedBlueprint = {
      systemTitle: inferredTitle,
      systemDescription: rawIdea || `Perancangan arsitektur berorientasi modularitas untuk mendukung implementasi ${inferredTitle}.`,
      techStackSummary: {
        frontend: 'Next.js, TypeScript, Tailwind CSS',
        backend: 'REST API, Server Handlers, Node.js',
        database: 'Relational Database / PostgreSQL',
        thirdPartyServices: ['Service Integrator'],
      },
      actors: ['Pengguna', 'Administrator'],
      modules: dynamicModules,
      detectedTables: finalTables.length > 0 ? finalTables.map((t) => ({
        name: t.name,
        columns: t.columns.map((c) => ({
          name: c.name,
          type: c.type,
          isPk: c.isPk,
          isFk: c.isFk,
          references: c.references,
        })),
      })) : [
        {
          name: 'entitas_utama',
          columns: [
            { name: 'id', type: 'UUID', isPk: true, isFk: false },
            { name: 'kode_unik', type: 'VARCHAR', isPk: false, isFk: false },
            { name: 'status', type: 'VARCHAR', isPk: false, isFk: false },
          ],
        },
      ],
      sourceFilesCount: filesCount,
    };

    return NextResponse.json({
      success: true,
      blueprint: fallbackBlueprint,
      detectedTables: finalTables,
      detectedRoutes,
    });
  } catch (error: any) {
    console.error('Error in architect extract:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal membedah arsitektur sistem.' },
      { status: 500 }
    );
  }
}
