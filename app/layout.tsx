import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Concorporo — Acrylic Paint Mixing Calculator',
  description:
    'Select the acrylic paints you own across multiple brands and find the best mix to match any target colour.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#1a1a1a] text-zinc-100 font-[family-name:var(--font-geist-sans)]">
        {/* ── Nav ── */}
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#1a1a1a]/90 backdrop-blur-sm">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-lg text-white hover:text-indigo-300 transition-colors"
            >
              {/* Palette icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="8.5" cy="9" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="9" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="7" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="17" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
                <path d="M12 22c2.5 0 4-1 4-2.5S14.5 17 12 17" strokeLinecap="round" />
              </svg>
              Concorporo
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/colors"
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Colours
              </Link>
              <Link
                href="/about"
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                About
              </Link>
            </div>
          </nav>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1">{children}</main>

        {/* ── Footer ── */}
        <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
          Concorporo · Colours are approximate · Not affiliated with any paint brand
        </footer>
      </body>
    </html>
  );
}
