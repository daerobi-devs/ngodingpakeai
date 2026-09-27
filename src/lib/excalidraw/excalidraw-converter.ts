/**
 * Excalidraw Converter & Bridge Utility
 * Mengonversi diagram Mermaid ke format Excalidraw Scene (.excalidraw)
 * Mendukung Single Diagram maupun Master Blueprint (6 Diagram Sekaligus)
 */

import { AcademicDiagramSet } from '@/lib/academic-architect/types';

export const EXCALIDRAW_INSTANCE_URL = 'https://excalidraw.daeroom.my.id';

export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'text' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid' | 'hachure' | 'cross-hatch';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  groupIds: string[];
  roundness: { type: number } | null;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  boundElements: Array<{ id: string; type: string }> | null;
  updated: number;
  link: string | null;
  locked: boolean;
  [key: string]: any;
}

export interface ExcalidrawScene {
  type: 'excalidraw';
  version: 2;
  source: string;
  elements: ExcalidrawElement[];
  appState: {
    gridSize: number | null;
    viewBackgroundColor: string;
  };
  files: Record<string, any>;
}

function generateId(prefix: string = 'el'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

function getRandomSeed(): number {
  return Math.floor(Math.random() * 900000) + 100000;
}

export function createExcalidrawRect(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string = '',
  bgColor: string = '#edf2ff',
  strokeColor: string = '#364fc7',
  textColor: string = '#1864ab',
  fontSize: number = 14
): ExcalidrawElement[] {
  const rectId = generateId('rect');
  const elements: ExcalidrawElement[] = [];

  const rect: ExcalidrawElement = {
    id: rectId,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor,
    backgroundColor: bgColor,
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    roundness: { type: 3 },
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
  };
  elements.push(rect);

  if (text.trim().length > 0) {
    const textId = generateId('text');
    rect.boundElements = [{ id: textId, type: 'text' }];

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.35;
    const textH = lines.length * lineHeight;
    const textY = y + Math.max(8, (height - textH) / 2);

    const textEl: ExcalidrawElement = {
      id: textId,
      type: 'text',
      x: x + 8,
      y: textY,
      width: Math.max(20, width - 16),
      height: textH,
      angle: 0,
      strokeColor: textColor,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      groupIds: [],
      roundness: null,
      seed: getRandomSeed(),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      text,
      fontSize,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      baseline: fontSize,
      containerId: rectId,
      originalText: text,
    };
    elements.push(textEl);
  }

  return elements;
}

export function createExcalidrawDiamond(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string = '',
  bgColor: string = '#fff3bf',
  strokeColor: string = '#f59f00',
  textColor: string = '#d9480f',
  fontSize: number = 13
): ExcalidrawElement[] {
  const diamId = generateId('diam');
  const elements: ExcalidrawElement[] = [];

  const diam: ExcalidrawElement = {
    id: diamId,
    type: 'diamond',
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor,
    backgroundColor: bgColor,
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    roundness: null,
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
  };
  elements.push(diam);

  if (text.trim().length > 0) {
    const textId = generateId('text');
    diam.boundElements = [{ id: textId, type: 'text' }];

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.35;
    const textH = lines.length * lineHeight;
    const textY = y + Math.max(6, (height - textH) / 2);

    const textEl: ExcalidrawElement = {
      id: textId,
      type: 'text',
      x: x + 10,
      y: textY,
      width: Math.max(20, width - 20),
      height: textH,
      angle: 0,
      strokeColor: textColor,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      groupIds: [],
      roundness: null,
      seed: getRandomSeed(),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      text,
      fontSize,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      baseline: fontSize,
      containerId: diamId,
      originalText: text,
    };
    elements.push(textEl);
  }

  return elements;
}

export function createExcalidrawArrow(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  label: string = '',
  color: string = '#495057'
): ExcalidrawElement[] {
  const arrowId = generateId('arrow');
  const elements: ExcalidrawElement[] = [];

  const dx = endX - startX;
  const dy = endY - startY;

  const arrow: ExcalidrawElement = {
    id: arrowId,
    type: 'arrow',
    x: startX,
    y: startY,
    width: Math.abs(dx),
    height: Math.abs(dy),
    angle: 0,
    strokeColor: color,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    roundness: { type: 2 },
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    points: [
      [0, 0],
      [dx, dy],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
  };
  elements.push(arrow);

  if (label.trim().length > 0) {
    const textId = generateId('text');
    arrow.boundElements = [{ id: textId, type: 'text' }];

    const midX = startX + dx / 2;
    const midY = startY + dy / 2 - 14;

    const textEl: ExcalidrawElement = {
      id: textId,
      type: 'text',
      x: midX - 40,
      y: midY,
      width: 80,
      height: 20,
      angle: 0,
      strokeColor: color,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      groupIds: [],
      roundness: null,
      seed: getRandomSeed(),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      text: label,
      fontSize: 12,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      baseline: 12,
      containerId: arrowId,
      originalText: label,
    };
    elements.push(textEl);
  }

  return elements;
}

/**
 * Parsing logika Mermaid nodes dan edges dalam area spasial tertentu
 */
export function parseMermaidToSpatialElements(
  mermaidCode: string,
  originX: number,
  originY: number,
  maxWidth: number = 900,
  maxHeight: number = 650,
  themeColor: { bg: string; stroke: string; text: string } = { bg: '#edf2ff', stroke: '#364fc7', text: '#1864ab' }
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = [];
  const lines = mermaidCode.split('\n');
  const nodeMap = new Map<string, { label: string; type: string; x: number; y: number; w: number; h: number }>();
  const edges: Array<{ from: string; to: string; label: string }> = [];

  const nodeDefRegex = /([a-zA-Z0-9_-]+)\s*(\[|\{|\()([^\n\]\}\)]+)(\]|\}|\))/;
  const edgeRegex = /([a-zA-Z0-9_-]+)\s*(?:-->|---|->>|--\s*(?:\|([^|]+)\||"([^"]+)")\s*-->)\s*([a-zA-Z0-9_-]+)/;
  const labeledEdgeRegex = /([a-zA-Z0-9_-]+)\s*-->\|([^|]+)\|\s*([a-zA-Z0-9_-]+)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('flowchart') || trimmed.startsWith('graph') || trimmed.startsWith('sequenceDiagram') || trimmed.startsWith('classDiagram') || trimmed.startsWith('erDiagram')) {
      continue;
    }

    const mLabel = trimmed.match(labeledEdgeRegex);
    if (mLabel) {
      const fromId = mLabel[1];
      const lbl = mLabel[2].trim();
      const toId = mLabel[3];
      edges.push({ from: fromId, to: toId, label: lbl });
      if (!nodeMap.has(fromId)) nodeMap.set(fromId, { label: fromId, type: 'rect', x: 0, y: 0, w: 170, h: 60 });
      if (!nodeMap.has(toId)) nodeMap.set(toId, { label: toId, type: 'rect', x: 0, y: 0, w: 170, h: 60 });
      continue;
    }

    const mEdge = trimmed.match(edgeRegex);
    if (mEdge) {
      const fromId = mEdge[1];
      const lbl = (mEdge[2] || mEdge[3] || '').trim();
      const toId = mEdge[4];
      edges.push({ from: fromId, to: toId, label: lbl });
      if (!nodeMap.has(fromId)) nodeMap.set(fromId, { label: fromId, type: 'rect', x: 0, y: 0, w: 170, h: 60 });
      if (!nodeMap.has(toId)) nodeMap.set(toId, { label: toId, type: 'rect', x: 0, y: 0, w: 170, h: 60 });
      continue;
    }

    const mNode = trimmed.match(nodeDefRegex);
    if (mNode) {
      const id = mNode[1];
      const shapeOpen = mNode[2];
      const rawLabel = mNode[3].replace(/^["']|["']$/g, '').trim();
      const shapeType = shapeOpen === '{' ? 'diamond' : 'rect';
      nodeMap.set(id, {
        label: rawLabel || id,
        type: shapeType,
        x: 0,
        y: 0,
        w: shapeType === 'diamond' ? 130 : 180,
        h: shapeType === 'diamond' ? 100 : 65,
      });
    }
  }

  if (nodeMap.size === 0) {
    // Fallback jika diagram sangat kompleks atau teks bebas
    const fallbackBox = createExcalidrawRect(
      originX + 20,
      originY + 40,
      maxWidth - 40,
      Math.min(maxHeight - 60, 220),
      `Spesifikasi Diagram:\n\n${mermaidCode.slice(0, 180)}...\n\n(Dapat diedit bebas di kanvas)`,
      '#ffffff',
      themeColor.stroke,
      themeColor.text,
      13
    );
    elements.push(...fallbackBox);
    return elements;
  }

  // Grid layout dalam zona
  const nodes = Array.from(nodeMap.entries());
  const cols = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(nodes.length))));
  const gapX = Math.max(210, Math.floor((maxWidth - 60) / cols));
  const gapY = 135;

  const nodeCoords = new Map<string, { cx: number; cy: number }>();

  nodes.forEach(([id, node], idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x = originX + 30 + col * gapX;
    const y = originY + 50 + row * gapY;

    node.x = x;
    node.y = y;
    nodeCoords.set(id, { cx: x + node.w / 2, cy: y + node.h / 2 });

    if (node.type === 'diamond') {
      const dElements = createExcalidrawDiamond(
        x,
        y,
        node.w,
        node.h,
        node.label,
        '#fff9db',
        '#f59f00',
        '#d9480f',
        12
      );
      elements.push(...dElements);
    } else {
      const rElements = createExcalidrawRect(
        x,
        y,
        node.w,
        node.h,
        node.label,
        themeColor.bg,
        themeColor.stroke,
        themeColor.text,
        13
      );
      elements.push(...rElements);
    }
  });

  // Hubungkan garis panah
  edges.forEach((edge) => {
    const fromPos = nodeCoords.get(edge.from);
    const toPos = nodeCoords.get(edge.to);

    if (fromPos && toPos) {
      const arrowElements = createExcalidrawArrow(
        fromPos.cx,
        fromPos.cy + 30,
        toPos.cx,
        toPos.cy - 30,
        edge.label,
        '#64748b'
      );
      elements.push(...arrowElements);
    }
  });

  return elements;
}

