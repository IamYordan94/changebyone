import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service • Change by One',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen py-12 px-4 animate-fade-in-up">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="glass rounded-3xl p-8">
          <h1 className="text-4xl font-black text-gradient mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6 text-slate-300 leading-relaxed">
          <p>
            By using <strong className="text-white">Change by One</strong>, you agree to these Terms.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Use of the service</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the game for personal, non-commercial enjoyment unless we explicitly allow otherwise.</li>
              <li>Don’t attempt to disrupt, exploit, or reverse engineer the service.</li>
              <li>Don’t submit harmful, abusive, or unlawful content where user input is allowed.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Leaderboards and fair play</h2>
            <p>
              Leaderboards are meant to reflect fair play. We may remove entries or restrict access if we detect abuse,
              automation, or manipulation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Availability</h2>
            <p>
              The service is provided “as is” and may change, be suspended, or be discontinued at any time. We do our
              best to keep it reliable but can’t guarantee uninterrupted access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Intellectual property</h2>
            <p>
              The game, design, and code are owned by us and protected by applicable laws. You may not copy or reuse
              them except as permitted by these Terms.
            </p>
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


