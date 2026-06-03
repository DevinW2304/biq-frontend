import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { TeamProfile } from '@/lib/types';
import { StatCard } from '@/components/StatCard';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const team = await fetchJSON<TeamProfile>(`/api/teams/${params.id}`);
  const roster = team.rosterPreview ?? [];

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Header band */}
        <div style={{ padding: '1.75rem' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '0.875rem',
          }}>
            {/* Label */}
            <p style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              margin: 0,
            }}>
              Team Dashboard
            </p>
            <Link href="/teams" style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--muted)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}>
              ← Back to teams
            </Link>
          </div>

          {/* Team name */}
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 8,
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}>
            {team.name}
          </h1>

          {/* Conference / division */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[team.abbreviation, team.conference, team.division].filter(Boolean).map((tag) => (
              <span key={tag} style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 99,
                background: 'var(--s2)',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Insight */}
          {team.lineupInsight && (
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--muted)',
              lineHeight: 1.6,
              maxWidth: 600,
              margin: 0,
            }}>
              {team.lineupInsight}
            </p>
          )}


        </div>
      </section>

      {/* ── Team Stats ── */}
      <section>
        <SectionHeader title="Team Profile" />
        <div className="grid-ruled" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {team.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* ── Roster Preview ── */}
      <section style={{
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.5rem',
      }}>
        <SectionHeader title="Roster Preview" />

        {roster.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {roster.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  padding: '1rem',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}>
                  #{player.number || '--'} · {player.position || 'Player'}
                </span>

                <span style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--text)',
                  lineHeight: 1.2,
                  fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                }}>
                  {player.name}
                </span>

                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--gold, #C9A84C)',
                  marginTop: 2,
                }}>
                  View profile →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
            No roster preview is available for this team yet.
          </p>
        )}
      </section>
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <h2 style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        margin: 0,
      }}>
        {title}
      </h2>
    </div>
  );
}