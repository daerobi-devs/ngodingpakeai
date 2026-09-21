import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";
import { getNormalizedFeatures } from "./nextjs-resolver";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "");
}

/**
 * Generates a clean, modular Python FastAPI starter codebase.
 */
export function resolvePythonFastApiStack(targetFolder: JSZip, prd: PRDOutput): void {
  const projectName = slugify(prd.title) || "fastapi_app";
  const features = getNormalizedFeatures(prd);

  // 1. requirements.txt
  targetFolder.file(
    "requirements.txt",
    `fastapi>=0.115.0
uvicorn[standard]>=0.32.0
pydantic>=2.10.0
pydantic-settings>=2.6.0
sqlalchemy>=2.0.36
alembic>=1.14.0
asyncpg>=0.30.0
python-dotenv>=1.0.1
httpx>=0.28.0
`
  );

  // 2. pyproject.toml
  targetFolder.file(
    "pyproject.toml",
    `[project]
name = "${projectName}"
version = "0.1.0"
description = "${(prd.opportunity_framing?.core_problem || "FastAPI backend").replace(/"/g, '\\"')}"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pydantic>=2.10.0",
    "pydantic-settings>=2.6.0",
    "sqlalchemy>=2.0.36",
    "alembic>=1.14.0",
    "asyncpg>=0.30.0",
    "python-dotenv>=1.0.1",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
`
  );

  // 3. .env.example
  targetFolder.file(
    ".env.example",
    `PROJECT_NAME="${prd.title.replace(/"/g, '\\"')}"
ENVIRONMENT="development"
PORT=8000
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/${projectName}"
CORS_ORIGINS=["http://localhost:3000"]
`
  );

  // 4. .gitignore
  targetFolder.file(
    ".gitignore",
    `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.env
.venv
venv/
ENV/
.pytest_cache/
`
  );

  // 5. app/core/config.py
  targetFolder.file(
    "app/core/config.py",
    `from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "${prd.title.replace(/"/g, '\\"')}"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/${projectName}"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
`
  );

  // 6. app/main.py
  targetFolder.file(
    "app/main.py",
    `from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB connection pool
    print(f"Starting {settings.PROJECT_NAME} on port {settings.PORT}...")
    yield
    # Shutdown: Clean up resources
    print("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="${(prd.opportunity_framing?.working_hypothesis || prd.opportunity_framing?.core_problem || "Production-ready FastAPI starter").replace(/"/g, '\\"')}",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Healthcheck
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": "0.1.0"
    }

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
`
  );

  // 7. app/api/v1/router.py
  const routerImports: string[] = [];
  const routerIncludes: string[] = [];

  for (const feat of features) {
    const featSlug = slugify(feat.name);
    routerImports.push(`from app.api.v1.endpoints import ${featSlug}`);
    routerIncludes.push(`api_router.include_router(${featSlug}.router, prefix="/${featSlug.replace(/_/g, "-")}", tags=["${feat.name}"])`);
  }

  targetFolder.file(
    "app/api/v1/router.py",
    `from fastapi import APIRouter
${routerImports.join("\n")}

api_router = APIRouter()

${routerIncludes.join("\n")}
`
  );

  // 8. app/api/v1/endpoints/*.py
  for (const feat of features) {
    const featSlug = slugify(feat.name);
    targetFolder.file(
      `app/api/v1/endpoints/${featSlug}.py`,
      `from typing import List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class ${featSlug.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}Schema(BaseModel):
    id: str
    name: str
    status: str = "active"

@router.get("/", response_model=List[${featSlug.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}Schema])
async def list_items():
    """
    ${feat.name} - ${feat.user_story.replace(/"/g, '\\"')}
    Priority: ${feat.priority}
    """
    return [
        {"id": "demo-1", "name": "${feat.name} Demo Record", "status": "active"}
    ]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_item(payload: ${featSlug.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}Schema):
    return {"message": "Data successfully created", "payload": payload}
`
    );
  }

  // 9. README.md
  targetFolder.file(
    "README.md",
    `# ${prd.title} — FastAPI Backend

Starter backend yang dibangun dengan arsitektur modular Python FastAPI.

## Cara Menjalankan:
1. Buat virtual environment:
\`\`\`bash
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# Linux/macOS
source .venv/bin/activate
\`\`\`

2. Install dependensi:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. Jalankan server pengembang:
\`\`\`bash
uvicorn app.main:app --reload --port 8000
\`\`\`

4. Buka dokumentasi Swagger UI interaktif:
- \`http://localhost:8000/docs\`
- \`http://localhost:8000/redoc\`
`
  );
}
