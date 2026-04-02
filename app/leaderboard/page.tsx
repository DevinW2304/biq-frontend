export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';

function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

function getBiqBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'Elite Tier', cls: 'badge-gold' };
  if (score >= 80) return { label: 'High Impact', cls: 'badge-teal' };
  return { label: 'Solid Tier', cls: 'badge-neutral' };
}

export default async function LeaderboardPage() {
  const players = await fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=25');

  return (
    <main className="page-shell space-y-8">
      <section className="card" style={{ padding: '1.5rem' }}>
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>
          BIQ Leaderboard
        </p>

        <h1
          className="display"
          style={{
            fontSize: 'clamp(2.6rem, 5vw, 4.25rem)',
            lineHeight: 0.95,
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          TOP 25
          <br />
          PLAYERS BY BIQ
        </h1>

        <p className="muted-copy" style={{ maxWidth: '70ch', fontSize: '0.92rem' }}>
          This board is built to answer a harder question than who has the biggest box-score line
          or the loudest name value. BIQ starts with broad player utility, then pushes further by
          asking which players are truly driving offense, handling real responsibility, and still
          producing efficient, winning-level impact. That is why the order here may differ from
          public perception, simple scoring lists, or reputation-based rankings.
        </p>
      </section>

      <section className="card" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gap: '1.35rem',
          }}
        >
          <div
            style={{
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <p
              className="eyebrow"
              style={{
                marginBottom: '0.7rem',
              }}
            >
              How to Read the Board
            </p>

            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.65rem, 2vw, 2.4rem)',
                lineHeight: 1.02,
                letterSpacing: '0.02em',
                color: 'var(--text)',
                maxWidth: '15ch',
              }}
            >
              Why BIQ values certain players differently
            </h2>
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: '78ch',
              color: 'var(--muted)',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.98rem',
              lineHeight: 1.82,
            }}
          >
            BIQ is not trying to mirror popularity, scoring average, or traditional award logic. It
            is built to identify which players create the most real offensive value once workload,
            creation pressure, efficiency, and impact are viewed together. That means some players
            rise because their current role is more difficult and more valuable than public
            perception gives them credit for, while others are held back if their profile looks
            strong on the surface but does not carry the same first-option weight.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              paddingTop: '0.35rem',
            }}
          >
            <div
              style={{
                paddingRight: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '0.7rem',
                }}
              >
                Real offensive engine
              </div>

              <p
                style={{
                  margin: 0,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.93rem',
                  lineHeight: 1.75,
                }}
              >
                BIQ gives extra weight to players who are actually steering possessions, creating
                advantages, absorbing defensive attention, and keeping an offense stable under real
                burden. It is looking for responsibility that scales, not just production that looks
                clean in a lighter role.
              </p>
            </div>

            <div
              style={{
                paddingRight: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '0.7rem',
                }}
              >
                Why outliers can rank high
              </div>

              <p
                style={{
                  margin: 0,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.93rem',
                  lineHeight: 1.75,
                }}
              >
                Some players will look aggressive on this board because the model trusts current
                play shape over name value. If a player is carrying tough creation workload,
                maintaining efficiency, and translating that into strong impact, BIQ is willing to
                rank him above more familiar stars whose roles are easier or more protected.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '0.7rem',
                }}
              >
                Why bigger names may slide
              </div>

              <p
                style={{
                  margin: 0,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.93rem',
                  lineHeight: 1.75,
                }}
              >
                BIQ is intentionally skeptical of star signals that do not fully hold up under
                closer inspection. Strong usage, efficient scoring, or reputation alone are not
                enough. If the profile lacks enough engine value, creation burden, or impact, the
                model treats that player more like a strong secondary force than a true offensive
                driver.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">Current Rankings</span>
          <Link href="/players?q=" className="section-link">
            Browse all players →
          </Link>
        </div>

        <div className="card-flush" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: 1480,
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--s1)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {[
                    'Rank',
                    'Player',
                    'Team',
                    'Rank Score',
                    'BIQ',
                    'Tier',
                    'Star',
                    'Engine',
                    'Burden',
                    'Creation',
                    'Efficiency',
                    'Impact',
                    'Avail.',
                    'Model View',
                  ].map((label) => (
                    <th
                      key={label}
                      style={{
                        padding: '0.75rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.56rem',
                        fontWeight: 500,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {players.map((player, index) => {
                  const badge = getBiqBadge(player.biqScore);

                  return (
                    <tr
                      key={player.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        verticalAlign: 'top',
                      }}
                    >
                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          color: 'var(--text)',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                        }}
                      >
                        #{index + 1}
                      </td>

                      <td style={{ padding: '0.9rem 0.85rem', minWidth: 270 }}>
                        <Link
                          href={`/players/${player.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: 'var(--s2)',
                              border: '1px solid var(--border-strong)',
                            }}
                          >
                            <img
                              src={getPlayerHeadshotUrl(player.id)}
                              alt={`${player.name} headshot`}
                              width={48}
                              height={48}
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.25rem',
                                lineHeight: 1,
                                letterSpacing: '0.03em',
                                color: 'var(--text)',
                                marginBottom: 4,
                              }}
                            >
                              {player.name}
                            </div>

                            <div
                              style={{
                                fontSize: '0.56rem',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: 'var(--muted)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {player.position}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.team}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          color: 'var(--gold)',
                          fontSize: '1.15rem',
                          lineHeight: 1,
                          letterSpacing: '0.03em',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {player.biqRankScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {player.biqScore.toFixed(1)}
                      </td>

                      <td style={{ padding: '0.9rem 0.85rem', minWidth: 170 }}>
                        <span className={`badge ${badge.cls}`}>{player.biqTier}</span>
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.starScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.engineScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.burdenScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.creationScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.efficiencyScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.impactScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text)',
                          fontSize: '0.74rem',
                        }}
                      >
                        {player.availabilityScore.toFixed(1)}
                      </td>

                      <td
                        style={{
                          padding: '0.9rem 0.85rem',
                          minWidth: 300,
                          maxWidth: 360,
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-serif)',
                          fontStyle: 'italic',
                          fontSize: '0.82rem',
                          lineHeight: 1.65,
                        }}
                      >
                        {player.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          <div className="stat-block">
            <span className="stat-label">Leaderboard Size</span>
            <div className="stat-val gold">{players.length}</div>
            <div className="stat-sub">Tracked players on page</div>
          </div>

          <div className="stat-block">
            <span className="stat-label">Top Rank Score</span>
            <div className="stat-val">
              {players[0] ? players[0].biqRankScore.toFixed(1) : '0.0'}
            </div>
            <div className="stat-sub">Current #1 ranking score</div>
          </div>

          <div className="stat-block">
            <span className="stat-label">Top BIQ</span>
            <div className="stat-val teal">
              {players[0] ? players[0].biqScore.toFixed(1) : '0.0'}
            </div>
            <div className="stat-sub">Current #1 broad BIQ score</div>
          </div>
        </div>
      </section>
    </main>
  );
}