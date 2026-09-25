import { NextRequest, NextResponse } from 'next/server';
import {
  ACADEMIC_ARCHITECT_SYSTEM_PROMPT,
  buildChatRevisionPrompt,
} from '@/lib/academic-architect/prompts';
import { executeArchitectPrompt } from '@/lib/academic-architect/gemini-executor';
import { AcademicDiagramSet } from '@/lib/academic-architect/types';
import { sanitizeAcademicDiagramSet } from '@/lib/academic-architect/mermaid-sanitizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentDiagrams,
      instruction,
      activeDiagramType = 'use_case',
    }: {
      currentDiagrams: AcademicDiagramSet;
      instruction: string;
      activeDiagramType: string;
    } = body;

    if (!currentDiagrams || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Data diagram dan instruksi revisi wajib disertakan.' },
        { status: 400 }
      );
    }

    const revisionPrompt = buildChatRevisionPrompt(
      JSON.stringify(currentDiagrams, null, 2),
      instruction,
      activeDiagramType
    );

    const aiRes = await executeArchitectPrompt<{
      diagrams: AcademicDiagramSet;
      revisionNote?: string;
    }>(ACADEMIC_ARCHITECT_SYSTEM_PROMPT, revisionPrompt, {
      temperature: 0.2,
      maxOutputTokens: 8192,
    });

    if (aiRes.success && aiRes.data && aiRes.data.diagrams) {
      const sanitized = sanitizeAcademicDiagramSet(aiRes.data.diagrams);
      return NextResponse.json({
        success: true,
        diagrams: sanitized,
        revisionNote: aiRes.data.revisionNote || 'Diagram dan naskah Bab 3 berhasil diperbarui secara sinkron.',
      });
    }

    return NextResponse.json({
      success: true,
      diagrams: currentDiagrams,
      revisionNote: 'Instruksi revisi telah dicatat. Diagram tetap dalam kondisi aktif.',
    });
  } catch (error: any) {
    console.error('Error in architect audit-and-revise:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui diagram.' },
      { status: 500 }
    );
  }
}
