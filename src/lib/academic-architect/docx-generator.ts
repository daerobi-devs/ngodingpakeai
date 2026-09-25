import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
} from 'docx';
import { ArchitectProject } from './types';

// Convert cm to twips (1 cm = 567 twips)
const CM_TO_TWIPS = 567;

export async function generateThesisBab3Docx(project: ArchitectProject): Promise<Blob> {
  const { title, description, diagrams, blueprint } = project;

  // Margin standar skripsi Indonesia: Kiri 4cm, Atas 4cm, Kanan 3cm, Bawah 3cm
  const pageMargins = {
    top: 4 * CM_TO_TWIPS,
    left: 4 * CM_TO_TWIPS,
    right: 3 * CM_TO_TWIPS,
    bottom: 3 * CM_TO_TWIPS,
  };

  const tableBorderStyle = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
  };

  const sections: any[] = [];

  // 1. Header Judul Bab
  const docElements: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'BAB III',
          bold: true,
          font: 'Times New Roman',
          size: 28, // 14pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: 'PERANCANGAN SISTEM',
          bold: true,
          font: 'Times New Roman',
          size: 28, // 14pt
        }),
      ],
    }),

    // 3.1 Gambaran Umum Sistem
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: '3.1 Gambaran Umum Sistem',
          bold: true,
          font: 'Times New Roman',
          size: 24, // 12pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 200 }, // 1.5 spasi
      children: [
        new TextRun({
          text: `Sistem ${title || 'Aplikasi'} dirancang untuk mengatasi permasalahan operasional dan manajemen data melalui integrasi arsitektur perangkat lunak modern. ${description || blueprint?.systemDescription || ''}`,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),

    // 3.2 Aktor dan Hak Akses
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: '3.2 Identifikasi Aktor dan Peran Sistem',
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 200 },
      children: [
        new TextRun({
          text: `Berdasarkan analisis kebutuhan fungsional, sistem ini melibatkan ${blueprint?.actors?.length || 2} entitas pengguna (aktor) utama yang memiliki batasan kewenangan masing-masing:`,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
  ];

  // List Aktor
  if (blueprint?.actors) {
    blueprint.actors.forEach((actor, idx) => {
      docElements.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { line: 360, after: 100 },
          children: [
            new TextRun({
              text: `${actor}: Memiliki hak akses terhadap modul operasional yang dialokasikan sesuai peran otoritasnya.`,
              font: 'Times New Roman',
              size: 24,
            }),
          ],
        })
      );
    });
  }

  // 3.3 Perancangan Use Case Diagram & Skenario
  docElements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: '3.3 Perancangan Use Case Diagram dan Skenario',
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 200 },
      children: [
        new TextRun({
          text: 'Use Case Diagram menggambarkan interaksi antara aktor dengan sistem perangkat lunak yang dibangun, mencakup batasan sistem dan relasi fungsional antar proses.',
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: '[Lampiran Gambar 3.1: Diagram Use Case Sistem]',
          bold: true,
          italics: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    })
  );

  // Skenario Use Case Tables
  if (diagrams?.useCaseScenarios && diagrams.useCaseScenarios.length > 0) {
    diagrams.useCaseScenarios.forEach((sc, idx) => {
      docElements.push(
        new Paragraph({
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({
              text: `Tabel 3.${idx + 1} Skenario Use Case ${sc.useCaseName}`,
              bold: true,
              font: 'Times New Roman',
              size: 22, // 11pt
            }),
          ],
        })
      );

      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Nama Use Case', bold: true, font: 'Times New Roman', size: 20 })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: sc.useCaseName, font: 'Times New Roman', size: 20 })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Aktor Utama', bold: true, font: 'Times New Roman', size: 20 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: sc.primaryActor, font: 'Times New Roman', size: 20 })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi Singkat', bold: true, font: 'Times New Roman', size: 20 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: sc.description, font: 'Times New Roman', size: 20 })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Kondisi Awal (Pre-Condition)', bold: true, font: 'Times New Roman', size: 20 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: sc.preCondition, font: 'Times New Roman', size: 20 })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Kondisi Akhir (Post-Condition)', bold: true, font: 'Times New Roman', size: 20 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: sc.postCondition, font: 'Times New Roman', size: 20 })] })],
            }),
          ],
        }),
      ];

      docElements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderStyle,
          rows: tableRows,
        }),
        new Paragraph({ spacing: { after: 200 } })
      );
    });
  }

  // 3.4 Perancangan Basis Data (ERD & Kamus Data)
  docElements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: '3.4 Perancangan Basis Data (ERD dan Kamus Data)',
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 200 },
      children: [
        new TextRun({
          text: 'Struktur basis data dimodelkan melalui Entity Relationship Diagram (ERD) dengan notasi Crow\'s Foot untuk memperlihatkan hubungan antar tabel, kardinalitas relasi, serta integritas kunci primer dan kunci asing.',
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: '[Lampiran Gambar 3.2: Entity Relationship Diagram]',
          bold: true,
          italics: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    })
  );

  // Kamus Data Tables
  if (diagrams?.dataDictionary && diagrams.dataDictionary.length > 0) {
    diagrams.dataDictionary.forEach((tbl, idx) => {
      docElements.push(
        new Paragraph({
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({
              text: `Tabel 3.${(diagrams.useCaseScenarios?.length || 0) + idx + 1} Kamus Data Tabel ${tbl.tableName}`,
              bold: true,
              font: 'Times New Roman',
              size: 22,
            }),
          ],
        })
      );

      const headerRow = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama Kolom', bold: true, font: 'Times New Roman', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tipe Data', bold: true, font: 'Times New Roman', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kunci', bold: true, font: 'Times New Roman', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Keterangan', bold: true, font: 'Times New Roman', size: 18 })] })] }),
        ],
      });

      const fieldRows = tbl.fields.map((f) => {
        let keyLabel = '-';
        if (f.isPrimaryKey) keyLabel = 'PK';
        else if (f.isForeignKey) keyLabel = `FK -> ${f.references || ''}`;

        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.columnName, font: 'Times New Roman', size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.dataType, font: 'Times New Roman', size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: keyLabel, font: 'Times New Roman', size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.description || '-', font: 'Times New Roman', size: 18 })] })] }),
          ],
        });
      });

      docElements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderStyle,
          rows: [headerRow, ...fieldRows],
        }),
        new Paragraph({ spacing: { after: 200 } })
      );
    });
  }

  // Wrap in Docx Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: pageMargins,
          },
        },
        children: docElements,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
