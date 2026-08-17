'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { categoryLabels, pointValues, projects } from '../../data/data';
import { clearMockPinSession, readMockPinSession, type MockPinSession } from '../../data/pin-session';
import { Badge, Button } from '../../components/ui';
import { GlassNavbar, VotingPortalLogoutDialog } from '../../components/voter-portal';

export function VoteSuccessPage() {
  const router = useRouter();
  const [session, setSession] = useState<MockPinSession | null>();
  const [projectId, setProjectId] = useState('p1');
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    const stored = readMockPinSession();
    if (!stored) { router.replace('/'); return; }
    setSession(stored); setProjectId(localStorage.getItem('exhibition-voted') || 'p1');
  }, [router]);
  const project = projects.find((item) => item.id === projectId) || projects[0];
  const exit = () => { clearMockPinSession(); router.replace('/'); };
  if (!session) return <main className="utycc-page" />;
  return <main className="utycc-page success-page">
    <GlassNavbar category={session.category} onLogout={() => setLogout(true)} />
    <section className="success-card animate-in"><span className="success-icon"><Check size={30} /></span><p className="login-kicker">Vote receipt</p><h1>Your vote has<br />been recorded.</h1><p>Thank you for supporting innovation at UTYCC Project Exhibition.</p><article><img src={project.imageUrl} alt={`${project.title} project`} /><div><Badge tone="gold">Project {project.projectNumber}</Badge><h2>{project.title}</h2><dl><div><dt>Your category</dt><dd>{categoryLabels[session.category]} Voter</dd></div><div><dt>Contribution</dt><dd>{pointValues[session.category]} points</dd></div><div><dt>Receipt</dt><dd>UTYCC-DEMO</dd></div><div><dt>Status</dt><dd>Demo recorded</dd></div></dl></div></article><div className="success-actions"><Button variant="outline" onClick={() => router.push(`/projects/${project.id}`)}>View project</Button><Button onClick={() => router.push('/projects')}>Browse projects</Button></div></section>
    {logout && <VotingPortalLogoutDialog onCancel={() => setLogout(false)} onConfirm={exit} />}
  </main>;
}
