const DATABASE_URL_CANDIDATES = [
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL',
  'POSTGRESQL_URL',
];

function isValidDatabaseUrl(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:') &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  for (const key of DATABASE_URL_CANDIDATES) {
    const candidate = env[key];
    if (isValidDatabaseUrl(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function requireDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const resolved = resolveDatabaseUrl(env);
  if (!resolved) {
    throw new Error(
      'No valid PostgreSQL URL found. Set DATABASE_URL or a supported POSTGRES_* environment variable.',
    );
  }

  return resolved;
}
