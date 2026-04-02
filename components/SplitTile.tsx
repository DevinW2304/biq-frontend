type SplitTileProps = {
  label: string;
  value: string;
};

export function SplitTile({ label, value }: SplitTileProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-zinc-100">
        {value}
      </p>
    </div>
  );
}