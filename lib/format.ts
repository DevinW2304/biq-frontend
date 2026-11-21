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
