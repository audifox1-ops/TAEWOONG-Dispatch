import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

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

const baseEnv = { ...process.env };
const prismaBin = binPath('prisma');
const nestBin = binPath('nest');

run(`${prismaBin} generate`, baseEnv);

run(`${nestBin} build`, baseEnv);
