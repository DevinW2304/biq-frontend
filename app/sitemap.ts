import type { MetadataRoute } from 'next';
import { fetchCachedJSON } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import type { PlayerDirectoryPage, TeamSearchResult } from '@/lib/types';

// Rebuilt hourly so a backend outage at build time only costs an hour of a
// sitemap that lists the static routes alone.
export const revalidate = 3600;

const STATIC_ROUTES = ['/', '/leaderboard', '/players', '/teams', '/compare', '/model'];
const PLAYER_PAGE_SIZE = 500;

// Only players with games this season: a profile with no stats is a thin page.
async function fetchPlayerIds(): Promise<number[]> {
  const ids: number[] = [];
  for (let offset = 0; ; offset += PLAYER_PAGE_SIZE) {
    const page = await fetchCachedJSON<PlayerDirectoryPage>(
      `/api/players?played_only=true&offset=${offset}&limit=${PLAYER_PAGE_SIZE}`,
      revalidate
    );
    ids.push(...page.items.map((player) => player.id));
    if (page.items.length === 0 || offset + PLAYER_PAGE_SIZE >= page.total) return ids;
  }
}

async function fetchTeamIds(): Promise<number[]> {
  const teams = await fetchCachedJSON<TeamSearchResult[]>('/api/teams/search', revalidate);
  return teams.map((team) => team.id);
}

// Section failures are logged and skipped so one bad endpoint can't take the
// whole sitemap down with it.
async function orEmpty(label: string, load: () => Promise<number[]>): Promise<number[]> {
  try {
    return await load();
  } catch (error) {
    console.error(`Sitemap: failed to load ${label}`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [playerIds, teamIds] = await Promise.all([
    orEmpty('players', fetchPlayerIds),
    orEmpty('teams', fetchTeamIds),
  ]);

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path === '/' ? '' : path}`,
      changeFrequency: 'daily' as const,
      priority: path === '/' ? 1 : 0.8,
    })),
    ...playerIds.map((id) => ({
      url: `${SITE_URL}/players/${id}`,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...teamIds.map((id) => ({
      url: `${SITE_URL}/teams/${id}`,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
  ];
}
