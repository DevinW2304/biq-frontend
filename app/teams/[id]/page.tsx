import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { TeamProfile } from '@/lib/types';
import { StatCard } from '@/components/StatCard';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const team = await fetchJSON<TeamProfile>(`/api/teams/${params.id}`);
  const roster = team.rosterPreview ?? [];

  return (
    <main className="page-shell space-y-8">
      <section className="card" style={{ padding: '1.5rem' }}>
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>
          Team Dashboard
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h1
              className="display"
              style={{
                fontSize: 'clamp(2.6rem, 5vw, 4.25rem)',
                lineHeight: 0.95,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              {team.name}
            </h1>

            <p
              style={{
                marginTop: '0.75rem',
                marginBottom: 0,
                color: 'var(--muted)',
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              {team.abbreviation ?? ''}{team.abbreviation ? ' · ' : ''}
              {team.conference}
              {team.division ? ` · ${team.division}` : ''}
            </p>
          </div>

          <Link href="/teams" className="section-link">
            Back to teams →
          </Link>
        </div>

        <p
          style={{
            marginTop: '1.25rem',
            marginBottom: 0,
            maxWidth: '78ch',
            color: 'var(--muted)',
            fontFamily: 'var(--font-serif)',
            fontSize: '0.98rem',
            lineHeight: 1.82,
          }}
        >
          {team.lineupInsight}
        </p>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">Team Profile</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {team.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: '1.5rem' }}>
        <div className="section-head" style={{ marginBottom: '1rem' }}>
          <span className="section-title">Roster Preview</span>
        </div>

        {roster.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.9rem',
            }}
          >
            {roster.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="card"
                style={{
                  padding: '1rem',
                  textDecoration: 'none',
                  display: 'grid',
                  gap: '0.4rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  #{player.number || '--'} · {player.position || 'Player'}
                </div>

                <div
                  style={{
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                  }}
                >
                  {player.name}
                </div>

                <div
                  style={{
                    fontSize: '0.64rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginTop: '0.2rem',
                  }}
                >
                  Open player dashboard →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '1rem' }}>
            <p
              style={{
                margin: 0,
                color: 'var(--muted)',
                fontFamily: 'var(--font-serif)',
                fontSize: '0.95rem',
              }}
            >
              No roster preview is available for this team yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}