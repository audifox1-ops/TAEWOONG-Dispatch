const LOCAL_ORIGIN_RE = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;
const VERCEL_PREVIEW_ORIGIN_RE = /^https:\/\/taewoong-dispatch(?:-[a-z0-9]+)?\.vercel\.app$/i;

function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.trim();
  }
}

function addOrigin(set: Set<string>, value?: string) {
  if (!value) {
    return;
  }

  set.add(normalizeOrigin(value));
}

function buildAllowedOriginSet() {
  const allowed = new Set<string>();

  addOrigin(allowed, process.env.WEB_URL);
  addOrigin(allowed, process.env.FRONTEND_URL);
  addOrigin(allowed, process.env.VERCEL_BRANCH_URL);
  addOrigin(allowed, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return allowed;
}

const allowedOrigins = buildAllowedOriginSet();

export function isAllowedCorsOrigin(origin: string) {
  const normalized = normalizeOrigin(origin);

  return (
    LOCAL_ORIGIN_RE.test(normalized) ||
    VERCEL_PREVIEW_ORIGIN_RE.test(normalized) ||
    allowedOrigins.has(normalized)
  );
}

export function corsOriginHandler(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (isAllowedCorsOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`), false);
}