/**
 * Parser Single Diagram Mermaid ke Excalidraw Scene
 */
export function convertMermaidToExcalidraw(
  mermaidCode: string,
  diagramTitle: string = 'Arsitektur Sistem'
): ExcalidrawScene {
  const elements: ExcalidrawElement[] = [];

  // Header Title
  const titleText = diagramTitle.toUpperCase();
  const titleId = generateId('header');
  elements.push({
    id: titleId,
    type: 'text',
    x: 60,
    y: 40,
    width: Math.max(300, titleText.length * 16),
    height: 40,
    angle: 0,
    strokeColor: '#1e293b',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    roundness: null,
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    text: titleText,
    fontSize: 22,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
    baseline: 22,
    containerId: null,
    originalText: titleText,
  });

  // Subtitle
  const subId = generateId('sub');
  elements.push({
    id: subId,
    type: 'text',
    x: 60,
    y: 75,
    width: 450,
    height: 20,
    angle: 0,
    strokeColor: '#64748b',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    roundness: null,
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    text: 'Dihasilkan oleh NgodingPakePRD AI - Bebas diedit, digeser & dianotasi',
    fontSize: 12,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
    baseline: 12,
    containerId: null,
    originalText: 'Dihasilkan oleh NgodingPakePRD AI - Bebas diedit, digeser & dianotasi',
  });

  const parsed = parseMermaidToSpatialElements(mermaidCode, 60, 110, 960, 700);
  elements.push(...parsed);

  return {
    type: 'excalidraw',
    version: 2,
    source: EXCALIDRAW_INSTANCE_URL,
    elements,
    appState: {
      gridSize: null,
      viewBackgroundColor: '#ffffff',
    },
    files: {},
  };
}

