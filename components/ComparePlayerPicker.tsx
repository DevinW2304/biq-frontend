'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SearchPlayerResult } from '@/lib/types';
import { joinMeta, knownPosition } from '@/lib/format';
import { PlayerTypeahead } from '@/components/PlayerTypeahead';

type PickerSlot = 'a' | 'b';

type SelectedPlayer = {
  id: string;
  label: string;
};

function slotFromUrl(id: string, known: Record<string, string>): SelectedPlayer | null {
  if (!id) return null;
  // Unknown only when the comparison itself failed to load.
  return { id, label: known[id] ?? `Player ${id}` };
}

export function ComparePlayerPicker({
  season,
  known = {},
}: {
  season: string | null;
  /** id -> display label for players the server already resolved, so a
   *  comparison opened from a link shows names rather than raw ids. */
  known?: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialA = searchParams.get('a') ?? '';
  const initialB = searchParams.get('b') ?? '';

  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [selectedA, setSelectedA] = useState<SelectedPlayer | null>(null);
  const [selectedB, setSelectedB] = useState<SelectedPlayer | null>(null);

  // The URL is the source of truth: a quick-matchup link or back/forward
  // replaces both slots, and a slot only keeps its label when its id is
  // unchanged (a picked player's label carries team and position).
  const knownA = known[initialA];
  const knownB = known[initialB];
  useEffect(() => {
    setSelectedA((prev) =>
      prev?.id === initialA && !knownA ? prev : slotFromUrl(initialA, known),
    );
    setSelectedB((prev) =>
      prev?.id === initialB && !knownB ? prev : slotFromUrl(initialB, known),
    );
    // `known` is rebuilt every render; its entries for these ids are the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialA, initialB, knownA, knownB]);

  const canCompare = useMemo(() => {
    return !!selectedA?.id && !!selectedB?.id && selectedA.id !== selectedB.id;
  }, [selectedA, selectedB]);

  function choosePlayer(slot: PickerSlot, player: SearchPlayerResult) {
    const label = joinMeta(player.name, player.team, knownPosition(player.position));

    if (slot === 'a') {
      setSelectedA({ id: String(player.id), label });
      setQueryA(player.name);
      return;
    }

    setSelectedB({ id: String(player.id), label });
    setQueryB(player.name);
  }

  function clearPlayer(slot: PickerSlot) {
    if (slot === 'a') {
      setSelectedA(null);
      setQueryA('');
      return;
    }

    setSelectedB(null);
    setQueryB('');
  }

  function submitCompare() {
    if (!canCompare || !selectedA || !selectedB) return;
    router.push(`/compare?a=${selectedA.id}&b=${selectedB.id}`);
  }

  return (
    <section style={{ padding: '56px 0 0', borderBottom: '1px solid var(--line)' }}>
      <p className="biq-mono">Player comparison{season ? ` · ${season}` : ''}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
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
                setSelected: setSelectedA,
              },
              {
                slot: 'b' as const,
                label: 'PLAYER B',
                placeholder: 'Search Player B',
                query: queryB,
                setQuery: setQueryB,
                selected: selectedB,
                setSelected: setSelectedB,
              },
            ]).map((side) => (
              <div key={side.slot}>
                <p className="biq-mono" style={{ marginBottom: 10 }}>{side.label}</p>

                <PlayerTypeahead
                  value={side.query}
                  onValueChange={(value) => {
                    side.setQuery(value);
                    // Typing again means picking someone else; the old pick
                    // no longer matches the box.
                    if (side.selected) side.setSelected(null);
                  }}
                  onPick={(player) => choosePlayer(side.slot, player)}
                  label={side.slot === 'a' ? 'Player A' : 'Player B'}
                  placeholder={side.placeholder}
                  inputClassName="biq-picker-input"
                  pickFirstOnEnter
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