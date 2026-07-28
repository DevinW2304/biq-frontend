const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function buildUrl(path: string) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

type FetchJSONOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

/**
 * Carries the HTTP status so callers can tell "this player does not exist"
 * (404) from "the backend is unavailable" (503/5xx). Rendering notFound() for
 * both turns an outage into a misleading "not found" page.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, detail?: string) {
    super(`Request failed: ${status} ${path}${detail ? ` - ${detail}` : ''}`);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

export async function fetchJSON<T>(
  path: string,
  options: FetchJSONOptions = {}
): Promise<T> {
  const res = await fetch(buildUrl(path), options);

  if (!res.ok) {
    // FastAPI reports the reason in `detail`; keep it for the server-side log.
    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = typeof body?.detail === 'string' ? body.detail : undefined;
    } catch {
      detail = undefined;
    }
    throw new ApiError(res.status, path, detail);
  }

  return res.json();
}

export async function fetchCachedJSON<T>(
  path: string,
  revalidate = 300
): Promise<T> {
  return fetchJSON<T>(path, {
    next: { revalidate },
  });
}

export async function fetchLiveJSON<T>(path: string): Promise<T> {
  return fetchJSON<T>(path, {
    cache: 'no-store',
  });
}