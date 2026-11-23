'use client';

// The header's search, on every page: suggests teams and players as you type,
// like the main search bar. Picking one opens its page; Enter with nothing
// highlighted lists every player match on /players. The box empties after
// any of these, since the header stays on screen across pages.
//
// Without JavaScript it's still a plain GET form to /players?q=.

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerTypeahead } from '@/components/PlayerTypeahead';

function resultsHref(query: string) {
  return `/players?q=${encodeURIComponent(query)}`;
}

export function NavSearch({ className }: { className: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setQuery('');
    router.push(resultsHref(trimmed));
  }

  return (
    <form role="search" action="/players" method="get" onSubmit={handleSubmit} className={className}>
      <PlayerTypeahead
        value={query}
        onValueChange={setQuery}
        onPick={(player) => {
          setQuery('');
          router.push(`/players/${player.id}`);
        }}
        onPickTeam={(team) => {
          setQuery('');
          router.push(`/teams/${team.id}`);
        }}
        label="Search players and teams"
        placeholder="Players or teams"
        inputClassName="nav-search"
        name="q"
        allResultsHref={resultsHref}
        onAllResults={() => setQuery('')}
      />
    </form>
  );
}
