'use client';

// Search-as-you-type for players (and, where it can open a team page, teams):
// the input, the dropdown, and the keyboard. Used by the main search bar, the
// header search and the compare pickers, so they all behave alike.
//
// It follows the ARIA combobox pattern: arrow keys move through the results,
// Enter picks the highlighted one, Escape closes the list, and a live region
// tells screen readers how many matched.

import Link from 'next/link';
import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import type { SearchPlayerResult, TeamSearchResult } from '@/lib/types';
import { joinMeta, knownPosition } from '@/lib/format';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { moveHighlight } from '@/lib/typeahead';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

/** Teams shown above the players, at most. */
const TEAM_LIMIT = 2;

type SearchState = {
  status: 'idle' | 'loading' | 'done' | 'error';
  players: SearchPlayerResult[];
  teams: TeamSearchResult[];
  /** The query these results answer, so a stale reply is never shown as current. */
  forQuery: string;
};

const IDLE: SearchState = { status: 'idle', players: [], teams: [], forQuery: '' };

async function getJSON<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

/** Debounced search against /api/players/search, and /api/teams/search when
 *  `withTeams` is set. Teams are extra: if only they fail, players still show. */
export function usePlayerSearch(query: string, withTeams = false, delay = 200): SearchState {
  const [state, setState] = useState<SearchState>(IDLE);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setState(IDLE);
      return;
    }
    // Keep the last results on screen while the next ones load, so the list
    // doesn't blink empty on every keystroke.
    setState((prev) => ({ ...prev, status: 'loading' }));
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const encoded = encodeURIComponent(q);
      // One letter matches a third of the league's teams; wait for two.
      const teamsRequest: Promise<TeamSearchResult[]> =
        withTeams && q.length >= 2
          ? getJSON<TeamSearchResult[]>(`/api/teams/search?q=${encoded}`, controller.signal).catch((error) => {
              if (!controller.signal.aborted) console.error('Team search failed', error);
              return [];
            })
          : Promise.resolve([]);
      try {
        const [players, teams] = await Promise.all([
          getJSON<SearchPlayerResult[]>(`/api/players/search?q=${encoded}`, controller.signal),
          teamsRequest,
        ]);
        setState({ status: 'done', players, teams, forQuery: q });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Player search failed', error);
        setState({ status: 'error', players: [], teams: [], forQuery: q });
      }
    }, delay);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, withTeams, delay]);

  return state;
}

type Suggestion =
  | { kind: 'team'; key: string; team: TeamSearchResult }
  | { kind: 'player'; key: string; player: SearchPlayerResult };

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function PlayerTypeahead({
  value,
  onValueChange,
  onPick,
  onPickTeam,
  label,
  placeholder,
  inputClassName,
  limit = 8,
  pickFirstOnEnter = false,
  allResultsHref,
  onAllResults,
  name,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onPick: (player: SearchPlayerResult) => void;
  /** Also suggest teams (above the players), and open one with this. */
  onPickTeam?: (team: TeamSearchResult) => void;
  /** Accessible name for the input (it has no visible <label>). */
  label: string;
  placeholder: string;
  inputClassName: string;
  limit?: number;
  /** Enter with nothing highlighted picks the top result. Off where Enter
   *  should submit the surrounding form instead (the main search). */
  pickFirstOnEnter?: boolean;
  /** Adds a "See all results" link under the list. */
  allResultsHref?: (query: string) => string;
  /** Called when that link is followed. */
  onAllResults?: () => void;
  /** Form field name, so the surrounding form still submits without JavaScript. */
  name?: string;
}) {
  const withTeams = Boolean(onPickTeam);
  const search = usePlayerSearch(value, withTeams);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  const q = value.trim();
  const items: Suggestion[] = [
    ...search.teams.slice(0, TEAM_LIMIT).map((team) => ({ kind: 'team' as const, key: `t${team.id}`, team })),
    ...search.players.slice(0, limit).map((player) => ({ kind: 'player' as const, key: `p${player.id}`, player })),
  ];
  const current = search.forQuery === q;
  const showList = open && q.length > 0;

  // A new set of results starts with nothing highlighted.
  useEffect(() => setActive(-1), [search.forQuery]);

  // The list scrolls; keep the highlighted row in view as the arrows move it.
  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);

  function pick(item: Suggestion) {
    setOpen(false);
    setActive(-1);
    if (item.kind === 'team') onPickTeam?.(item.team);
    else onPick(item.player);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!items.length) return;
      const key = event.key;
      setActive((i) => moveHighlight(i, key, items.length));
    } else if (event.key === 'Enter') {
      if (showList && active >= 0 && items[active]) {
        event.preventDefault();
        pick(items[active]);
      } else if (pickFirstOnEnter && current && items.length) {
        event.preventDefault();
        pick(items[0]);
      }
      // Otherwise Enter falls through to the surrounding form, if any.
    } else if (event.key === 'Escape' && showList) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  let status: string | null = null;
  if (search.status === 'error') status = "Search isn't responding right now. Try again in a moment.";
  else if (search.status === 'loading' && !items.length) status = 'Searching…';
  else if (search.status === 'done' && current && !items.length) {
    status = withTeams ? `No players or teams match “${q}”.` : `No active players match “${q}”.`;
  }

  const shownTeams = Math.min(search.teams.length, TEAM_LIMIT);
  const found = [
    shownTeams ? plural(shownTeams, 'team') : '',
    search.players.length ? plural(search.players.length, 'player') : '',
  ].filter(Boolean);
  const announcement =
    search.status === 'done' && current ? (found.length ? `${found.join(' and ')} found` : 'Nothing found') : '';

  return (
    <div className="biq-typeahead-field">
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={showList && items.length > 0}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        name={name}
        value={value}
        placeholder={placeholder}
        className={inputClassName}
        onChange={(event) => {
          onValueChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Clicking a box that still has focus (after Escape) reopens the list.
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />

      {showList && (items.length > 0 || status) ? (
        <div className="biq-typeahead">
          {items.length ? (
            <div id={listId} role="listbox" aria-label={`${label} results`}>
              {items.map((item, index) => (
                <div
                  key={item.key}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={`biq-typeahead-option${index === active ? ' is-active' : ''}`}
                  // Keep focus in the input so the list survives the click.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(item)}
                >
                  {item.kind === 'team' ? (
                    <>
                      <span className="biq-typeahead-badge biq-num" aria-hidden="true">
                        {item.team.abbreviation}
                      </span>
                      <span className="biq-typeahead-text">
                        <span className="biq-typeahead-name">{item.team.name}</span>
                        <span className="biq-typeahead-meta">
                          {joinMeta('Team', item.team.conference, item.team.division)}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="biq-typeahead-photo" aria-hidden="true">
                        <SubjectPhoto id={item.player.id} name={item.player.name} size={32} />
                      </span>
                      <span className="biq-typeahead-text">
                        <span className="biq-typeahead-name">{item.player.name}</span>
                        <span className="biq-typeahead-meta">
                          {joinMeta(item.player.team, knownPosition(item.player.position))}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : null}
          {status ? <p className="biq-typeahead-status">{status}</p> : null}
          {allResultsHref && search.players.length && current ? (
            <Link
              href={allResultsHref(q)}
              className="biq-typeahead-all"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setOpen(false);
                onAllResults?.();
              }}
            >
              See all player results for “{q}”
            </Link>
          ) : null}
        </div>
      ) : null}

      <span className="biq-sr-only" role="status" aria-live="polite">
        {open ? announcement : ''}
      </span>
    </div>
  );
}
