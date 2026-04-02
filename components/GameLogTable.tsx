import { GameLogRow } from '@/lib/types';

type GameLogTableProps = {
  rows: GameLogRow[];
};

export function GameLogTable({ rows }: GameLogTableProps) {
  return (
    <section className="card p-6">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d6b25e]">
          Recent Games
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-zinc-100">
          Game log
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Recent game-by-game production for context and trend validation.
        </p>
      </div>

      <div className="table-shell game-log-table-shell overflow-x-auto">
        <table className="game-log-table min-w-full text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03]">
            <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              <th className="px-4 py-3 sticky-col sticky-col-left">Date</th>
              <th className="px-4 py-3 sticky-col sticky-col-mid">Matchup</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">MIN</th>
              <th className="px-4 py-3">PTS</th>
              <th className="px-4 py-3">REB</th>
              <th className="px-4 py-3">AST</th>
              <th className="px-4 py-3">STL</th>
              <th className="px-4 py-3">BLK</th>
              <th className="px-4 py-3">TOV</th>
              <th className="px-4 py-3">FG%</th>
              <th className="px-4 py-3">3PT%</th>
              <th className="px-4 py-3">FT%</th>
              <th className="px-4 py-3">+/-</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.gameDate}-${row.matchup}-${index}`}
                className="border-b border-white/5 text-zinc-300"
              >
                <td className="px-4 py-3 text-zinc-400 sticky-col sticky-col-left">{row.gameDate}</td>
                <td className="px-4 py-3 font-medium text-zinc-100 sticky-col sticky-col-mid">{row.matchup}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.result === 'W'
                        ? 'font-semibold text-[#7fb685]'
                        : 'font-semibold text-[#c96b5c]'
                    }
                  >
                    {row.result}
                  </span>
                </td>
                <td className="px-4 py-3">{row.minutes}</td>
                <td className="px-4 py-3 font-semibold text-zinc-100">{row.points}</td>
                <td className="px-4 py-3">{row.rebounds}</td>
                <td className="px-4 py-3">{row.assists}</td>
                <td className="px-4 py-3">{row.steals}</td>
                <td className="px-4 py-3">{row.blocks}</td>
                <td className="px-4 py-3">{row.turnovers}</td>
                <td className="px-4 py-3">{row.fgPct.toFixed(1)}</td>
                <td className="px-4 py-3">{row.threePct.toFixed(1)}</td>
                <td className="px-4 py-3">{row.ftPct.toFixed(1)}</td>
                <td className="px-4 py-3">{row.plusMinus.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
