'use client';

// Team list with search and a conference filter. The server page fetches the
// teams; this only filters what it was handed, so it never shows a spinner.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { TeamLeaderboardEntry } from '@/lib/types';

const CONFERENCES = ['All', 'East', 'West'] as const;
type Conference = (typeof CONFERENCES)[number];

function signed(value: number) {
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(1)}`;
}

export function TeamIndex({ teams }: { teams: TeamLeaderboardEntry[] }) {
  const [query, setQuery] = useState('');
  const [conference, setConference] = useState<Conference>('All');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter(
      (team) =>
        (conference === 'All' || team.conference === conference) &&
        (!q ||
          [team.name, team.abbreviation, team.division].some((value) =>
            value.toLowerCase().includes(q)
          ))
    );
  }, [teams, query, conference]);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 24 }}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by team, abbreviation or division"
          aria-label="Search teams"
          style={{
            flex: '1 1 260px',
            maxWidth: 460,
            background: '#fff',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--radius)',
            color: 'var(--ink)',
            padding: '11px 14px',
            fontSize: 15,
          }}
        />
        <div role="group" aria-label="Conference" style={{ display: 'flex', gap: 8 }}>
          {CONFERENCES.map((option) => (
            <button
              key={option}
              type="button"
              className="biq-btn-ghost"
              aria-pressed={conference === option}
              onClick={() => setConference(option)}
              style={{ padding: '10px 16px', fontSize: 13 }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="biq-mono" style={{ marginTop: 20 }} aria-live="polite">
        {shown.length} of {teams.length} teams
      </p>

      {shown.length === 0 ? (
        <div className="biq-card" style={{ padding: 28, marginTop: 16 }}>
          <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
            No teams match that search
          </p>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            Try a team name, a three-letter abbreviation or a division.
          </p>
        </div>
      ) : (
        <ol className="biq-ledger">
          {shown.map((team) => (
            <li key={team.id} className="biq-row">
              <Link href={`/teams/${team.id}`} className="biq-ledger-link">
                <span className="biq-rank" style={{ fontSize: 15 }}>
                  {String(teams.indexOf(team) + 1).padStart(2, '0')}
                </span>
                <span
                  aria-hidden="true"
                  className="biq-num"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 52,
                    height: 52,
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--panel)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {team.abbreviation}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="biq-ledger-name">{team.name}</span>
                  <span className="biq-ledger-meta">
                    {[team.conference, team.division, `${team.wins}-${team.losses}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="biq-ledger-score" style={{ textAlign: 'right' }}>
                  <span
                    className="biq-num"
                    style={{
                      display: 'block',
                      fontSize: 22,
                      fontWeight: 600,
                      color: team.netRating > 0 ? 'var(--up)' : team.netRating < 0 ? 'var(--down)' : 'var(--ink)',
                    }}
                  >
                    {signed(team.netRating)}
                  </span>
                  <span className="biq-mono" style={{ display: 'block', marginTop: 6, fontSize: 9 }}>
                    Net · Off {team.offRating.toFixed(1)} · Def {team.defRating.toFixed(1)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
