import './globals.css';
import './styles/biq-theme.css';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/biq/SiteFooter';
import type { Metadata, Viewport } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const splineMono = Spline_Sans_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-file',
  display: 'swap',
});

// Tints the browser's own chrome (mobile address bar) to the page.
export const viewport: Viewport = { themeColor: '#131210' };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BIQ // Basketball Intelligence',
    template: '%s · BIQ',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'BIQ // Basketball Intelligence',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${instrument.variable} ${splineMono.variable} biq-page`}>
        <Navbar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
