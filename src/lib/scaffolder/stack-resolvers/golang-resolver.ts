import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";
import { getNormalizedFeatures } from "./nextjs-resolver";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function toSafeGoModuleName(text: string): string {
  let slug = slugify(text);
  if (!slug || !/^[a-z0-9]/.test(slug)) {
    slug = "app-" + (slug || "server");
  }
  return slug;
}

/**
 * Generates a Go standard layout starter codebase using net/http or Gin.
 */
export function resolveGolangStack(targetFolder: JSZip, prd: PRDOutput): void {
  const moduleName = toSafeGoModuleName(prd.title);
  const features = getNormalizedFeatures(prd);

  // 1. go.mod
  targetFolder.file(
    "go.mod",
    `module ${moduleName}

go 1.23
`
  );

  // 2. cmd/server/main.go
  targetFolder.file(
    "cmd/server/main.go",
    `package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

type HealthResponse struct {
	Status    string \`json:"status"\`
	App       string \`json:"app"\`
	Timestamp string \`json:"timestamp"\`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// Healthcheck endpoint
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		resp := HealthResponse{
			Status:    "healthy",
			App:       "${prd.title.replace(/"/g, '\\"')}",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}
		json.NewEncoder(w).Encode(resp)
	})

	// Dynamic Feature Handlers (Contract Skeletons)
${features
  .map((f) => {
    const slug = slugify(f.name);
    return `\t// Modul: ${f.name} [${f.priority}]
\t// User Story: ${f.user_story.replace(/"/g, '\\"')}
\tmux.HandleFunc("GET /api/v1/${slug}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"feature":  "${f.name.replace(/"/g, '\\"')}",
			"priority": "${f.priority}",
			"status":   "ready",
		})
	})`;
  })
  .join("\n\n")}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	fmt.Printf("Starting ${prd.title} Go Server on http://localhost:%s\\n", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
`
  );

  // 3. .env.example
  targetFolder.file(
    ".env.example",
    `PORT=8080
DATABASE_URL="postgres://postgres:postgres@localhost:5432/${moduleName.replace(/-/g, "_")}?sslmode=disable"
`
  );

  // 4. .gitignore
  targetFolder.file(
    ".gitignore",
    `# Binaries
bin/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary, built with 'go test -c'
*.test

# Output of the go coverage tool
*.out

# Environment variables
.env
.env.local
`
  );

  // 5. README.md
  targetFolder.file(
    "README.md",
    `# ${prd.title} — Go Backend

Starter backend yang dibangun dengan standar Clean Architecture Go.

## Cara Menjalankan:
\`\`\`bash
# 1. Unduh dependensi
go mod tidy

# 2. Jalankan server lokal
go run cmd/server/main.go
\`\`\`

Buka browser atau kirim request curl:
\`\`\`bash
curl http://localhost:8080/health
\`\`\`
`
  );
}
