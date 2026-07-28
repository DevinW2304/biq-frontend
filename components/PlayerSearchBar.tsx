'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type PlayerSearchBarProps = {
  placeholder?: string;
  initialValue?: string;
};

export function PlayerSearchBar({
  placeholder = 'Search active NBA players',
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
            color: focused ? 'var(--key)' : 'var(--fog)',
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
            background: '#fff',
            border: `1px solid ${focused ? 'var(--key)' : 'var(--line)'}`,
            borderRadius: 'var(--radius)',
            padding: '0.7rem 1rem 0.7rem 2.5rem',
            color: 'var(--ink)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
        />
      </div>

      <button type="submit" className="biq-btn" style={{ padding: '0 1.4rem' }}>
        Search
      </button>
    </form>
  );
}
