import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CANDIDATE_KEYS = [
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL',
  'POSTGRESQL_URL',
];

function resolveDatabaseUrl(env) {
  for (const key of CANDIDATE_KEYS) {
    const value = env[key];
    if (!value) {
      continue;
    }

    try {
      const parsed = new URL(value);
      if ((parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:') && parsed.hostname) {
        return value;
      }
    } catch {
      // Ignore malformed URLs and try the next candidate.
    }
  }

  return null;
}

function run(command, env) {
  const result = spawnSync(command, {
    stdio: 'inherit',
    env,
    shell: true,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function binPath(name) {
  const candidate = process.platform === 'win32' ? `${name}.cmd` : name;
  const direct = join(process.cwd(), 'node_modules', '.bin', candidate);
  if (existsSync(direct)) {
    return direct;
  }

  return candidate;
}

const databaseUrl = resolveDatabaseUrl(process.env);
const baseEnv = { ...process.env };
const prismaBin = binPath('prisma');
const nestBin = binPath('nest');

run(`${prismaBin} generate`, baseEnv);

if (databaseUrl) {
  const env = { ...baseEnv, DATABASE_URL: databaseUrl };
  run(`${prismaBin} db push`, env);
  run(`${prismaBin} db seed`, env);
} else {
  console.warn(
    'No valid PostgreSQL URL found during build. Skipping prisma db push and seed so the deployment can still build.',
  );
}

run(`${nestBin} build`, baseEnv);
