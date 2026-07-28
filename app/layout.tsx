import './globals.css';
import './styles/biq-theme.css';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/biq/SiteFooter';
import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'BIQ // Basketball Intelligence',
  description: 'BIQ turns NBA data into a sharper read on player value.',
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
