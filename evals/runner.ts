import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createKeyPool, GeminiSlotTarget } from '../src/lib/gemini/gemini-client';
import { generatePRDPipeline } from '../src/lib/pipeline/prd-pipeline';

interface TestCase {
  id: string;
  name: string;
  domain: string;
  formData: any;
  techStack: any;
}

interface TestResult {
  id: string;
  name: string;
  domain: string;
  generatedTitle: string;
  passed: boolean;
  domainLeakageCount: number;
  genericFillerCount: number;
  missingTableCount: number;
  criticScore: number;
  retriesPerformed: number;
  durationSec: number;
  violations: string[];
}

async function runEvals() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('         EVALUATION TEST HARNESS (TAHAP 4 - SET UJI PRD)         ');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // Auto load .env.local if not loaded
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envLines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of envLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }

  // Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials tidak ditemukan di environment (.env.local).');
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: settings } = await supabase
    .from('system_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  const slots = settings?.gemini_slots || [];
  const activeSlots: GeminiSlotTarget[] = slots
    .filter((s: any) => s.isActive && s.key)
    .map((s: any) => ({
      id: s.id,
      label: s.label,
      key: s.key,
      preferredModel: s.preferredModel || 'gemini-3.1-flash-lite',
    }));

  if (activeSlots.length === 0) {
    throw new Error('Tidak ada Gemini Slot yang aktif di database.');
  }

  console.log(`Menggunakan ${activeSlots.length} slot Gemini:`);
  activeSlots.forEach((s) => console.log(`- ${s.label}: ${s.preferredModel}`));

  const keyPool = createKeyPool(activeSlots.map((s) => s.key));

  const testCasesPath = path.join(__dirname, 'test-cases.json');
  const testCases: TestCase[] = JSON.parse(fs.readFileSync(testCasesPath, 'utf-8'));

  // Parse command line arguments: --case=1 or --all or default to quick (first 2 cases)
  const args = process.argv.slice(2);
  let casesToRun = testCases;

  const caseArg = args.find((a) => a.startsWith('--case='));
  const isQuick = args.includes('--quick');
  const isAll = args.includes('--all');

  if (caseArg) {
    const caseIndex = parseInt(caseArg.split('=')[1], 10) - 1;
    casesToRun = [testCases[caseIndex] || testCases[0]];
  } else if (isQuick) {
    casesToRun = testCases.slice(0, 2);
  } else if (!isAll) {
    // Default: run first 3 representative cases (Audio/AI, E-commerce, and Vague notes)
    casesToRun = [testCases[0], testCases[1], testCases[9]];
  }

  console.log(`\nMenjalankan ${casesToRun.length} kasus uji dari total ${testCases.length} kasus...\n`);

  const results: TestResult[] = [];

  for (let i = 0; i < casesToRun.length; i++) {
    const tc = casesToRun[i];
    console.log(`[${i + 1}/${casesToRun.length}] Menguji: ${tc.name} (${tc.domain})...`);

    const startTime = Date.now();
    try {
      const prd = await generatePRDPipeline({
        formData: tc.formData,
        techStack: tc.techStack,
        language: 'id',
        apiKeyPool: keyPool,
        preferredModel: activeSlots[0].preferredModel,
        slotTargets: activeSlots,
        enableCritic: true,
        onProgress: (stage, name, detail) => {
          console.log(`   - [Stage ${stage}] ${name}: ${detail}`);
        },
      });

      const durationSec = Number(((Date.now() - startTime) / 1000).toFixed(1));
      const valReport = prd.metadata?.validation_report;

      const domainLeakageCount = (valReport?.violations || []).filter(
        (v: any) => v.type === 'domain_leakage'
      ).length;
      const genericFillerCount = (valReport?.violations || []).filter(
        (v: any) => v.type === 'generic_filler'
      ).length;
      const missingTableCount = (valReport?.violations || []).filter(
        (v: any) => v.type === 'missing_db_table'
      ).length;

      const criticScore = valReport?.criticScores?.average_score || 0;
      const passed = valReport?.passed ?? true;
      const violationList = (valReport?.violations || []).map(
        (v: any) => `[${v.severity}] ${v.message}`
      );

      results.push({
        id: tc.id,
        name: tc.name,
        domain: tc.domain,
        generatedTitle: prd.title,
        passed,
        domainLeakageCount,
        genericFillerCount,
        missingTableCount,
        criticScore,
        retriesPerformed: valReport?.retriesPerformed || 0,
        durationSec,
        violations: violationList,
      });

      console.log(`   ✓ Selesai dalam ${durationSec}s | Critic: ${criticScore}/5.0 | Lolos: ${passed ? 'YA' : 'TIDAK'}\n`);
    } catch (err: unknown) {
      console.error(`   ✗ Gagal pada ${tc.name}:`, err);
      results.push({
        id: tc.id,
        name: tc.name,
        domain: tc.domain,
        generatedTitle: 'ERROR',
        passed: false,
        domainLeakageCount: -1,
        genericFillerCount: -1,
        missingTableCount: -1,
        criticScore: 0,
        retriesPerformed: 0,
        durationSec: Number(((Date.now() - startTime) / 1000).toFixed(1)),
        violations: [err instanceof Error ? err.message : String(err)],
      });
    }
  }

  // Tampilkan Tabel Scorecard Markdown
  console.log('═══════════════════════════════════════════════════════════════════════════════════════');
  console.log('                              EVALUATION SCORECARD TABEL                               ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════\n');

  console.log('| Kasus Uji | Domain | Judul PRD | Status | Bocor Istilah | AI Slop | Missing DB | Skor Critic | Durasi |');
  console.log('| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |');

  for (const r of results) {
    const statusText = r.passed ? 'PASS' : 'REVISE';
    console.log(
      `| ${r.name} | ${r.domain} | ${r.generatedTitle} | ${statusText} | ${r.domainLeakageCount} | ${r.genericFillerCount} | ${r.missingTableCount} | ${r.criticScore}/5.0 | ${r.durationSec}s |`
    );
  }

  // Detail Pelanggaran jika ada
  const hasViolations = results.some((r) => r.violations.length > 0);
  if (hasViolations) {
    console.log('\n--- RINCIAN CATATAN VALIDATOR ---');
    results.forEach((r) => {
      if (r.violations.length > 0) {
        console.log(`\n[${r.name}]`);
        r.violations.forEach((v) => console.log(`  - ${v}`));
      }
    });
  } else {
    console.log('\nSEMUA PENGUJIAN LOLOS DENGAN ZERO CRITICAL VIOLATIONS!');
  }

  // Simpan Laporan ke File
  const reportPath = path.join(__dirname, 'last-run-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nLaporan evaluasi tersimpan di: ${reportPath}`);
}

runEvals().catch((err) => {
  console.error('RUNNER ERROR:', err);
  process.exit(1);
});
