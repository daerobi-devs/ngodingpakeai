export interface ParsedColumn {
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  references?: string;
  nullable: boolean;
}

export interface ParsedTable {
  name: string;
  columns: ParsedColumn[];
}

export interface ParsedRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  sourceFile: string;
  handlerName?: string;
  inferredRole?: string;
}

/**
 * Filter out stale, backup, temporary, or archive SQL files so they don't corrupt the schema.
 */
export function isBackupOrStaleFile(filePath: string): boolean {
  const normalized = filePath.toLowerCase().replace(/\\/g, '/');
  const baseName = normalized.split('/').pop() || '';

  const staleKeywords = [
    'backup',
    'old',
    'lama',
    'dump',
    'test_query',
    'temp',
    'tmp',
    'archive',
    'copy',
    'salinan',
    '.bak',
    'cadangan',
    'unused',
  ];

  return staleKeywords.some((keyword) => baseName.includes(keyword));
}

/**
 * Sort migration files chronologically based on timestamp or sequential numbering prefix.
 */
export function sortMigrationFiles<T extends { path: string }>(files: T[]): T[] {
  return [...files].sort((a, b) => {
    const nameA = a.path.split(/[/\\\\]/).pop() || '';
    const nameB = b.path.split(/[/\\\\]/).pop() || '';

    const numMatchA = nameA.match(/^(\d+)/);
    const numMatchB = nameB.match(/^(\d+)/);

    if (numMatchA && numMatchB) {
      return numMatchA[1].localeCompare(numMatchB[1], undefined, { numeric: true });
    }
    return nameA.localeCompare(nameB);
  });
}

/**
 * Deterministic SQL DDL parser. Extracts CREATE TABLE, Primary Keys, and Foreign Keys.
 */
