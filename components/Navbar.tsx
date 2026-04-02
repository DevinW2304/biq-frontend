import Link from 'next/link';

export function Navbar() {
  return (
    <header className="border-b border-white/10 bg-[#0f1115]">
      <div className="page-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-[-0.05em] text-zinc-100">
            BIQ
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d6b25e]">
            Basketball Intelligence
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/players?q=" className="transition-colors hover:text-zinc-100">
            Players
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-zinc-100">
            Leaderboard
          </Link>
          <Link href="/teams/1610612738" className="transition-colors hover:text-zinc-100">
            Teams
          </Link>
          <Link
            href="/compare?a=2544&b=201939"
            className="transition-colors hover:text-zinc-100"
          >
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}