'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { categoryLabels } from '../../data/data';
import { voterApi, type VoteReceipt } from '../../data/voter-api';
import { Badge, Button } from '../../components/ui';
import { GlassNavbar, voterPage } from '../../components/voter-portal';

export function VoteSuccessPage() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<VoteReceipt | null>();

  useEffect(() => {
    voterApi.receipt().then(({ receipt }) => setReceipt(receipt)).catch(() => router.replace('/'));
  }, [router]);

  const project = receipt?.project;
  if (!receipt || !project) return <main className={voterPage} />;

  return <main className={`${voterPage} pb-[max(2rem,env(safe-area-inset-bottom))]`}>
    <GlassNavbar category={receipt.category} />
    <section className="relative z-[1] mx-auto mt-12 w-[min(calc(100%-2rem),30rem)] animate-rise rounded-[1.6rem] border border-white/15 bg-[#111936]/70 p-6 text-center shadow-[0_30px_80px_#02030d88] backdrop-blur-xl">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-white to-[#69e6ff] text-[#06122a] shadow-[0_0_0_9px_hsl(188_100%_65%/.08),0_0_30px_hsl(188_100%_65%/.2)]"><Check size={30} /></span>
      <p className="text-[.68rem] font-extrabold uppercase tracking-[.14em] text-[#69e6ff]">Vote receipt</p>
      <h1 className="mt-2 text-4xl leading-[1.05]">Your vote has<br />been recorded.</h1>
      <p className="mt-3 text-[.82rem] text-[#9faac4]">Thank you for supporting innovation at UTYCC Project Show.</p>
      <article className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-[#090d20]/55 text-left">
        <img className="aspect-[2.2] w-full object-cover" src={project.imageUrl} alt={`${project.title} project`} />
        <div className="p-4">
          <Badge tone="gold">Project {project.projectNumber}</Badge>
          <h2 className="mt-2 text-lg font-bold">{project.title}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-3 [&_dt]:text-[.62rem] [&_dt]:text-[#7f8daa] [&_dd]:mt-1 [&_dd]:text-xs [&_dd]:font-extrabold">
            <div><dt>Your category</dt><dd>{categoryLabels[receipt.category]} Voter</dd></div>
            <div><dt>Contribution</dt><dd>{receipt.points} points</dd></div>
            <div><dt>Receipt</dt><dd>{receipt.voteId.slice(0, 8).toUpperCase()}</dd></div>
            <div><dt>Status</dt><dd>Recorded</dd></div>
          </dl>
        </div>
      </article>
      <div className="mt-4">
        <Button onClick={() => router.replace('/')}>Finish</Button>
      </div>
    </section>
  </main>;
}
