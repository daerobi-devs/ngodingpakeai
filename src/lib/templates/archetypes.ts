export type LanguageOption = 'id' | 'en';

export interface TemplateTechStack {
  frontend: {
    name: string;
    sublabel: string;
    iconType: 'nextjs' | 'react' | 'expo' | 'custom';
  };
  backend: {
    name: string;
    sublabel: string;
    iconType: 'nodejs' | 'fastapi' | 'supabase' | 'custom';
  };
  database: {
    name: string;
    sublabel: string;
    iconType: 'supabase' | 'postgres' | 'custom';
  };
  deployment: {
    name: string;
    sublabel: string;
    iconType: 'docker' | 'eas' | 'custom';
  };
}

export interface TemplateArchetype {
  id: string;
  name: string;
  version: string;
  title: string;
  badge: string;
  description: string;
  repoReference: {
    name: string;
    url: string;
    stars: string;
  };
  tech: TemplateTechStack;
  architectDirectives: string[];
  cursorRulesSummary: string[];
}

export const TEMPLATE_ARCHETYPES: Record<string, TemplateArchetype> = {
  starter: {
    id: 'starter',
    name: 'starter',
    version: 'Versi 0.1.0',
    title: 'Modern Fullstack Web Application',
    badge: 'Paling Populer',
    description: 'Template Fullstack Modern Web Application',
    repoReference: {
      name: 'shadcn/taxonomy & midday-ai/midday',
      url: 'https://github.com/shadcn-ui/taxonomy',
      stars: '18.000+ Stars',
    },
    tech: {
      frontend: {
        name: 'Next.js 16 + Tailwind CSS',
        sublabel: 'React 19, App Router, Shadcn UI',
        iconType: 'nextjs',
      },
      backend: {
        name: 'Next.js Server Actions / Route Handlers',
        sublabel: 'Safe actions, Zod validations, REST endpoints',
        iconType: 'nodejs',
      },
      database: {
        name: 'Supabase (PostgreSQL)',
        sublabel: 'Row-Level Security (RLS), Auth & Storage',
        iconType: 'supabase',
      },
      deployment: {
        name: 'Docker (VPS / Coolify)',
        sublabel: 'Multi-stage Alpine container, zero vendor lock-in',
        iconType: 'docker',
      },
    },
    architectDirectives: [
      'Gunakan konvensi Next.js 16 App Router: jadikan Server Components sebagai default, gunakan "use client" hanya jika memerlukan hook interaktivitas (useState, useEffect).',
      'Mutasi data wajib menggunakan Server Actions yang divalidasi skema Zod (safe-action pattern).',
      'Arsitektur database PostgreSQL di Supabase wajib memisahkan hak akses multi-role menggunakan Row Level Security (RLS) policies.',
      'Deployment menggunakan Docker container multi-stage build yang ringan (<150MB) dan siap di-deploy ke VPS mandiri atau Coolify.',
    ],
    cursorRulesSummary: [
      'Jangan fetch data di Client Component jika bisa di-fetch di Server Component.',
      'Gunakan Zod untuk runtime validation pada semua API input dan form actions.',
      'Pastikan semua status mutasi memiliki feedback loading UI dan error boundary.',
    ],
  },

  'mobile-app': {
    id: 'mobile-app',
    name: 'mobile-app',
    version: 'Versi 1.0.0',
    title: 'Cross-Platform Mobile Smartphone',
    badge: 'Android & iOS',
    description: 'Template Khusus Aplikasi Mobile Smartphone Modern',
    repoReference: {
      name: 'obytes/react-native-template-obytes & expo/router',
      url: 'https://github.com/obytes/react-native-template-obytes',
      stars: 'Standar Industri Mobile',
    },
    tech: {
      frontend: {
        name: 'React Native (Expo Router v3)',
        sublabel: 'NativeWind (Tailwind CSS Mobile), File-based Routing',
        iconType: 'react',
      },
      backend: {
        name: 'Supabase Backend & Edge Functions',
        sublabel: 'Auth, Database, Storage, and Deno Functions',
        iconType: 'supabase',
      },
      database: {
        name: 'Supabase (PostgreSQL) + MMKV Cache',
        sublabel: 'Fast in-memory key-value cache + Cloud DB',
        iconType: 'supabase',
      },
      deployment: {
        name: 'EAS Build (Android APK & iOS IPA)',
        sublabel: 'Expo Application Services, Play Store & App Store ready',
        iconType: 'eas',
      },
    },
    architectDirectives: [
      'Arsitektur mobile murni menggunakan Expo Router v3 dengan navigasi file-based (app/(tabs), app/(auth), app/modal).',
      'Manajemen state: gunakan Zustand untuk client-state ringan dan TanStack Query untuk server-state caching.',
      'Offline-first resilience: sediakan MMKV / SQLite storage untuk menyimpan data esensial saat perangkat kehilangan koneksi internet.',
      'Skema izin perangkat: Kamera, Lokasi GPS, dan Push Notification wajib memiliki graceful fallback dan permission-request UI yang ramah pengguna.',
      'Build dan deployment ditargetkan menggunakan EAS Build (Expo Application Services) untuk rilis ke Google Play Store dan Apple App Store.',
    ],
    cursorRulesSummary: [
      'Gunakan NativeWind untuk styling, hindari StyleSheet manual inline.',
      'Semua pemanggilan API eksternal harus dibungkus dengan TanStack Query hooks.',
      'Gunakan safe-area-context untuk memastikan tampilan UI tidak tertabrak notch/island HP.',
    ],
  },

  'ai-service': {
    id: 'ai-service',
    name: 'ai-service',
    version: 'Versi 1.0.0',
    title: 'Production AI Agent & Vector Service',
    badge: 'Python & AI',
    description: 'Template Khusus LLM Orchestration, RAG, & Vector Search',
    repoReference: {
      name: 'tiangolo/full-stack-fastapi-template',
      url: 'https://github.com/tiangolo/full-stack-fastapi-template',
      stars: '50.000+ Stars (tiangolo)',
    },
    tech: {
      frontend: {
        name: 'Next.js 16 (Modern Dashboard)',
        sublabel: 'Chat UI, Stream responses, Analytics metrics',
        iconType: 'nextjs',
      },
      backend: {
        name: 'FastAPI (Python 3.12)',
        sublabel: 'Async API, Pydantic v2 schemas, Background tasks',
        iconType: 'fastapi',
      },
      database: {
        name: 'PostgreSQL + pgvector (Vector DB)',
        sublabel: 'Cosine similarity HNSW index, Hybrid search',
        iconType: 'postgres',
      },
      deployment: {
        name: 'Docker Multi-Container Compose',
        sublabel: 'FastAPI + Next.js + PostgreSQL + Redis worker',
        iconType: 'docker',
      },
    },
    architectDirectives: [
      'Backend memisahkan core business logic menjadi modul: /app/api (routers), /app/core (config/security), /app/models (SQLAlchemy/SQLModel), dan /app/schemas (Pydantic v2).',
      'Manajemen embedding & semantic search menggunakan PostgreSQL dengan ekstensi pgvector dan indeks HNSW untuk pencarian vector berkecepatan tinggi.',
      'Pemanggilan LLM atau pemrosesan dokumen yang memakan waktu >2 detik wajib dijalankan secara asynchronous atau menggunakan background task worker (Redis / Celery) agar thread FastAPI tidak terblokir.',
      'Frontend Next.js mengonsumsi streaming responses dari FastAPI via Server-Sent Events (SSE) atau WebSockets.',
    ],
    cursorRulesSummary: [
      'Selalu gunakan Pydantic v2 model untuk request body dan response model di FastAPI.',
      'Gunakan session async (AsyncSession) untuk semua query database PostgreSQL.',
      'Tangani rate-limiting dan exponential backoff retry untuk pemanggilan third-party LLM API.',
    ],
  },

  custom: {
    id: 'custom',
    name: 'custom',
    version: 'Kustom Pengguna',
    title: 'Arsitektur Kustom Pengguna',
    badge: 'Racik Sendiri',
    description: 'Kustomisasi stack teknologi sesuai kebutuhan proyekmu',
    repoReference: {
      name: 'User Defined Architecture',
      url: 'https://github.com',
      stars: 'Custom Stack',
    },
    tech: {
      frontend: {
        name: 'Next.js 16 + Tailwind CSS',
        sublabel: 'Bisa disesuaikan (React, Vue, Svelte, Flutter...)',
        iconType: 'nextjs',
      },
      backend: {
        name: 'Next.js Server Actions',
        sublabel: 'Bisa disesuaikan (Node.js, Go, Python, Laravel...)',
        iconType: 'nodejs',
      },
      database: {
        name: 'Supabase (PostgreSQL)',
        sublabel: 'Bisa disesuaikan (Postgres, MySQL, Mongo, Redis...)',
        iconType: 'supabase',
      },
      deployment: {
        name: 'Docker (VPS / Coolify)',
        sublabel: 'Bisa disesuaikan (Cloudflare, AWS, Vercel, EAS...)',
        iconType: 'docker',
      },
    },
    architectDirectives: [
      'Gunakan arsitektur dan konvensi resmi sesuai kombinasi teknologi kustom yang dipilih pengguna.',
      'Jaga modularitas dan separation of concerns antara frontend, backend, database, dan target deployment.',
    ],
    cursorRulesSummary: [
      'Terapkan best practices dan coding standard resmi untuk setiap framework yang dipilih.',
      'Sediakan struktur folder yang rapi dan mudah dieksekusi oleh tim developer.',
    ],
  },
};

export const DEFAULT_ARCHETYPE_ID = 'starter';
