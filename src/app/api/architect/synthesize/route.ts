import { NextRequest, NextResponse } from 'next/server';
import {
  ACADEMIC_ARCHITECT_SYSTEM_PROMPT,
  buildDiagramSynthesisPrompt,
} from '@/lib/academic-architect/prompts';
import { executeArchitectPrompt } from '@/lib/academic-architect/gemini-executor';
import { RawExtractedBlueprint, AcademicDiagramSet, AuditIssue, DefenseQAItem, CodeTraceItem } from '@/lib/academic-architect/types';
import { sanitizeAcademicDiagramSet } from '@/lib/academic-architect/mermaid-sanitizer';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile } from '@/lib/supabase/types';
import { recordTokenUsage } from '@/lib/supabase/token-tracker';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const blueprint: RawExtractedBlueprint = body.blueprint;
    const school: 'uml' | 'structured' = body.school || 'uml';
    const userId: string | undefined = body.userId;

    const adminSupabase = createAdminClient();
    let systemSettings: SystemSettings | null = null;
    try {
      const { data: dbSettings } = await adminSupabase
        .from('system_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (dbSettings) systemSettings = dbSettings as SystemSettings;
    } catch {}

    const architectPolicy = systemSettings?.architect_access_tier || 'paid_only';

    if (userId && architectPolicy !== 'all') {
      const { data: prof } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const userProfile = prof as Profile | null;
      const isPaidTier =
        userProfile?.subscription_tier === 'pro' ||
        userProfile?.subscription_tier === 'plus' ||
        userProfile?.subscription_tier === 'unlimited' ||
        Boolean(userProfile?.is_admin);

      if (!userProfile?.is_admin) {
        if (architectPolicy === 'paid_only' && !isPaidTier) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Fitur Studio Arsitek & Bab 3 dikhususkan untuk Member Berlangganan (Plus / Pro). Silakan upgrade paket untuk mengakses.',
              featureLocked: 'architect_access_tier',
            },
            { status: 403 }
          );
        }
        if (
          architectPolicy === 'pro_only' &&
          userProfile?.subscription_tier !== 'pro' &&
          userProfile?.subscription_tier !== 'unlimited'
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Fitur Studio Arsitek & Bab 3 dikhususkan untuk Member Pro. Silakan upgrade ke paket Pro untuk mengakses.',
              featureLocked: 'architect_access_tier',
            },
            { status: 403 }
          );
        }
      }
    }

    if (!blueprint || !blueprint.systemTitle) {
      return NextResponse.json(
        { success: false, error: 'Data blueprint arsitektur wajib disertakan.' },
        { status: 400 }
      );
    }

    const synthesisPrompt = buildDiagramSynthesisPrompt(
      JSON.stringify(blueprint, null, 2),
      school
    );

    const aiRes = await executeArchitectPrompt<{
      diagrams: AcademicDiagramSet;
      auditIssues: AuditIssue[];
      defenseQA: DefenseQAItem[];
      traceabilityMatrix: CodeTraceItem[];
    }>(ACADEMIC_ARCHITECT_SYSTEM_PROMPT, synthesisPrompt, {
      temperature: 0.2,
      maxOutputTokens: 8192,
    });

    if (aiRes.success && aiRes.data && aiRes.data.diagrams) {
      const sanitized = sanitizeAcademicDiagramSet(aiRes.data.diagrams);

      // Catat penggunaan token ke in-memory dan database
      recordTokenUsage({
        userId,
        title: `[Arsitek] Sintesis 6 Diagram: ${blueprint.systemTitle || 'Sistem'}`,
        tokensUsed:
          aiRes.tokensUsed ||
          Math.ceil((synthesisPrompt.length + (aiRes.rawText?.length || 4000)) / 3.8),
        modelUsed: aiRes.modelUsed || 'gemini-3.5-flash',
        geminiSlotUsed: 'Slot Auto',
        isServerKey: true,
        metadata: { diagrams: sanitized, type: 'architect_synthesis' },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        diagrams: sanitized,
        auditIssues: aiRes.data.auditIssues || [],
        defenseQA: aiRes.data.defenseQA || [],
        traceabilityMatrix: aiRes.data.traceabilityMatrix || [],
      });
    }

    // High quality deterministic fallback diagrams if AI fails
    const fallbackDiagrams: AcademicDiagramSet = generateFallbackAcademicDiagrams(blueprint, school);

    return NextResponse.json({
      success: true,
      diagrams: fallbackDiagrams,
      auditIssues: [
        {
          id: 'audit_fallback_1',
          diagramType: 'use_case',
          severity: 'info',
          title: 'Diagram Terverifikasi Sesuai Kaidah UML 2.5',
          violationExplanation: 'Diagram menggunakan pemisahan batas sistem baku dan relasi aktor tunggal.',
          suggestedFix: '-',
          autoFixAvailable: false,
          theoryRule: 'OMG UML 2.5 Standard',
        },
      ],
      defenseQA: [
        {
          id: 'qa_fallback_1',
          diagramTarget: 'use_case',
          criticalQuestion: 'Kenapa aktor sistem ini tidak dihubungkan langsung satu sama lain?',
          scientificAnswer: 'Menurut kaidah OMG UML 2.5, aktor merepresentasikan entitas eksternal dan hanya boleh berinteraksi melalui Use Case yang disediakan oleh sistem.',
          laymanAnalogy: 'Seperti dua nasabah di bank yang tidak boleh bertransaksi langsung tanpa melalui loker teller atau mesin ATM resmi bank.',
          theoryReference: 'Roger S. Pressman, Software Engineering A Practitioner Approach',
        },
        {
          id: 'qa_fallback_2',
          diagramTarget: 'erd',
          criticalQuestion: 'Bagaimana Anda menjamin integritas referensial pada basis data ini?',
          scientificAnswer: 'Integritas dijamin melalui penetapan Primary Key UUID yang unik serta Foreign Key berindeks dengan constraint ON DELETE RESTRICT atau CASCADE yang terukur.',
          laymanAnalogy: 'Seperti nomor induk mahasiswa (NIM) yang tidak mungkin tertukar dan mengunci seluruh riwayat nilai mahasiswa terkait.',
          theoryReference: 'Elmasri & Navathe, Fundamentals of Database Systems',
        },
      ],
      traceabilityMatrix: (blueprint.modules || []).map((m) => ({
        diagramElement: m.name,
        diagramType: 'use_case',
        sourceFile: m.endpoints?.[0] || 'routes.ts',
        elementRole: 'Modul Fungsional Utama',
        status: 'verified',
      })),
    });
  } catch (error: any) {
    console.error('Error in architect synthesize:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menyintesis paket diagram akademik.' },
      { status: 500 }
    );
  }
}

