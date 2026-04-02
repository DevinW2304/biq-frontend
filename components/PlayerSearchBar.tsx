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
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/players?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'stretch',
        marginTop: '1.5rem',
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Search icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            left: '0.875rem',
            color: focused ? 'var(--gold)' : 'var(--muted)',
            transition: 'color 0.15s ease',
            pointerEvents: 'none',
            flexShrink: 0,
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: 'var(--s2)',
            border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--r-md)',
            padding: '0.7rem 1rem 0.7rem 2.5rem',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.08)' : 'none',
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          background: 'var(--gold)',
          color: '#060709',
          fontFamily: 'var(--font-condensed)',
          fontWeight: 800,
          fontSize: '0.72rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          border: 'none',
          borderRadius: 'var(--r-md)',
          padding: '0 1.25rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(201,168,76,0.25)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        Search
      </button>
    </form>
  );
}