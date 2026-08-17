'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassNavbar, PinErrorMessage } from '../../components/voter-portal';
import { saveVoterSession, verifyVotingCode, type CodeFailure } from '../../data/pin-session';

export function AccessPage({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState<CodeFailure | 'not-visitor' | ''>('');

  useEffect(() => {
    let active = true;
    verifyVotingCode(code).then((result) => {
      if (!active) return;
      if (!result.ok) { setError(result.reason); return; }
      if (result.session.category !== 'visitor') { setError('not-visitor'); return; }
      saveVoterSession(result.session);
      router.replace('/projects');
    });
    return () => { active = false; };
  }, [code, router]);

  const message = error === 'used' ? 'This visitor pass has already been used.'
    : error === 'disabled' ? 'This visitor pass has been disabled.'
      : error === 'network-error' ? 'The verification service is unavailable. Please try again.'
        : error === 'not-visitor' ? 'This code is not a visitor pass.'
          : 'This visitor pass is invalid.';

  return <main className="utycc-page login-page">
    <GlassNavbar />
    <div className="login-stage">
      <section className="glass-login-card animate-in">
        <div className="login-logo" aria-hidden="true">U</div>
        <p className="login-kicker">UTYCC Project Exhibition</p>
        <h1>Visitor Pass</h1>
        {error ? <><PinErrorMessage>{message}</PinErrorMessage><button className="continue-button" type="button" onClick={() => router.replace('/')}>Enter backup code</button></> : <p className="login-copy" role="status"><span className="button-spinner" /> Verifying your visitor pass…</p>}
      </section>
    </div>
  </main>;
}