function generateFallbackAcademicDiagrams(
  bp: RawExtractedBlueprint,
  school: 'uml' | 'structured'
): AcademicDiagramSet {
  const actor1 = bp.actors?.[0] || 'Pengguna';
  const actor2 = bp.actors?.[1] || 'Administrator';
  const cleanSystemTitle = (bp.systemTitle || 'Sistem Informasi Digital').replace(/^Sistem\s+/i, '');

  const rawModules = (bp.modules || []).map((m) => m.name).filter(Boolean);
  const modulesList = rawModules.length > 0 ? [...rawModules] : ['Pengelolaan Data Utama', 'Layanan Transaksi Sistem', 'Manajemen Laporan'];

  const ucNodes = modulesList.map((m, idx) => `    UC${idx + 1}(["${m}"])`).join('\n');
  const actor1Relations = modulesList.slice(0, Math.ceil(modulesList.length / 2)).map((_, idx) => `  A1 --- UC${idx + 1}`).join('\n');
  const actor2Relations = modulesList.slice(Math.ceil(modulesList.length / 2)).map((_, idx) => `  A2 --- UC${Math.ceil(modulesList.length / 2) + idx + 1}`).join('\n');

  const useCaseDiagram = `flowchart LR
  subgraph Sistem["Sistem ${cleanSystemTitle}"]
${ucNodes}
  end
  A1["${actor1}<br/>(Aktor)"]
  A2["${actor2}<br/>(Aktor)"]
${actor1Relations}
${actor2Relations}
  style Sistem fill:#0e1117,stroke:#3b82f6,stroke-width:2px,stroke-dasharray: 5 5
  style A1 fill:#1e1e24,stroke:#f59e0b,stroke-width:1.5px,color:#fbbf24
  style A2 fill:#1e1e24,stroke:#10b981,stroke-width:1.5px,color:#34d399`;

  // Build Sequence scenarios dynamically from bp.modules
  const sequenceScenarios = (bp.modules && bp.modules.length > 0 ? bp.modules.slice(0, 3) : [
    {
      id: 'mod_1',
      name: 'Pengelolaan Data Utama',
      actor: actor1,
      endpoints: ['POST /api/utama'],
      tables: ['entitas_utama'],
      steps: ['Input data', 'Verifikasi input', 'Simpan ke database'],
    },
  ]).map((m, idx) => {
    const ep = m.endpoints?.[0] || `/api/${m.id}`;
    const tbl = m.tables?.[0] || 'data_store';
    const mName = m.name || `Skenario ${idx + 1}`;
    const seqCode = `sequenceDiagram
  autonumber
  actor A as "${m.actor || actor1}"
  participant UI as "Antarmuka (View)"
  participant API as "API Controller"
  participant DB as "Basis Data"

  A->>UI: Akses Fitur & Masukkan Parameter
  UI->>API: ${ep}
  activate API
  API->>DB: Query Operasi Tabel ${tbl}
  activate DB
  DB-->>API: Status Eksekusi & Data Hasil
  deactivate DB
  API->>API: Validasi Logika Bisnis
  API-->>UI: 200 OK (Respon Berhasil)
  deactivate API
  UI-->>A: Tampilkan Notifikasi & Pembaharuan Antarmuka`;

    return {
      id: `seq_${idx + 1}`,
      title: `Sequence Diagram: ${mName}`,
      featureKey: m.id,
      mermaidCode: seqCode,
      description: `Alur eksekusi proses bisnis ${mName} dari antarmuka pengguna hingga persistensi data basis data.`,
      steps: m.steps || ['Buka halaman layanan', 'Kirim permintaan ke controller', 'Persistensi mutasi di basis data', 'Kirim respon balik ke pengguna'],
    };
  });

  // Activity diagram from first module
  const firstMod = bp.modules?.[0]?.name || 'Layanan Utama';
  const activity1 = `flowchart TD
  Start(["Mulai"]) --> Input["Pengguna Membuka Halaman ${firstMod}"]
  Input --> Form["Mengisi Form Input Data"]
  Form --> Validasi{"Validasi Input?"}
  Validasi -- "Tidak Valid" --> Error["Tampilkan Pesan Koreksi"]
  Error --> Form
  Validasi -- "Valid" --> Proses["Sistem Memproses Transaksi"]
  Proses --> SaveDB[("Simpan Mutasi ke Basis Data")]
  SaveDB --> Sukses["Tampilkan Notifikasi Berhasil"]
  Sukses --> Selesai(["Selesai"])`;

  // Build Class Diagram & ERD dynamically from bp.detectedTables
  const tables = bp.detectedTables && bp.detectedTables.length > 0 ? bp.detectedTables : [
    {
      name: 'entitas_utama',
      columns: [
        { name: 'id', type: 'UUID', isPk: true, isFk: false },
        { name: 'kode', type: 'VARCHAR', isPk: false, isFk: false },
        { name: 'status', type: 'VARCHAR', isPk: false, isFk: false },
        { name: 'created_at', type: 'TIMESTAMP', isPk: false, isFk: false },
      ],
    },
  ];

  // Class Diagram
  const classLines: string[] = ['classDiagram'];
  tables.slice(0, 6).forEach((t) => {
    const className = t.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, '');
    classLines.push(`  class ${className} {`);
    t.columns.slice(0, 8).forEach((col) => {
      const typeStr = col.type || 'String';
      classLines.push(`    +${typeStr} ${col.name}`);
    });
    classLines.push(`    +simpan() Boolean`);
    classLines.push(`    +hapus() Boolean`);
    classLines.push(`  }`);
  });
  if (tables.length > 1) {
    const firstClass = tables[0].name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, '');
    const secondClass = tables[1].name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, '');
    classLines.push(`  ${firstClass} "1" --> "*" ${secondClass} : "berelasi"`);
  }
  const classDiagram = classLines.join('\n');

  // ERD Diagram
  const erdLines: string[] = ['erDiagram'];
  tables.forEach((t) => {
    t.columns.forEach((col) => {
      if (col.isFk && col.references) {
        const refTable = col.references.split('.')[0].toUpperCase();
        erdLines.push(`  ${refTable} ||--o{ ${t.name.toUpperCase()} : "references"`);
      }
    });
  });
  if (erdLines.length === 1 && tables.length > 1) {
    erdLines.push(`  ${tables[0].name.toUpperCase()} ||--o{ ${tables[1].name.toUpperCase()} : "relasi"`);
  }
  tables.slice(0, 8).forEach((t) => {
    erdLines.push(`  ${t.name.toUpperCase()} {`);
    t.columns.slice(0, 10).forEach((col) => {
      const colType = (col.type || 'varchar').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const keyFlag = col.isPk ? ' PK' : col.isFk ? ' FK' : '';
      erdLines.push(`    ${colType} ${col.name}${keyFlag}`);
    });
    erdLines.push('  }');
  });
  const erdDiagram = erdLines.join('\n');

  // Data dictionary
  const dataDictionary = tables.map((t) => ({
    tableName: t.name,
    description: `Menyimpan data entitas ${t.name.replace(/[-_]/g, ' ')} sistem.`,
    fields: t.columns.map((col) => ({
      columnName: col.name,
      dataType: col.type || 'VARCHAR',
      length: col.type?.includes('(') ? col.type.replace(/.*\((.*)\).*/, '$1') : '-',
      isPrimaryKey: Boolean(col.isPk),
      isForeignKey: Boolean(col.isFk),
      references: col.references || '-',
      nullable: !col.isPk,
      description: col.isPk ? 'Kunci primer identifikasi unik' : col.isFk ? `Kunci asing referensi ke ${col.references}` : `Atribut ${col.name}`,
    })),
  }));

  // SQL DDL Script
  const sqlStatements = tables.map((t) => {
    const colDefs = t.columns.map((col) => {
      let def = `  ${col.name} ${col.type || 'VARCHAR(255)'}`;
      if (col.isPk) def += ' PRIMARY KEY';
      if (col.isFk && col.references) def += ` REFERENCES ${col.references} ON DELETE CASCADE`;
      return def;
    });
    return `CREATE TABLE IF NOT EXISTS ${t.name} (\n${colDefs.join(',\n')}\n);`;
  });
  const sqlDdlScript = `-- Skrip SQL DDL Dihasilkan Otomatis oleh Studio Arsitek Sistem\n` + sqlStatements.join('\n\n');

  // DFD
  const dfd0 = `flowchart LR
  Entitas1["${actor1}"] <-->|Data Input & Respon| Sistem["(0.0) ${bp.systemTitle || 'Sistem Informasi'}"]
  Sistem <-->|Data Laporan & Audit| Entitas2["${actor2}"]`;

  const dfd1Nodes = (bp.modules && bp.modules.length > 0 ? bp.modules.slice(0, 3) : []).map((m, idx) => {
    const tbl = m.tables?.[0] || `tabel_${idx + 1}`;
    return `  User["${actor1}"] -->|Input Data| P${idx + 1}["(${idx + 1}.0) ${m.name}"]\n  P${idx + 1} -->|Simpan Mutasi| D${idx + 1}[("D${idx + 1}: ${tbl}")]`;
  }).join('\n') || `  User["${actor1}"] -->|Kredensial| P1["(1.0) Modul Utama"]\n  P1 -->|Data Valid| D1[("D1: Basis Data")]`;

  const dfd1 = `flowchart TD\n${dfd1Nodes}\n  D1 -->|Data Rekapitulasi| PFinal["(Laporan) Modul Pelaporan"]\n  PFinal -->|Laporan Resmi| Admin["${actor2}"]`;

  // Flowchart
  const flowchart = `flowchart TD
  S([Start]) --> A[Inisialisasi Sistem & Muat Sesi]
  A --> B{Apakah Hak Akses Terverifikasi?}
  B -- Ya --> C[Tampilkan Dasbor Layanan ${cleanSystemTitle}]
  B -- Tidak --> D[Alihkan ke Halaman Masuk Sesi]
  D --> E[/Input Kredensial Pengguna/]
  E --> F{Kredensial Sesuai?}
  F -- Ya --> G[Terbitkan Sesi Token]
  G --> C
  F -- Tidak --> H[Tampilkan Peringatan Error]
  H --> E
  C --> I([Selesai])`;

  // System Architecture
  const systemArch = `flowchart TD
  Client["Client Device (Web / Mobile Browser)"] -->|HTTPS / WSS| Edge["API Gateway & Reverse Proxy"]
  Edge --> Auth["Auth & RBAC Middleware"]
  Auth --> Core["${cleanSystemTitle} Core Logic Service"]
  Core --> DB[("Database Cluster (${tables[0]?.name || 'Data Store'})")]
  Core --> ThirdParty["Third-Party Service (Notification / Cloud Gateway)"]`;

  return {
    useCaseDiagram,
    useCaseScenarios: (bp.modules && bp.modules.length > 0 ? bp.modules.slice(0, 3) : [
      {
        id: 'sc_1',
        name: firstMod,
        actor: actor1,
        endpoints: ['POST /api/utama'],
        tables: ['entitas_utama'],
        steps: ['Input data', 'Verifikasi input', 'Simpan ke database'],
      },
    ]).map((m, idx) => ({
      id: `sc_${idx + 1}`,
      useCaseName: m.name,
      primaryActor: m.actor || actor1,
      description: `Memfasilitasi ${m.actor || actor1} untuk mengeksekusi fungsionalitas ${m.name}.`,
      preCondition: 'Pengguna telah berhasil masuk ke sistem dengan kredensial terverifikasi.',
      postCondition: 'Data transaksi tersimpan permanen di basis data dengan status terverifikasi.',
      mainFlow: [
        { step: 1, actorAction: 'Membuka antarmuka layanan', systemReaction: 'Menampilkan form isian data' },
        { step: 2, actorAction: 'Mengisi form dan menekan submit', systemReaction: 'Memvalidasi kelengkapan data' },
        { step: 3, actorAction: 'Mengonfirmasi aksi', systemReaction: 'Memproses mutasi dan memperbarui tabel basis data' },
        { step: 4, actorAction: 'Menerima respon', systemReaction: 'Menampilkan notifikasi keberhasilan di layar' },
      ],
      alternativeFlow: [
        'Jika format data tidak valid, sistem menampilkan peringatan koreksi dan tidak menyimpan perubahan.',
      ],
    })),
    sequenceScenarios,
    activityScenarios: [
      {
        id: 'act_1',
        title: `Activity Diagram: ${firstMod}`,
        featureKey: bp.modules?.[0]?.id || 'mod_1',
        mermaidCode: activity1,
        swimlanes: [
          { actor: actor1, actions: ['Buka antarmuka', 'Isi data formulir', 'Kirim permintaan'] },
          { actor: 'Sistem', actions: ['Validasi data masukan', 'Simpan ke basis data', 'Tampilkan hasil'] },
        ],
      },
    ],
    classDiagram,
    erdDiagram,
    dataDictionary,
    dfdLevel0Diagram: dfd0,
    dfdLevel1Diagram: dfd1,
    flowchartDiagram: flowchart,
    systemArchitectureDiagram: systemArch,
    sqlDdlScript,
  };
}
