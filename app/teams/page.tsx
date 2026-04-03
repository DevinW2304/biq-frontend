import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { TeamLeaderboardEntry } from '@/lib/types';

export default async function TeamsPage() {
  const teams = await fetchJSON<TeamLeaderboardEntry[]>('/api/teams/leaders?limit=12');

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
          DASHBOARDS
        </h1>

        <p
          className="muted-copy"
          style={{
            maxWidth: '68ch',
            fontSize: '0.95rem',
          }}
        >
          Team pages are built to mirror the BIQ product feel: clean, current, and rooted in
          live season context. Start from the current team leaders below, then open any dashboard
          for record, efficiency profile, roster context, and lineup insight.
        </p>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">Current Team Leaders</span>
        </div>

        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {teams.map((team, index) => (
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
                  {team.netRating.toFixed(1)}
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
                    {team.winPct.toFixed(3)}
                  </div>
                </div>

                <div>
                  <div className="stat-label">Off</div>
                  <div className="stat-val teal" style={{ fontSize: '1.15rem' }}>
                    {team.offRating.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="stat-label">Def</div>
                  <div className="stat-val" style={{ fontSize: '1.15rem' }}>
                    {team.defRating.toFixed(1)}
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
                {team.reason}
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
      </section>
    </main>
  );
}