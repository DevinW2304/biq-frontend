import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function tryFetch(path: string) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  const res = await fetch(url, {
    cache: 'no-store',
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    try {
      body = await res.text();
    } catch {
      body = null;
    }
  }

  return {
    ok: res.ok,
    status: res.status,
    url,
    body,
  };
}

export async function GET() {
  const candidates = [
    '/teams/leaders?limit=30',
    '/api/teams/leaders?limit=30',
  ];

  const attempts: Array<{
    path: string;
    status: number;
    url: string;
    body: unknown;
  }> = [];

  for (const path of candidates) {
    try {
      const result = await tryFetch(path);

      if (result.ok) {
        return NextResponse.json(result.body);
      }

      attempts.push({
        path,
        status: result.status,
        url: result.url,
        body: result.body,
      });
    } catch (error) {
      attempts.push({
        path,
        status: 0,
        url: `${API_BASE_URL.replace(/\/$/, '')}${path}`,
        body: error instanceof Error ? error.message : 'Unknown fetch error',
      });
    }
  }

  return NextResponse.json(
    {
      error: 'Failed to load team search data from backend.',
      apiBaseUrl: API_BASE_URL,
      attempts,
    },
    { status: 500 }
  );
}