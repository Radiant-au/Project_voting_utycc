'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassNavbar, PinErrorMessage } from '../../components/voter-portal';
import { voterApi } from '../../data/voter-api';

export function AccessPage({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    window.history.replaceState(null, '', '/access');
    voterApi.verifyCode(code).then(({ session }) => {
      if (!active) return;
      if (session.category !== 'visitor') { void voterApi.logout(); setError(true); return; }
      router.replace('/projects');
    }).catch(() => active && setError(true));
    return () => { active = false; };
  }, [code, router]);

  return <main className="utycc-page login-page">
    <GlassNavbar />
    <div className="login-stage">
      <section className="glass-login-card animate-in">
        <div className="login-logo" aria-hidden="true">U</div>
        <p className="login-kicker">UTYCC Project Exhibition</p>
        <h1>Visitor Pass</h1>
        {error ? <><PinErrorMessage>This visitor pass is invalid or unavailable.</PinErrorMessage><button className="continue-button" type="button" onClick={() => router.replace('/')}>Enter backup code</button></> : <p className="login-copy" role="status"><span className="button-spinner" /> Verifying your visitor pass…</p>}
      </section>
    </div>
  </main>;
}
