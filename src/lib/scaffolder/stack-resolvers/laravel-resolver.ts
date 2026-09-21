import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";
import { getNormalizedFeatures } from "./nextjs-resolver";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function toSafeComposerPackageName(text: string): string {
  let slug = slugify(text);
  if (!slug || !/^[a-z0-9]/.test(slug)) {
    slug = "app-" + (slug || "starter");
  }
  return slug.slice(0, 50);
}

/**
 * Generates a PHP Laravel starter codebase structure.
 */
export function resolveLaravelStack(targetFolder: JSZip, prd: PRDOutput): void {
  const projectName = toSafeComposerPackageName(prd.title);
  const features = getNormalizedFeatures(prd);

  // 1. composer.json
  targetFolder.file(
    "composer.json",
    JSON.stringify(
      {
        name: `app/${projectName}`,
        type: "project",
        description: prd.opportunity_framing?.core_problem || "Laravel starter application",
        keywords: ["framework", "laravel"],
        license: "MIT",
        require: {
          php: "^8.2",
          "laravel/framework": "^11.0",
          "laravel/sanctum": "^4.0",
          "laravel/tinker": "^2.9",
        },
        autoload: {
          "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/",
          },
        },
        scripts: {
          "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi",
          ],
        },
        config: {
          "optimize-autoloader": true,
          "preferred-install": "dist",
          "sort-packages": true,
        },
        "minimum-stability": "stable",
        "prefer-stable": true,
      },
      null,
      2
    )
  );

  // 2. routes/api.php
  targetFolder.file(
    "routes/api.php",
    `<?php

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'app' => '${prd.title.replace(/'/g, "\\'")}',
        'timestamp' => now()->toIso8601String(),
    ]);
});

${features
  .map((f) => {
    const slug = slugify(f.name);
    return `/**
 * Modul: ${f.name} [${f.priority}]
 * User Story: ${f.user_story.replace(/'/g, "\\'")}
 */
Route::get('/v1/${slug}', function () {
    return response()->json([
        'feature' => '${f.name.replace(/'/g, "\\'")}',
        'priority' => '${f.priority}',
        'status' => 'ready',
    ]);
});`;
  })
  .join("\n\n")}
`
  );

  // 3. .env.example
  targetFolder.file(
    ".env.example",
    `APP_NAME="${prd.title.replace(/"/g, '\\"')}"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=${projectName.replace(/-/g, "_")}
DB_USERNAME=postgres
DB_PASSWORD=postgres
`
  );

  // 4. README.md
  targetFolder.file(
    "README.md",
    `# ${prd.title} — Laravel Backend

Starter backend yang dibangun dengan arsitektur PHP Laravel 11.

## Cara Menjalankan:
\`\`\`bash
# 1. Install dependensi
composer install

# 2. Copy env & generate app key
cp .env.example .env
php artisan key:generate

# 3. Jalankan migrasi & dev server
php artisan migrate
php artisan serve
\`\`\`
`
  );
}
