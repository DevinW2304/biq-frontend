'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SearchPlayerResult } from '@/lib/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type PickerSlot = 'a' | 'b';

export function ComparePlayerPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialA = searchParams.get('a') ?? '';
  const initialB = searchParams.get('b') ?? '';

  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [selectedA, setSelectedA] = useState<{ id: string; label: string } | null>(null);
  const [selectedB, setSelectedB] = useState<{ id: string; label: string } | null>(null);
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
    <section className="card p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">Compare Players</p>
      <h1 className="mt-2 text-4xl font-bold">Choose two players</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Search for any active NBA players, select both sides, then load the head-to-head BIQ comparison.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-semibold">Player A</label>
          <input
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            placeholder="Search Player A"
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 outline-none focus:border-accent"
          />

          {selectedA && (
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-sm">{selectedA.label}</span>
              <button
                type="button"
                onClick={() => clearPlayer('a')}
                className="text-xs uppercase tracking-[0.15em] text-muted hover:text-accent"
              >
                Clear
              </button>
            </div>
          )}

          {!selectedA && (loadingA || resultsA.length > 0) && (
            <div className="rounded-xl border border-border">
              {loadingA ? (
                <div className="px-4 py-3 text-sm text-muted">Searching…</div>
              ) : (
                resultsA.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => choosePlayer('a', player)}
                    className="block w-full border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-white/5"
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted">
                      {player.team} · {player.position}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold">Player B</label>
          <input
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            placeholder="Search Player B"
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 outline-none focus:border-accent"
          />

          {selectedB && (
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-sm">{selectedB.label}</span>
              <button
                type="button"
                onClick={() => clearPlayer('b')}
                className="text-xs uppercase tracking-[0.15em] text-muted hover:text-accent"
              >
                Clear
              </button>
            </div>
          )}

          {!selectedB && (loadingB || resultsB.length > 0) && (
            <div className="rounded-xl border border-border">
              {loadingB ? (
                <div className="px-4 py-3 text-sm text-muted">Searching…</div>
              ) : (
                resultsB.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => choosePlayer('b', player)}
                    className="block w-full border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-white/5"
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted">
                      {player.team} · {player.position}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submitCompare}
          disabled={!canCompare}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Compare Selected Players
        </button>

        <button
          type="button"
          onClick={() => router.push('/compare?a=2544&b=201939')}
          className="btn btn-ghost"
        >
          Load LeBron vs Curry
        </button>
      </div>
    </section>
  );
}