'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, ShieldCheck, Zap } from 'lucide-react';
import { categoryLabels, pointValues, projects as seedProjects } from '../../data/data';
import { clearMockPinSession, readMockPinSession, saveMockPinSession, type MockPinSession } from '../../data/pin-session';
import { mockServices } from '../../data/services';
import { Badge, Button, Modal, NotFound } from '../../components/ui';
import { GlassNavbar, VotingPortalLogoutDialog } from '../../components/voter-portal';

export function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const project = seedProjects.find((item) => item.id === params.id);
  const [session, setSession] = useState<MockPinSession | null>();
  const [selected, setSelected] = useState(false);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [logout, setLogout] = useState(false);

  useEffect(() => {
    const stored = readMockPinSession();
    if (!stored) { router.replace('/'); return; }
    setSession(stored);
    setSelected(localStorage.getItem('exhibition-selected') === params.id);
    setDone(stored.hasVoted || Boolean(localStorage.getItem('exhibition-voted')));
    setModal(new URLSearchParams(location.search).get('confirm') === 'true');
  }, [params.id, router]);

  if (!project) return <NotFound />;
  if (!session) return <main className="utycc-page"><GlassNavbar /></main>;

  const vote = async () => {
    setSubmitting(true);
    await mockServices.submitVote(project.id);
    saveMockPinSession({ ...session, hasVoted: true });
    setSubmitting(false); setDone(true); setModal(false);
    router.push('/vote/success');
  };
  const exit = () => { clearMockPinSession(); router.replace('/'); };

  return <main className="utycc-page projects-page">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <GlassNavbar category={session.category} onLogout={() => setLogout(true)} />
    <div className="relative z-[1] mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <button type="button" onClick={() => router.push('/projects')} className="details-back"><ChevronLeft size={16} />Back to projects</button>
      <article className="glass-project-details">
        <div><img src={project.imageUrl} alt={`${project.title} project`} /></div>
        <section><div className="flex flex-wrap gap-2"><Badge tone="gold">Project {project.projectNumber}</Badge><Badge>{project.category}</Badge></div><h1>{project.title}</h1><p className="details-team">{project.teamName}</p><p className="details-description">{project.fullDescription}</p><div className="mt-6 flex flex-wrap gap-2">{project.features.map((feature) => <Badge key={feature} tone="muted">{feature}</Badge>)}</div><div className="details-actions">{done ? <div className="voted-notice"><ShieldCheck size={20} /><strong>Your vote is already recorded.</strong></div> : selected ? <><Button variant="quiet" onClick={() => { setSelected(false); localStorage.removeItem('exhibition-selected'); }}>Choose another project</Button><Button onClick={() => setModal(true)}><Check size={17} />Selected · Vote now</Button></> : <Button onClick={() => { setSelected(true); localStorage.setItem('exhibition-selected', project.id); }}>Select this project</Button>}</div></section>
      </article>
    </div>
    {modal && <Modal onClose={() => !submitting && setModal(false)}><img src={project.imageUrl} alt="" className="h-28 w-full rounded-xl object-cover" /><Badge tone="gold">Project {project.projectNumber}</Badge><h2 className="mt-3 text-2xl font-bold">{project.title}</h2><div className="mt-4 rounded-xl bg-secondary p-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Your category</span><strong>{categoryLabels[session.category]} Voter</strong></div><div className="mt-2 flex justify-between"><span className="text-muted-foreground">Contribution</span><strong>{pointValues[session.category]} weighted points</strong></div></div><p className="mt-4 flex gap-2 text-sm font-bold text-destructive"><Zap size={16} />Your vote cannot be changed after confirmation.</p><div className="mt-6 grid grid-cols-2 gap-3"><Button variant="quiet" disabled={submitting} onClick={() => setModal(false)}>Cancel</Button><Button disabled={submitting} onClick={vote}>{submitting ? 'Recording…' : 'Confirm vote'}</Button></div></Modal>}
    {logout && <VotingPortalLogoutDialog onCancel={() => setLogout(false)} onConfirm={exit} />}
  </main>;
}
