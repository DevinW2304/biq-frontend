'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type PlayerSearchBarProps = {
  placeholder?: string;
  initialValue?: string;
};

export function PlayerSearchBar({
  placeholder = 'Search players or teams',
  initialValue = '',
}: PlayerSearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    router.push(`/players?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-accent"
      />
      <button
        type="submit"
        className="rounded-2xl bg-accent px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}