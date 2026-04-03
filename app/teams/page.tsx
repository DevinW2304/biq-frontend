'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchJSON } from '@/lib/api';
import { TeamLeaderboardEntry } from '@/lib/types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamLeaderboardEntry[]>([]);
  const [query, setQuery] = useState('');
  const [conference, setConference] = useState<'All' | 'Eastern' | 'Western'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTeams() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchJSON<TeamLeaderboardEntry[]>('/api/teams/leaders?limit=30');

        if (isMounted) {
          setTeams(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load teams.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teams
      .filter((team) => {
        const matchesConference =
          conference === 'All' ? true : team.conference === conference;

        const matchesQuery =
          normalizedQuery.length === 0
            ? true
            : [
                team.name,
                team.abbreviation,
                team.conference,
                team.division,
              ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery));

        return matchesConference && matchesQuery;
      })
      .sort((a, b) => b.netRating - a.netRating);
  }, [teams, query, conference]);

  return (
    <main className="page-shell space-y-8">
      <section className="card" style={{ padding: '1.5rem' }}>
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>
          Team Index
        </p>

        <h1
          className="display"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            lineHeight: 0.95,
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          TEAM
          <br />
          SEARCH
        </h1>

        <p
          className="muted-copy"
          style={{
            maxWidth: '68ch',
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
          }}
        >
          Browse every team dashboard with live season context, efficiency profile,
          roster view, and BIQ-style team framing.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(180px, 0.6fr)',
            gap: '0.9rem',
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, abbreviations, conferences, divisions..."
            aria-label="Search teams"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.95rem 1rem',
              borderRadius: '14px',
              outline: 'none',
              fontSize: '0.95rem',
            }}
          />

          <select
            value={conference}
            onChange={(e) =>
              setConference(e.target.value as 'All' | 'Eastern' | 'Western')
            }
            aria-label="Filter by conference"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.95rem 1rem',
              borderRadius: '14px',
              outline: 'none',
              fontSize: '0.95rem',
            }}
          >
            <option value="All">All conferences</option>
            <option value="Eastern">Eastern</option>
            <option value="Western">Western</option>
          </select>
        </div>

        <div
          style={{
            marginTop: '0.9rem',
            fontSize: '0.72rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          {loading ? 'Loading teams…' : `${filteredTeams.length} teams shown`}
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">All Team Dashboards</span>
        </div>

        {error ? (
          <div className="card" style={{ padding: '1.25rem', color: 'var(--muted)' }}>
            Failed to load teams: {error}
          </div>
        ) : loading ? (
          <div className="card" style={{ padding: '1.25rem', color: 'var(--muted)' }}>
            Loading team dashboards...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem', color: 'var(--muted)' }}>
            No teams matched your search.
          </div>
        ) : (
          <div
            className="grid-ruled"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {filteredTeams.map((team, index) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'grid',
                  gap: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.58rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        marginBottom: '0.55rem',
                      }}
                    >
                      #{index + 1} · {team.abbreviation}
                    </p>

                    <h2
                      style={{
                        margin: 0,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.6rem',
                        lineHeight: 0.98,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {team.name}
                    </h2>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      lineHeight: 1,
                    }}
                  >
                    {Number(team.netRating ?? 0).toFixed(1)}
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: 'var(--muted)',
                    fontSize: '0.74rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {team.conference} · {team.division}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '0.75rem',
                    paddingTop: '0.35rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div className="stat-label">Record</div>
                    <div className="stat-val" style={{ fontSize: '1.15rem' }}>
                      {team.wins}-{team.losses}
                    </div>
                  </div>

                  <div>
                    <div className="stat-label">Win%</div>
                    <div className="stat-val" style={{ fontSize: '1.15rem' }}>
                      {Number(team.winPct ?? 0).toFixed(3)}
                    </div>
                  </div>

                  <div>
                    <div className="stat-label">Off</div>
                    <div className="stat-val teal" style={{ fontSize: '1.15rem' }}>
                      {Number(team.offRating ?? 0).toFixed(1)}
                    </div>
                  </div>

                  <div>
                    <div className="stat-label">Def</div>
                    <div className="stat-val" style={{ fontSize: '1.15rem' }}>
                      {Number(team.defRating ?? 0).toFixed(1)}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                  }}
                >
                  {team.reason ?? 'Current team profile unavailable.'}
                </p>

                <div
                  style={{
                    fontSize: '0.64rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Open dashboard →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}