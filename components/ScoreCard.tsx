type ScoreCardProps = {
  label: string;
  value: string;
  description: string;
};

export function ScoreCard({ label, value, description }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#171a20] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d6b25e]">
        {label}
      </p>
      <h3 className="mt-3 text-5xl font-bold tracking-[-0.04em] text-zinc-100">
        {value}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}