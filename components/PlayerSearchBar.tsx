'use client';

// The main player search (homepage, player index, 404). Suggests teams and
// players as you type; picking one opens its page, while Search (or Enter
// with nothing highlighted) still lists every player match on /players.

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerTypeahead } from '@/components/PlayerTypeahead';

type PlayerSearchBarProps = {
  placeholder?: string;
  initialValue?: string;
};

function resultsHref(query: string) {
  return `/players?q=${encodeURIComponent(query)}`;
}

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
    router.push(resultsHref(trimmed));
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'stretch',
        marginTop: '1.5rem',
      }}
    >
      <div className="biq-search-field">
        <svg
          className="biq-search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <PlayerTypeahead
          value={query}
          onValueChange={setQuery}
          onPick={(player) => router.push(`/players/${player.id}`)}
          onPickTeam={(team) => router.push(`/teams/${team.id}`)}
          label="Search players and teams"
          placeholder={placeholder}
          inputClassName="biq-search-input"
          allResultsHref={resultsHref}
        />
      </div>

      <button type="submit" className="biq-btn" style={{ padding: '0 1.4rem' }}>
        Search
      </button>
    </form>
  );
}
