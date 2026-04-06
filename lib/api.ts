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

export async function fetchJSON<T>(
  path: string,
  options: FetchJSONOptions = {}
): Promise<T> {
  const res = await fetch(buildUrl(path), options);

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
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