/**
 * Konverter MASTER BLUEPRINT: Menggabungkan 6 Diagram Arsitektur Sekaligus ke 1 Kanvas Tak Terbatas
 */
export function convertAllDiagramsToMasterExcalidraw(
  projectName: string,
  diagrams: AcademicDiagramSet
): ExcalidrawScene {
  const elements: ExcalidrawElement[] = [];

  // Master Canvas Header Banner
  const masterTitle = `MASTER BLUEPRINT ARSITEKTUR: ${projectName.toUpperCase()}`;
  const headerId = generateId('m_head');
  elements.push({
    id: headerId,
    type: 'text',
    x: 100,
    y: 60,
    width: Math.max(600, masterTitle.length * 20),
    height: 50,
    angle: 0,
    strokeColor: '#0f172a',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    roundness: null,
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: true,
    text: masterTitle,
    fontSize: 30,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
    baseline: 30,
    containerId: null,
    originalText: masterTitle,
  });

  const subHeaderId = generateId('m_sub');
  elements.push({
    id: subHeaderId,
    type: 'text',
    x: 100,
    y: 115,
    width: 900,
    height: 25,
    angle: 0,
    strokeColor: '#475569',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    roundness: null,
    seed: getRandomSeed(),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: true,
    text: 'Cetak Biru 6 Diagram Lengkap (Kaidah UML 2.5, Alur Proses & Basis Data Relasional)',
    fontSize: 16,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
    baseline: 16,
    containerId: null,
    originalText: 'Cetak Biru 6 Diagram Lengkap (Kaidah UML 2.5, Alur Proses & Basis Data Relasional)',
  });

  // Konfigurasi 6 Zona dalam Grid 2 Baris x 3 Kolom
  const zoneConfig = [
    {
      col: 0,
      row: 0,
      code: 'use_case',
      title: '[ZONA 1] USE CASE DIAGRAM',
      subtitle: 'Aktor, Ruang Lingkup Sistem & Kasus Penggunaan',
      chart: diagrams.useCaseDiagram || 'graph TD; A[Aktor]-->B[Fitur Utama];',
      colors: { bg: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' },
    },
    {
      col: 1,
      row: 0,
      code: 'activity',
      title: '[ZONA 2] ACTIVITY DIAGRAM',
      subtitle: 'Alur Bisnis, Percabangan & Transisi Status',
      chart: diagrams.activityScenarios?.[0]?.mermaidCode || 'graph TD; Start((Mulai))-->Action[Aksi]-->End(((Selesai)));',
      colors: { bg: '#ecfdf5', stroke: '#10b981', text: '#047857' },
    },
    {
      col: 2,
      row: 0,
      code: 'sequence',
      title: '[ZONA 3] SEQUENCE DIAGRAM',
      subtitle: 'Pesan Antar-Objek, API Call & Respons',
      chart: diagrams.sequenceScenarios?.[0]?.mermaidCode || 'graph TD; Client-->Server; Server-->Database;',
      colors: { bg: '#faf5ff', stroke: '#a855f7', text: '#7e22ce' },
    },
    {
      col: 0,
      row: 1,
      code: 'class_diagram',
      title: '[ZONA 4] CLASS DIAGRAM',
      subtitle: 'Struktur Entitas, Model Data & Method Service',
      chart: diagrams.classDiagram || 'graph TD; UserClass-->RoleClass;',
      colors: { bg: '#fefce8', stroke: '#eab308', text: '#a16207' },
    },
    {
      col: 1,
      row: 1,
      code: 'deployment',
      title: '[ZONA 5] ARSITEKTUR & DEPLOYMENT',
      subtitle: 'Topologi Server, Container, Reverse Proxy & Storage',
      chart: diagrams.systemArchitectureDiagram || 'graph TD; ClientBrowser-->WebServer; WebServer-->DatabaseCluster;',
      colors: { bg: '#f0fdfa', stroke: '#14b8a6', text: '#0f766e' },
    },
    {
      col: 2,
      row: 1,
      code: 'erd',
      title: '[ZONA 6] DATABASE RELASIONAL (ERD)',
      subtitle: 'Skema Tabel, Primary Key, Foreign Key & Relasi',
      chart: diagrams.erdDiagram || 'graph TD; USERS||--o{ORDERS : places;',
      colors: { bg: '#fff7ed', stroke: '#f97316', text: '#c2410c' },
    },
  ];

  const zoneWidth = 1150;
  const zoneHeight = 850;
  const startX = 100;
  const startY = 180;
  const spacingX = 1220;
  const spacingY = 920;

  zoneConfig.forEach((zone) => {
    const x = startX + zone.col * spacingX;
    const y = startY + zone.row * spacingY;

    // 1. Gambar Bounding Frame Container untuk Zona Ini
    const frameId = generateId(`frame_${zone.code}`);
    elements.push({
      id: frameId,
      type: 'rectangle',
      x,
      y,
      width: zoneWidth,
      height: zoneHeight,
      angle: 0,
      strokeColor: zone.colors.stroke,
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'dashed',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      roundness: { type: 3 },
      seed: getRandomSeed(),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: [],
      updated: 1,
      link: null,
      locked: true,
    });

    // 2. Zone Header Banner
    const bannerElements = createExcalidrawRect(
      x + 15,
      y + 15,
      zoneWidth - 30,
      50,
      `${zone.title}  |  ${zone.subtitle}`,
      zone.colors.bg,
      zone.colors.stroke,
      zone.colors.text,
      14
    );
    elements.push(...bannerElements);

    // 3. Render Nodes Diagram di dalam Zona
    const zoneElements = parseMermaidToSpatialElements(
      zone.chart,
      x + 20,
      y + 75,
      zoneWidth - 40,
      zoneHeight - 90,
      zone.colors
    );
    elements.push(...zoneElements);
  });

  return {
    type: 'excalidraw',
    version: 2,
    source: EXCALIDRAW_INSTANCE_URL,
    elements,
    appState: {
      gridSize: null,
      viewBackgroundColor: '#f8fafc',
    },
    files: {},
  };
}

/**
 * Unduh berkas .excalidraw langsung di browser
 */
export function downloadExcalidrawFile(
  filename: string,
  scene: ExcalidrawScene
): void {
  const jsonString = JSON.stringify(scene, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.excalidraw') ? filename : `${filename}.excalidraw`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Buka instance Excalidraw di tab baru
 */
export function openExcalidrawInstance(): void {
  window.open(EXCALIDRAW_INSTANCE_URL, '_blank', 'noopener,noreferrer');
}
