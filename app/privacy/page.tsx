import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy • Change by One',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-12 px-4 animate-fade-in-up">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="glass rounded-3xl p-8">
          <h1 className="text-4xl font-black text-gradient mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6 text-slate-300 leading-relaxed">
          <p>
            This policy explains what information <strong className="text-white">Change by One</strong> collects, how we
            use it, and the choices you have.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Gameplay data</strong>: puzzle date, word length, solution path, number of
                moves, and timing information (when available).
              </li>
              <li>
                <strong className="text-white">Anonymous usage</strong>: we do not require accounts. We don’t ask for your
                name, email, or profile.
              </li>
              <li>
                <strong className="text-white">Device storage</strong>: we store preferences (like theme) and in-progress
                game state in your browser using local storage.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">How we use data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Run the game (save progress, validate puzzles, show timers).</li>
              <li>
                Display leaderboards and stats:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong className="text-white">My Stats</strong> are stored locally on your device (not synced).
                  </li>
                  <li>
                    <strong className="text-white">Global</strong> leaderboards are stored on our servers and are
                    anonymous.
                  </li>
                </ul>
              </li>
              <li>Improve reliability and prevent abuse (basic operational monitoring).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Where data is stored</h2>
            <p>
              Gameplay results and leaderboard records are stored in our database (Neon/PostgreSQL). Some preferences and
              in-progress state are stored locally on your device (localStorage).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Sharing</h2>
            <p>
              We do not sell your personal information. Leaderboard data is anonymous. We may share data with service
              providers that help us operate the app (for example, database hosting).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Your choices</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You can clear your browser storage to remove locally stored preferences and progress.</li>
              <li>
                If you want your stored solutions removed, contact us at{' '}
                <a className="underline text-slate-200" href="mailto:support@changebyone.com">
                  support@changebyone.com
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Contact</h2>
            <p>
              Questions? Email{' '}
              <a className="underline text-slate-200" href="mailto:support@changebyone.com">
                support@changebyone.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}


