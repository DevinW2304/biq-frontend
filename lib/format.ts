// Number and date formatting shared by the stat components.

/** 0.5123 -> "51.2%". */
export function formatPct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** 4.2 -> "+4.2", -3 -> "−3.0" (a real minus sign, so columns line up). */
export function formatSigned(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(digits)}`;
}

/** The CSS color for a signed value: up, down, or plain ink at zero. */
export function signedColor(value: number): string {
  return value > 0 ? 'var(--up)' : value < 0 ? 'var(--down)' : 'var(--ink)';
}

/** 1 -> "1st", 22 -> "22nd", 93 -> "93rd". */
export function ordinal(value: number): string {
  const n = Math.round(value);
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/**
 * "2026-11-09" -> "Nov 9". Parsed by hand: `new Date('2026-11-09')` is UTC
 * midnight, which renders as the day before in US time zones.
 */
export function formatShortDate(isoDate: string | null | undefined): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate ?? '');
  if (!match) return null;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[Number(match[2]) - 1];
  return month ? `${month} ${Number(match[3])}` : null;
}

/**
 * The API fills a missing position with a placeholder ("Active Player", "N/A",
 * "Player", or empty). None of those is a position, so treat them all as
 * unknown rather than printing them where a position belongs.
 */
const POSITION_PLACEHOLDERS = new Set(['', 'active player', 'n/a', 'player']);

export function knownPosition(position: string | null | undefined): string | null {
  const value = (position ?? '').trim();
  return POSITION_PLACEHOLDERS.has(value.toLowerCase()) ? null : value;
}

/** Joins the parts that exist with " · ", so a missing one leaves no gap. */
export function joinMeta(...parts: (string | null | undefined | false)[]): string {
  return parts.filter(Boolean).join(' · ');
}

/** Stat labels compared loosely: "3PA rate" and "3PA Rate" are one stat. */
function statKey(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '');
}

/**
 * Returns a filter that keeps the first appearance of each stat label across
 * every list it is applied to, in call order. Call it on a page's sections
 * top to bottom so a stat shows once, where it first appears. `alreadyShown`
 * seeds labels the page prints elsewhere (the cover's BIQ verdict, say).
 */
export function firstShowing(alreadyShown: string[] = []) {
  const seen = new Set(alreadyShown.map(statKey));
  return <T extends { label: string }>(items: T[]): T[] =>
    items.filter((item) => {
      const key = statKey(item.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * The team line for a profile: the current team, or, for a player the roster
 * sync found on no NBA roster, his last team marked as such.
 */
export function teamLabel(player: { team: string; onRoster?: boolean }): string {
  return player.onRoster === false ? `Not on a roster (last: ${player.team})` : player.team;
}

/**
 * Whether a profile's BIQ score is a real grade. The API marks ungraded
 * players rated: false; older responses didn't, but a player with no games
 * can't have been graded either way.
 */
export function isRated(player: { rated?: boolean; gamesPlayed?: number }): boolean {
  return player.rated !== false && player.gamesPlayed !== 0;
}
