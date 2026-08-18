'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { categoryLabels } from '../../data/data';
import { voterApi, type VoteReceipt } from '../../data/voter-api';
import { Badge, Button } from '../../components/ui';
import { GlassNavbar } from '../../components/voter-portal';

export function VoteSuccessPage() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<VoteReceipt | null>();

  useEffect(() => {
    voterApi.receipt().then(({ receipt }) => setReceipt(receipt)).catch(() => router.replace('/'));
  }, [router]);

  const project = receipt?.project;
  if (!receipt || !project) return <main className="utycc-page" />;

  return <main className="utycc-page success-page">
    <GlassNavbar category={receipt.category} />
    <section className="success-card animate-in">
      <span className="success-icon"><Check size={30} /></span>
      <p className="login-kicker">Vote receipt</p>
      <h1>Your vote has<br />been recorded.</h1>
      <p>Thank you for supporting innovation at UTYCC Project Exhibition.</p>
      <article>
        <img src={project.imageUrl} alt={`${project.title} project`} />
        <div>
          <Badge tone="gold">Project {project.projectNumber}</Badge>
          <h2>{project.title}</h2>
          <dl>
            <div><dt>Your category</dt><dd>{categoryLabels[receipt.category]} Voter</dd></div>
            <div><dt>Contribution</dt><dd>{receipt.points} points</dd></div>
            <div><dt>Receipt</dt><dd>{receipt.voteId.slice(0, 8).toUpperCase()}</dd></div>
            <div><dt>Status</dt><dd>Recorded</dd></div>
          </dl>
        </div>
      </article>
      <div className="success-actions">
        <Button variant="outline" onClick={() => router.push(`/projects/${project.id}`)}>View project</Button>
        <Button onClick={() => router.replace('/')}>Finish</Button>
      </div>
    </section>
  </main>;
}
