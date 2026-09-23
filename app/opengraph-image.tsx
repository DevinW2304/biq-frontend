import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og';

export const alt = 'BIQ, the Basketball Intelligence Quotient';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: 'Basketball Intelligence Quotient',
    title: 'One number for what a player is worth.',
    meta: 'NBA player value, with the work shown.',
  });
}
