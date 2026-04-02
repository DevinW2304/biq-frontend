import { StatCardData } from '@/lib/types';

export function StatCard({ label, value, subtext, description }: StatCardData) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/15">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <h3 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-zinc-100">
        {value}
      </h3>

      {subtext ? (
        <p className="mt-2 text-sm font-medium text-zinc-300">{subtext}</p>
      ) : null}

      {description ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}