'use client';

import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-700/40">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-400">
            © {year} <span className="text-slate-200 font-semibold">Change by One</span>. All rights reserved.
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link className="text-slate-300 hover:text-white transition-colors" href="/privacy">
              Privacy
            </Link>
            <Link className="text-slate-300 hover:text-white transition-colors" href="/terms">
              Terms
            </Link>
            <Link className="text-slate-300 hover:text-white transition-colors" href="/cookies">
              Cookies & Storage
            </Link>
            <a
              className="text-slate-300 hover:text-white transition-colors"
              href="mailto:support@changebyone.com"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-6 text-xs text-slate-500 leading-relaxed">
          We use device storage (like localStorage) to remember your theme and in-progress game state. If you opt into
          analytics in the future, you may see a consent prompt.
        </div>
      </div>
    </footer>
  );
}