export function parseSqlDDL(sqlContent: string): ParsedTable[] {
  const tables: Map<string, ParsedTable> = new Map();
  // Clean comments
  const cleanSql = sqlContent
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '');

  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`]?\w+["`]?\.)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\);/gi;

  let match;
  while ((match = createTableRegex.exec(cleanSql)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];

    const columns: ParsedColumn[] = [];
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);

    const tableForeignKeys: { col: string; target: string }[] = [];
    const tablePrimaryKeys: Set<string> = new Set();

    // Check table-level constraints first
    for (const rawLine of lines) {
      const line = rawLine.replace(/,$/, '').trim();
      const pkMatch = line.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkMatch[1].split(',').forEach((c) => {
          tablePrimaryKeys.add(c.trim().replace(/["`]/g, '').toLowerCase());
        });
      }

      const fkMatch = line.match(/^FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:["`]?\w+["`]?\.)?["`]?(\w+)["`]?\s*\(([^)]+)\)/i);
      if (fkMatch) {
        const col = fkMatch[1].trim().replace(/["`]/g, '').toLowerCase();
        const targetTable = fkMatch[2].trim().toLowerCase();
        const targetCol = fkMatch[3].trim().toLowerCase();
        tableForeignKeys.push({ col, target: `${targetTable}.${targetCol}` });
      }

      const inlineConstraintFk = line.match(/CONSTRAINT\s+\w+\s+FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:["`]?\w+["`]?\.)?["`]?(\w+)["`]?\s*\(([^)]+)\)/i);
      if (inlineConstraintFk) {
        const col = inlineConstraintFk[1].trim().replace(/["`]/g, '').toLowerCase();
        const targetTable = inlineConstraintFk[2].trim().toLowerCase();
        const targetCol = inlineConstraintFk[3].trim().toLowerCase();
        tableForeignKeys.push({ col, target: `${targetTable}.${targetCol}` });
      }
    }

    // Now parse columns
    for (const rawLine of lines) {
      const line = rawLine.replace(/,$/, '').trim();
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT|UNIQUE|CHECK)/i.test(line)) {
        continue;
      }

      const colMatch = line.match(/^["`]?(\w+)["`]?\s+([A-Za-z0-9_]+(?:\([^)]+\))?)(.*)/);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const colType = colMatch[2].toUpperCase();
        const rest = colMatch[3] || '';

        const isInlinePk = /PRIMARY\s+KEY/i.test(rest) || tablePrimaryKeys.has(colName);
        const inlineFkMatch = rest.match(/REFERENCES\s+(?:["`]?\w+["`]?\.)?["`]?(\w+)["`]?\s*(?:\(([^)]+)\))?/i);

        let isFk = false;
        let references: string | undefined = undefined;

        if (inlineFkMatch) {
          isFk = true;
          references = `${inlineFkMatch[1].toLowerCase()}.${(inlineFkMatch[2] || 'id').toLowerCase()}`;
        } else {
          const foundFk = tableForeignKeys.find((f) => f.col === colName);
          if (foundFk) {
            isFk = true;
            references = foundFk.target;
          }
        }

        const nullable = !/NOT\s+NULL/i.test(rest) && !isInlinePk;

        columns.push({
          name: colName,
          type: colType,
          isPk: isInlinePk,
          isFk,
          references,
          nullable,
        });
      }
    }

    tables.set(tableName, {
      name: tableName,
      columns,
    });
  }

  return Array.from(tables.values());
}

/**
 * Deterministic Prisma schema parser.
 */
export function parsePrismaSchema(prismaContent: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;

  let match;
  while ((match = modelRegex.exec(prismaContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    const columns: ParsedColumn[] = [];

    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('//') || line.startsWith('@@')) continue;
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const colName = parts[0].toLowerCase();
        const colType = parts[1];
        const isPk = line.includes('@id');
        const isRelation = line.includes('@relation');

        columns.push({
          name: colName,
          type: colType,
          isPk,
          isFk: isRelation,
          nullable: colType.endsWith('?'),
        });
      }
    }

    tables.push({
      name: tableName,
      columns,
    });
  }

  return tables;
}

/**
 * Deterministic endpoint scanner for Next.js App Router, Express, and Laravel.
 */
export function extractRoutesFromCode(filePath: string, content: string): ParsedRoute[] {
  const routes: ParsedRoute[] = [];
  const normalizedPath = filePath.replace(/\\/g, '/');

  // 1. Next.js App Router: app/api/**/route.ts
  if (normalizedPath.includes('app/api/') && /route\.(ts|js)$/.test(normalizedPath)) {
    const subRoute = normalizedPath.substring(
      normalizedPath.indexOf('app/api/') + 7,
      normalizedPath.lastIndexOf('/route.')
    );
    const apiPath = `/api/${subRoute}`;

    const methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      const regex = new RegExp(`export\\s+async\\s+function\\s+${method}\\b`, 'i');
      if (regex.test(content)) {
        let inferredRole = 'Pelanggan';
        if (apiPath.includes('/admin') || content.includes('requireAdmin') || content.includes('admin')) {
          inferredRole = 'Administrator';
        }

        routes.push({
          path: apiPath,
          method,
          sourceFile: filePath,
          inferredRole,
        });
      }
    }
  }

  // 2. Express: router.get('/path', ...) or app.post('/path', ...)
  const expressRegex = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let expMatch;
  while ((expMatch = expressRegex.exec(content)) !== null) {
    const method = expMatch[1].toUpperCase() as any;
    const apiPath = expMatch[2];
    routes.push({
      path: apiPath,
      method,
      sourceFile: filePath,
      inferredRole: apiPath.includes('/admin') ? 'Administrator' : 'Pengguna',
    });
  }

  // 3. Laravel: Route::get('/path', ...)
  const laravelRegex = /Route::(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi;
  let larMatch;
  while ((larMatch = laravelRegex.exec(content)) !== null) {
    const method = larMatch[1].toUpperCase() as any;
    const apiPath = `/${larMatch[2].replace(/^\//, '')}`;
    routes.push({
      path: apiPath,
      method,
      sourceFile: filePath,
      inferredRole: apiPath.includes('admin') ? 'Administrator' : 'Pengguna',
    });
  }

  return routes;
}

/**
 * Deterministic Laravel migration parser: extracts Schema::create('tableName', ...)
 */
export function parseLaravelMigrations(content: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const regex = /Schema::create\(\s*['"](\w+)['"]\s*,\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}\);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    const columns: ParsedColumn[] = [];
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.includes('$table->id(') || line.includes('$table->bigIncrements(')) {
        columns.push({ name: 'id', type: 'BIGINT', isPk: true, isFk: false, nullable: false });
      } else {
        const colMatch = line.match(/\$table->(\w+)\(\s*['"](\w+)['"]/);
        if (colMatch) {
          const type = colMatch[1].toUpperCase();
          const colName = colMatch[2].toLowerCase();
          const isFk = line.includes('foreign') || line.includes('references') || colName.endsWith('_id');
          columns.push({
            name: colName,
            type,
            isPk: false,
            isFk,
            nullable: line.includes('nullable'),
          });
        }
      }
    }
    if (columns.length > 0) {
      tables.push({ name: tableName, columns });
    }
  }
  return tables;
}

/**
 * Deterministic TypeScript Entity / Model parser: extracts interface/class with fields
 */
export function parseTypeScriptEntities(content: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const entityRegex = /(?:export\s+)?(?:interface|class)\s+(\w+)(?:\s+extends\s+\w+)?\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = entityRegex.exec(content)) !== null) {
    const entityName = match[1];
    if (/Props|State|Context|Response|Request|Hook|Page|Component/i.test(entityName)) continue;
    const body = match[2];
    const columns: ParsedColumn[] = [];
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const propMatch = line.match(/^(\w+)(\??)\s*:\s*([^;,\n]+)/);
      if (propMatch) {
        const colName = propMatch[1].toLowerCase();
        const nullable = Boolean(propMatch[2]);
        const type = propMatch[3].trim().toUpperCase().replace(/<[^>]+>/g, '');
        columns.push({
          name: colName,
          type: type.slice(0, 20),
          isPk: colName === 'id' || colName === '_id',
          isFk: colName.endsWith('_id') || colName.endsWith('id'),
          nullable,
        });
      }
    }
    if (columns.length >= 2) {
      tables.push({ name: entityName.toLowerCase(), columns });
    }
  }
  return tables;
}
