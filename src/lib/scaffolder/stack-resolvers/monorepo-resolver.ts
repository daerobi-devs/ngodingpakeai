import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";
import { resolveNextJsStack } from "./nextjs-resolver";
import { resolvePythonFastApiStack } from "./python-fastapi-resolver";
import { resolveGolangStack } from "./golang-resolver";
import { resolveLaravelStack } from "./laravel-resolver";
import { resolveFlutterStack } from "./flutter-resolver";
import { resolveGenericStack } from "./generic-resolver";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Resolves a Monorepo layout when frontend and backend use distinct technology stacks.
 */
export function resolveMonorepoStack(
  rootFolder: JSZip,
  prd: PRDOutput,
  frontendType: "nextjs" | "flutter" | "generic",
  backendType: "python" | "golang" | "laravel" | "generic"
): void {
  const projectName = slugify(prd.title) || "app-monorepo";
  const dbName = projectName.replace(/-/g, "_");

  // 1. Root docker-compose.yml
  rootFolder.file(
    "docker-compose.yml",
    `version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${dbName}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${dbName}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
`
  );

  // 2. Root README.md
  rootFolder.file(
    "README.md",
    `# ${prd.title} — Monorepo Architecture

Proyek ini menggunakan arsitektur Monorepo terpisah antara antarmuka (*frontend*) dan layanan (*backend*).

## Struktur Folder:
- \`frontend/\`: Client application (${frontendType})
- \`backend/\`: API & Core Services (${backendType})
- \`docs/\`: Spesifikasi PRD, DESIGN.md, dan diagram Mermaid arsitektur sistem.
- \`docker-compose.yml\`: Orkestrasi kontainer lokal lengkap dengan database PostgreSQL.

## Menjalankan dengan Docker Compose:
\`\`\`bash
docker compose up --build
\`\`\`
- Frontend: \`http://localhost:3000\`
- Backend API: \`http://localhost:8000\`
`
  );

  // 3. Populate frontend folder
  const frontendFolder = rootFolder.folder("frontend");
  if (frontendFolder) {
    if (frontendType === "nextjs") {
      resolveNextJsStack(frontendFolder, prd);
      frontendFolder.file(
        "Dockerfile",
        `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
`
      );
    } else if (frontendType === "flutter") {
      resolveFlutterStack(frontendFolder, prd);
    } else {
      resolveGenericStack(frontendFolder, prd);
    }
  }

  // 4. Populate backend folder
  const backendFolder = rootFolder.folder("backend");
  if (backendFolder) {
    if (backendType === "python") {
      resolvePythonFastApiStack(backendFolder, prd);
      backendFolder.file(
        "Dockerfile",
        `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`
      );
    } else if (backendType === "golang") {
      resolveGolangStack(backendFolder, prd);
      backendFolder.file(
        "Dockerfile",
        `FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY . .
RUN go build -o server cmd/server/main.go
EXPOSE 8080
CMD ["./server"]
`
      );
    } else if (backendType === "laravel") {
      resolveLaravelStack(backendFolder, prd);
      backendFolder.file(
        "Dockerfile",
        `FROM php:8.2-cli-alpine
WORKDIR /app
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY composer*.json ./
RUN composer install --no-scripts
COPY . .
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
`
      );
    } else {
      resolveGenericStack(backendFolder, prd);
    }
  }
}
