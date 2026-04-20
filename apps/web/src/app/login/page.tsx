'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = mode === 'login'
        ? await auth.login(email, password)
        : await auth.register(email, password);

      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-16">
      <div className="noise-overlay" />

      <div className="relative mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-2">
        <section className="glass-panel animate-float hidden rounded-3xl p-10 lg:block">
          <p className="mono text-xs uppercase tracking-[0.22em] text-slate-500">SaaS DevOps Platform</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-900">
            Organise tes taches avec une interface nette et rapide.
          </h1>
          <p className="mt-4 max-w-md text-slate-600">
            Login securise, dashboard fluide et workflow optimisé pour avancer vite.
          </p>

          <div className="mt-10 space-y-3">
            {['JWT auth', 'NestJS API', 'Prisma + PostgreSQL'].map((item, index) => (
              <div
                key={item}
                className="animate-fade-up flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3"
                style={{ animationDelay: `${index * 0.09}s` }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel animate-fade-up rounded-3xl p-6 sm:p-10">
          <div className="flex items-center justify-between">
            <p className="mono text-xs uppercase tracking-[0.2em] text-slate-500">Workspace access</p>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {mode === 'login' ? 'Sign in' : 'Register'}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-semibold text-slate-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">Continue vers ton espace de gestion des taches.</p>

          {error && (
            <div className="animate-fade-up-delay-1 mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="animate-fade-up-delay-1 mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="animate-fade-up-delay-2 mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? "No account yet? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-teal-700 transition hover:text-teal-800"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
