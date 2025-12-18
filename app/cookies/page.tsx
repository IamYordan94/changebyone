import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies & Storage • Change by One',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen py-12 px-4 animate-fade-in-up">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="glass rounded-3xl p-8">
          <h1 className="text-4xl font-black text-gradient mb-2">Cookies & Storage</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6 text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Change by One</strong> uses limited on-device storage to make the game work
            smoothly.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">What we store on your device</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Theme preference</strong> (so your chosen colors persist).
              </li>
              <li>
                <strong className="text-white">In-progress daily game state</strong> (so a refresh doesn’t wipe your
                progress).
              </li>
              <li>
                <strong className="text-white">My Stats</strong> (your history view) is derived from this local game
                state and is <strong className="text-white">local-only</strong>.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Cookies</h2>
            <p>
              We currently do not rely on non-essential cookies for advertising. If we add analytics or marketing
              cookies in the future, we’ll provide a consent choice where required.
            </p>
            <p className="text-slate-400 text-sm">
              Note: even without cookies, we may use localStorage for essential functionality.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">How to clear it</h2>
            <p>
              You can remove on-device storage by clearing site data in your browser settings. This will reset your
              theme and in-progress game state.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}


