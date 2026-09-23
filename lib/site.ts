import type { Metadata } from 'next';

// Canonical origin for absolute URLs: sitemap, canonical links, OG images.
// Set NEXT_PUBLIC_SITE_URL when the site moves to a custom domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://biq-mind.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'BIQ';

export const SITE_DESCRIPTION =
  'BIQ, the Basketball Intelligence Quotient: one number for what an NBA player is worth, with the work shown.';

/**
 * Title, description, canonical and Open Graph for one page. Next copies a
 * parent's openGraph wholesale when a page doesn't set its own, so every page
 * sets it here rather than inheriting the homepage's title and URL. The same
 * goes for images: a route with its own opengraph-image must pass it as
 * `image`, or this default replaces it.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = '/opengraph-image',
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      url: path,
      images: [image],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
