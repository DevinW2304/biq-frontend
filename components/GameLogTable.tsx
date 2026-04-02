import { GameLogRow } from '@/lib/types';

type GameLogTableProps = {
  rows: GameLogRow[];
};

export function GameLogTable({ rows }: GameLogTableProps) {
  return (
    <section
      style={{
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem 1.75rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* accent bar */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, var(--gold), transparent 60%)',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '0.5rem',
          }}
        >
          Recent Games
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          Game Log
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Recent game-by-game production for context and trend validation.
        </p>
      </div>

      {/* Table */}
      <div
        className="game-log-table-shell"
        style={{ overflowX: 'auto' }}
      >
        <table
          className="game-log-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 980,
          }}
        >
          <thead>
            <tr>
              {[
                { key: 'date', label: 'Date', sticky: 'left' },
                { key: 'matchup', label: 'Matchup', sticky: 'mid' },
                { key: 'result', label: 'W/L' },
                { key: 'min', label: 'MIN' },
                { key: 'pts', label: 'PTS', highlight: true },
                { key: 'reb', label: 'REB' },
                { key: 'ast', label: 'AST' },
                { key: 'stl', label: 'STL' },
                { key: 'blk', label: 'BLK' },
                { key: 'tov', label: 'TOV' },
                { key: 'fg', label: 'FG%' },
                { key: '3pt', label: '3PT%' },
                { key: 'ft', label: 'FT%' },
                { key: 'pm', label: '+/-' },
              ].map((col) => (
                <th
                  key={col.key}
                  className={col.sticky === 'left' ? 'sticky-col sticky-col-left' : col.sticky === 'mid' ? 'sticky-col sticky-col-mid' : ''}
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: col.highlight ? 'var(--gold)' : 'var(--muted)',
                    padding: '0.65rem 0.875rem',
                    textAlign: 'left',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--s1)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.gameDate}-${row.matchup}-${index}`}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                className="game-log-row"
              >
                <td
                  className="sticky-col sticky-col-left"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--muted)',
                    padding: '0.65rem 0.875rem',
                    whiteSpace: 'nowrap',
                    background: 'var(--bg)',
                  }}
                >
                  {row.gameDate}
                </td>

                <td
                  className="sticky-col sticky-col-mid"
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: 'var(--text)',
                    padding: '0.65rem 0.875rem',
                    whiteSpace: 'nowrap',
                    background: 'var(--bg)',
                  }}
                >
                  {row.matchup}
                </td>

                <td style={{ padding: '0.65rem 0.875rem', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-condensed)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: row.result === 'W' ? 'var(--teal)' : 'var(--danger)',
                      background: row.result === 'W' ? 'var(--teal-bg)' : 'var(--danger-bg)',
                      border: `1px solid ${row.result === 'W' ? 'var(--teal-border)' : 'rgba(212,92,92,0.2)'}`,
                      padding: '2px 8px',
                    }}
                  >
                    {row.result}
                  </span>
                </td>

                <td
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-2)',
                    padding: '0.65rem 0.875rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.minutes}
                </td>

                {/* PTS - highlighted */}
                <td style={{ padding: '0.65rem 0.875rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      letterSpacing: '0.04em',
                      color: 'var(--gold)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {row.points}
                  </span>
                </td>

                {[row.rebounds, row.assists, row.steals, row.blocks, row.turnovers].map((val, i) => (
                  <td
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-2)',
                      padding: '0.65rem 0.875rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {val}
                  </td>
                ))}

                {[row.fgPct, row.threePct, row.ftPct].map((val, i) => (
                  <td
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-2)',
                      padding: '0.65rem 0.875rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {val.toFixed(1)}
                  </td>
                ))}

                <td
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: row.plusMinus > 0 ? 'var(--teal)' : row.plusMinus < 0 ? 'var(--danger)' : 'var(--muted)',
                    padding: '0.65rem 0.875rem',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                  }}
                >
                  {row.plusMinus > 0 ? '+' : ''}{row.plusMinus.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <style>{`
          .game-log-row:hover td { background: var(--s1) !important; }
          .game-log-row:last-child { border-bottom: none !important; }
        `}</style>
      </div>
    </section>
  );
}