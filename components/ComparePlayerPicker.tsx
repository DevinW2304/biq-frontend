'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SearchPlayerResult } from '@/lib/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type PickerSlot = 'a' | 'b';

type SelectedPlayer = {
  id: string;
  label: string;
};

export function ComparePlayerPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialA = searchParams.get('a') ?? '';
  const initialB = searchParams.get('b') ?? '';

  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [selectedA, setSelectedA] = useState<SelectedPlayer | null>(null);
  const [selectedB, setSelectedB] = useState<SelectedPlayer | null>(null);
  const [resultsA, setResultsA] = useState<SearchPlayerResult[]>([]);
  const [resultsB, setResultsB] = useState<SearchPlayerResult[]>([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  useEffect(() => {
    if (initialA) {
      setSelectedA((prev) => prev ?? { id: initialA, label: `Player ${initialA}` });
    }
    if (initialB) {
      setSelectedB((prev) => prev ?? { id: initialB, label: `Player ${initialB}` });
    }
  }, [initialA, initialB]);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      if (!queryA.trim()) {
        setResultsA([]);
        return;
      }

      try {
        setLoadingA(true);
        const res = await fetch(
          `${API_BASE_URL.replace(/\/$/, '')}/api/players/search?q=${encodeURIComponent(queryA)}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data: SearchPlayerResult[] = await res.json();
        setResultsA(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Compare search A failed', error);
          setResultsA([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingA(false);
        }
      }
    }

    const timeout = setTimeout(run, 250);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [queryA]);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      if (!queryB.trim()) {
        setResultsB([]);
        return;
      }

      try {
        setLoadingB(true);
        const res = await fetch(
          `${API_BASE_URL.replace(/\/$/, '')}/api/players/search?q=${encodeURIComponent(queryB)}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data: SearchPlayerResult[] = await res.json();
        setResultsB(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Compare search B failed', error);
          setResultsB([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingB(false);
        }
      }
    }

    const timeout = setTimeout(run, 250);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [queryB]);

  const canCompare = useMemo(() => {
    return !!selectedA?.id && !!selectedB?.id && selectedA.id !== selectedB.id;
  }, [selectedA, selectedB]);

  function choosePlayer(slot: PickerSlot, player: SearchPlayerResult) {
    const label = `${player.name} · ${player.team} · ${player.position}`;

    if (slot === 'a') {
      setSelectedA({ id: String(player.id), label });
      setQueryA(player.name);
      setResultsA([]);
      return;
    }

    setSelectedB({ id: String(player.id), label });
    setQueryB(player.name);
    setResultsB([]);
  }

  function clearPlayer(slot: PickerSlot) {
    if (slot === 'a') {
      setSelectedA(null);
      setQueryA('');
      setResultsA([]);
      return;
    }

    setSelectedB(null);
    setQueryB('');
    setResultsB([]);
  }

  function submitCompare() {
    if (!canCompare || !selectedA || !selectedB) return;
    router.push(`/compare?a=${selectedA.id}&b=${selectedB.id}`);
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        borderBottom: '1px solid var(--border)',
        paddingBottom: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 18%, rgba(201,168,76,0.12), transparent 28%), radial-gradient(circle at 82% 20%, rgba(97,214,204,0.08), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.01), transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div className="hero-two-col relative z-10">
        <div className="hero-copy">
          <p className="eyebrow mb-4">Player Comparison</p>

          <h1
            className="display hero-title-glow"
            style={{
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              color: 'var(--text)',
              maxWidth: '11ch',
              lineHeight: 0.94,
              marginBottom: '1.25rem',
            }}
          >
            BUILD A
            <br />
            BETTER
            <br />
            MATCHUP.
          </h1>

          <p
            className="serif-italic"
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--muted)',
              maxWidth: '460px',
              marginBottom: '1.75rem',
            }}
          >
            Choose any two active NBA players and compare BIQ utility, recent form,
            trend shape, and headline statistical profile in one editorial view.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitCompare}
              disabled={!canCompare}
              className="btn btn-primary btn-animated disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compare Selected Players
            </button>

            <button
              type="button"
              onClick={() => router.push('/compare?a=2544&b=201939')}
              className="btn btn-ghost btn-animated"
            >
              Load LeBron vs Curry
            </button>
          </div>
        </div>

        <div className="card animated-surface p-5 md:p-6">
          <div className="section-head" style={{ marginBottom: '1rem' }}>
            <span className="section-title">Select Your Matchup</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Player A
              </div>

              <input
                value={queryA}
                onChange={(e) => setQueryA(e.target.value)}
                placeholder="Search Player A"
                className="w-full rounded-none border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition"
                style={{ color: 'var(--text)' }}
              />

              {selectedA && (
                <div className="card-ruled p-3 flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>
                    {selectedA.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearPlayer('a')}
                    className="section-link"
                  >
                    Clear
                  </button>
                </div>
              )}

              {!selectedA && (loadingA || resultsA.length > 0) && (
                <div className="card-ruled" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {loadingA ? (
                    <div className="p-3 text-sm text-muted">Searching…</div>
                  ) : (
                    resultsA.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => choosePlayer('a', player)}
                        className="w-full border-b border-[var(--border)] px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <div className="leader-name" style={{ fontSize: '1rem', marginBottom: 4 }}>
                          {player.name}
                        </div>
                        <div className="leader-meta">
                          {player.team} · {player.position}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Player B
              </div>

              <input
                value={queryB}
                onChange={(e) => setQueryB(e.target.value)}
                placeholder="Search Player B"
                className="w-full rounded-none border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition"
                style={{ color: 'var(--text)' }}
              />

              {selectedB && (
                <div className="card-ruled p-3 flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>
                    {selectedB.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearPlayer('b')}
                    className="section-link"
                  >
                    Clear
                  </button>
                </div>
              )}

              {!selectedB && (loadingB || resultsB.length > 0) && (
                <div className="card-ruled" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {loadingB ? (
                    <div className="p-3 text-sm text-muted">Searching…</div>
                  ) : (
                    resultsB.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => choosePlayer('b', player)}
                        className="w-full border-b border-[var(--border)] px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <div className="leader-name" style={{ fontSize: '1rem', marginBottom: 4 }}>
                          {player.name}
                        </div>
                        <div className="leader-meta">
                          {player.team} · {player.position}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedA && selectedB && selectedA.id === selectedB.id && (
            <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
              Choose two different players to build the comparison.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}