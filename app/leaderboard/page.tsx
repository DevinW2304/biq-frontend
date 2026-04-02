export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';

function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

export default async function LeaderboardPage() {
  const players = await fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=25');

  return (
    <main className="page-shell space-y-8">
      <section className="card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d6b25e]">
          BIQ Leaderboard
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-zinc-100">
          Top 25 players by BIQ
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
          This testing page shows both broad BIQ utility and the leaderboard ranking score.
          The ranking score adds a star-profile filter so true offensive engines rise over
          strong secondary players.
        </p>
      </section>

      <section className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Rank Score</th>
                <th className="px-4 py-3">BIQ</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Star</th>
                <th className="px-4 py-3">Engine</th>
                <th className="px-4 py-3">Burden</th>
                <th className="px-4 py-3">Creation</th>
                <th className="px-4 py-3">Efficiency</th>
                <th className="px-4 py-3">Impact</th>
                <th className="px-4 py-3">Avail.</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className="border-b border-white/5 text-zinc-300 align-top">
                  <td className="px-4 py-4 font-semibold text-zinc-100">#{index + 1}</td>

                  <td className="px-4 py-4">
                    <Link href={`/players/${player.id}`} className="flex items-center gap-3 hover:opacity-90">
                      <div className="h-[44px] w-[44px] overflow-hidden rounded-lg border border-white/10 bg-[#1a1d23]">
                        <img
                          src={getPlayerHeadshotUrl(player.id)}
                          alt={`${player.name} headshot`}
                          width={44}
                          height={44}
                          className="h-[44px] w-[44px] object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-100">{player.name}</p>
                        <p className="text-xs text-zinc-500">{player.position}</p>
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-4">{player.team}</td>
                  <td className="px-4 py-4 font-bold text-[#d6b25e]">{player.biqRankScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.biqScore.toFixed(1)}</td>
                  <td className="px-4 py-4 text-zinc-400">{player.biqTier}</td>
                  <td className="px-4 py-4">{player.starScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.engineScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.burdenScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.creationScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.efficiencyScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.impactScore.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.availabilityScore.toFixed(1)}</td>
                  <td className="px-4 py-4 max-w-[320px] text-zinc-500">{player.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}