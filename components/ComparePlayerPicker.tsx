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
    <section style={{ padding: '56px 0 0', borderBottom: '1px solid var(--line)' }}>
      <p className="biq-mono">Player comparison · 2025-26</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 48,
          padding: '20px 0 48px',
        }}
      >
        <div>
          <h1 className="biq-display biq-hero-size" style={{ maxWidth: '12ch' }}>
            Build a better matchup.
          </h1>

          <p style={{ marginTop: 20, maxWidth: '52ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
            Choose any two active NBA players and compare BIQ utility, recent form,
            trend shape, and headline statistical profile in one view.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28, alignItems: 'center' }}>
            <button
              type="button"
              onClick={submitCompare}
              disabled={!canCompare}
              className="biq-btn"
              style={{
                cursor: canCompare ? 'pointer' : 'not-allowed',
                opacity: canCompare ? 1 : 0.4,
              }}
            >
              Compare selected players
            </button>

            <button
              type="button"
              onClick={() => router.push('/compare?a=2544&b=201939')}
              className="biq-link"
              style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 14 }}
            >
              Load LeBron vs Curry
            </button>
          </div>
        </div>

        <div className="biq-card" style={{ padding: 24, alignSelf: 'start' }}>
          <p className="biq-mono" style={{ marginBottom: 20 }}>Select your matchup</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
            }}
          >
            {([
              {
                slot: 'a' as const,
                label: 'PLAYER A',
                placeholder: 'Search Player A',
                query: queryA,
                setQuery: setQueryA,
                selected: selectedA,
                results: resultsA,
                loading: loadingA,
              },
              {
                slot: 'b' as const,
                label: 'PLAYER B',
                placeholder: 'Search Player B',
                query: queryB,
                setQuery: setQueryB,
                selected: selectedB,
                results: resultsB,
                loading: loadingB,
              },
            ]).map((side) => (
              <div key={side.slot}>
                <p className="biq-mono" style={{ marginBottom: 10 }}>{side.label}</p>

                <input
                  value={side.query}
                  onChange={(e) => side.setQuery(e.target.value)}
                  placeholder={side.placeholder}
                  style={{
                    width: '100%',
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    padding: '11px 14px',
                    fontSize: 14,
                    color: 'var(--ink)',
                    outline: 'none',
                  }}
                />

                {side.selected && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: 'var(--key-tint)',
                      borderRadius: 'var(--radius)',
                      padding: '10px 14px',
                      marginTop: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--key-deep)' }}>
                      {side.selected.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => clearPlayer(side.slot)}
                      className="biq-link"
                      style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 12 }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                {!side.selected && (side.loading || side.results.length > 0) && (
                  <div
                    data-native-scroll
                    style={{
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius)',
                      marginTop: 8,
                      maxHeight: 260,
                      overflowY: 'auto',
                    }}
                  >
                    {side.loading ? (
                      <p style={{ padding: '12px 14px', fontSize: 13, color: 'var(--fog)' }}>Searching…</p>
                    ) : (
                      side.results.map((player) => (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => choosePlayer(side.slot, player)}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            background: 'transparent',
                            border: 0,
                            borderBottom: '1px solid var(--line)',
                            padding: '10px 14px',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ display: 'block', fontSize: 14, color: 'var(--ink)' }}>
                            {player.name}
                          </span>
                          <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: 'var(--fog)' }}>
                            {player.team} · {player.position}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedA && selectedB && selectedA.id === selectedB.id && (
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--down)' }}>
              Choose two different players to build the comparison.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}