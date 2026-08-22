'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassNavbar, PinErrorMessage, primaryButton, voterPage } from '../../components/voter-portal';
import { voterApi } from '../../data/voter-api';
import { useVoterLocale } from '../../i18n';

export function AccessPage({ code }: { code: string }) {
  const { t } = useVoterLocale();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    window.history.replaceState(null, '', '/access');
    voterApi.verifyCode(code).then(({ session }) => {
      if (!active) return;
      if (session.category !== 'visitor') { void voterApi.logout(); setError(true); return; }
      router.replace(session.hasVoted ? '/vote/success' : '/projects');
    }).catch(() => active && setError(true));
    return () => { active = false; };
  }, [code, router]);

  return <main className={voterPage}>
    <GlassNavbar />
    <div className="relative z-[1] mx-auto grid w-[min(calc(100%-1.25rem),32rem)] place-items-center py-8 min-[760px]:min-h-[calc(100dvh-9rem)]">
      <section className="w-full animate-rise rounded-[1.4rem] border border-white/15 bg-[#111936]/75 p-[1.1rem] text-center shadow-2xl backdrop-blur-2xl sm:p-7">
        <img className="mx-auto mb-3 h-[3.4rem] w-[3.4rem] rounded-2xl border border-white/30 object-cover" src="https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748742/UTYCC_tttyy9.jpg" alt="UTYCC logo" />
        <p className="text-[.68rem] font-extrabold uppercase tracking-[.14em] text-[#69e6ff]">{t('projectShow')}</p>
        <h1 className="mt-1 text-3xl font-bold">{t('visitorPass')}</h1>
        {error ? <><PinErrorMessage>{t('invalidVisitor')}</PinErrorMessage><button className={primaryButton} type="button" onClick={() => router.replace('/')}>{t('backupCode')}</button></> : <p className="mt-3 flex items-center justify-center gap-2 text-sm text-[#aeb9d4]" role="status"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> {t('verifyingVisitor')}</p>}
      </section>
    </div>
  </main>;
}
