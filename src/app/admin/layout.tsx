'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/features/exhibition/components/ui';
import { supabase } from '@/lib/supabase/admin-client';

type AuthState = 'loading' | 'signed-out' | 'forbidden' | 'admin';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const setSession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) =>
      setAuth(!session ? 'signed-out' : session.user.app_metadata.role === 'admin' ? 'admin' : 'forbidden');
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    } catch {
      setError('Could not reach Supabase. Check your internet connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (auth === 'loading') return <main className="grid min-h-screen place-items-center">Checking administrator access…</main>;
  if (auth === 'signed-out') return <main className="grid min-h-screen place-items-center p-4"><form onSubmit={signIn} className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-xl"><h1 className="font-display text-3xl font-bold">Admin sign in</h1><p className="mt-2 text-sm text-muted-foreground">Use your authorized Supabase administrator account.</p><label className="mt-6 block text-sm font-bold">Email<input className="mt-1 w-full rounded-xl border border-border bg-background p-3" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="mt-4 block text-sm font-bold">Password<input className="mt-1 w-full rounded-xl border border-border bg-background p-3" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}<Button type="submit" className="mt-6 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></form></main>;
  if (auth === 'forbidden') return <main className="grid min-h-screen place-items-center p-4 text-center"><div><h1 className="text-3xl font-bold">Administrator role required</h1><Button className="mt-5" onClick={() => supabase.auth.signOut()}>Sign out</Button></div></main>;
  return children;
}
