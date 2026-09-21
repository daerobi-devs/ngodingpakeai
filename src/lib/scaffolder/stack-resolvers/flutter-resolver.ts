import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";
import { getNormalizedFeatures } from "./nextjs-resolver";

export function toSafeDartPackageName(text: string): string {
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "");
  if (!slug || !/^[a-z]/.test(slug)) {
    slug = "app_" + (slug || "starter");
  }
  return slug;
}

/**
 * Generates a Flutter (Dart) mobile starter codebase.
 */
export function resolveFlutterStack(targetFolder: JSZip, prd: PRDOutput): void {
  const projectName = toSafeDartPackageName(prd.title);
  const features = getNormalizedFeatures(prd);

  // 1. pubspec.yaml
  targetFolder.file(
    "pubspec.yaml",
    `name: ${projectName}
description: "${(prd.opportunity_framing?.core_problem || "Flutter application").replace(/"/g, '\\"')}"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0

flutter:
  uses-material-design: true
`
  );

  // 2. lib/main.dart
  targetFolder.file(
    "lib/main.dart",
    `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${prd.title.replace(/'/g, "\\'")}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF09090B),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${prd.title.replace(/'/g, "\\'")}'),
        backgroundColor: const Color(0xFF121215),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Fitur Utama (MVP)',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          ${features
            .map((f) => `_buildFeatureCard(
            title: '${f.name.replace(/'/g, "\\'")}',
            priority: '${f.priority}',
            userStory: '${f.user_story.replace(/'/g, "\\'")}',
          ),`)
            .join("\n          ")}
        ],
      ),
    );
  }

  static Widget _buildFeatureCard({
    required String title,
    required String priority,
    required String userStory,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0x203B82F6),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  priority,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF60A5FA),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            userStory,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFFA1A1AA),
            ),
          ),
        ],
      ),
    );
  }
}
`
  );

  // 3. README.md
  targetFolder.file(
    "README.md",
    `# ${prd.title} — Flutter App

Starter aplikasi mobile cross-platform menggunakan Flutter.

## Cara Menjalankan:
\`\`\`bash
flutter pub get
flutter run
\`\`\`
`
  );
}
