'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Trophy, Users, Zap } from 'lucide-react';
import { projectCategories, projectCategoryShortNames, type ProjectCategory } from '../../data/project-categories';
import { Button } from '../../components/ui';
import { AdminShell, PageIntro, StatCard } from '../../components/admin';
import { supabase } from '@/lib/supabase/admin-client';

type VoteRow = { project_id: string; category: string; points: number };
type ProjectRow = { id: string; title: string; category: string };

const voterCategories = ['student', 'teacher', 'visitor'] as const;
const voterLabels = { student: 'Student', teacher: 'Teacher', visitor: 'Visitor' };
type VoterTab = 'all' | (typeof voterCategories)[number];

export function AdminResults() {
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [query, setQuery] = useState('');
  const [voterTab, setVoterTab] = useState<VoterTab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const [votesResult, projectsResult] = await Promise.all([
      supabase.from('votes').select('project_id,category,points'),
      supabase.from('projects').select('id,title,category').eq('is_active', true),
    ]);
    if (votesResult.error || projectsResult.error) setError('Could not load results. Check Supabase and try again.');
    setVotes((votesResult.data ?? []) as VoteRow[]);
    setProjects((projectsResult.data ?? []) as ProjectRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const totalPoints = votes.reduce((sum, vote) => sum + (vote.points || 0), 0);
  const voterTotals = voterCategories.map((category) => ({ category, votes: votes.filter((vote) => vote.category === category).length }));
  const categoryTotals = projectCategories.map((category) => {
    const categoryVotes = votes.filter((vote) => projectById.get(vote.project_id)?.category === category);
    return { category, votes: categoryVotes.length, points: categoryVotes.reduce((sum, vote) => sum + (vote.points || 0), 0) };
  });
  const projectTotals = projects
    .map((project) => {
      const projectVotes = votes.filter((vote) => vote.project_id === project.id);
      return {
        ...project,
        votes: projectVotes.length,
        points: projectVotes.reduce((sum, vote) => sum + (vote.points || 0), 0),
        byVoter: Object.fromEntries(voterCategories.map((category) => {
          const categoryVotes = projectVotes.filter((vote) => vote.category === category);
          return [category, { votes: categoryVotes.length, points: categoryVotes.reduce((sum, vote) => sum + (vote.points || 0), 0) }];
        })) as Record<typeof voterCategories[number], { votes: number; points: number }>,
      };
    })
    .filter((project) => project.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const aPoints = voterTab === 'all' ? a.points : a.byVoter[voterTab].points;
      const bPoints = voterTab === 'all' ? b.points : b.byVoter[voterTab].points;
      return bPoints - aPoints;
    });
  const visibleProjectTotals = projectTotals.map((project) => ({
    ...project,
    shownVotes: voterTab === 'all' ? project.votes : project.byVoter[voterTab].votes,
    shownPoints: voterTab === 'all' ? project.points : project.byVoter[voterTab].points,
  }));

  const exportCsv = () => {
    const csv = 'Project,Major,Student votes,Teacher votes,Visitor votes,Total voters,Total points\n' + visibleProjectTotals.map((project) => `${project.title},${project.category},${project.byVoter.student.votes},${project.byVoter.teacher.votes},${project.byVoter.visitor.votes},${project.votes},${project.points}`).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'voting-results.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <AdminShell title="Results">
    <PageIntro eyebrow="Voting intelligence" title="Results dashboard" action={<div className="flex gap-2"><Button variant="outline" onClick={exportCsv} disabled={loading}><Download size={16} /> Export CSV</Button><Button variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> Refresh</Button></div>} />
    {error && <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label="Total voters" value={loading ? '—' : String(votes.length)} note="Recorded ballots" tone="gold" />
      <StatCard icon={Zap} label="Total points" value={loading ? '—' : String(totalPoints)} note="Weighted vote points" tone="lavender" />
      <StatCard icon={Trophy} label="Highest project points" value={loading ? '—' : String(Math.max(0, ...projectTotals.map((project) => project.points)))} note="Single project total" />
      <StatCard icon={Users} label="Active projects" value={loading ? '—' : String(projects.length)} note="Currently published" />
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="font-display text-2xl font-bold">Voters by type</h2><div className="mt-4 space-y-3">{voterTotals.map((item) => <div key={item.category} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3"><span>{voterLabels[item.category]}</span><strong>{item.votes} votes</strong></div>)}</div></section>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="font-display text-2xl font-bold">Results by major</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="pb-3">Major</th><th className="pb-3">Voters</th><th className="pb-3">Points</th></tr></thead><tbody>{categoryTotals.map((item) => <tr key={item.category} className="border-b border-border last:border-0"><td className="py-3 font-bold">{projectCategoryShortNames[item.category]}</td><td className="py-3">{item.votes}</td><td className="py-3 font-bold text-primary">{item.points}</td></tr>)}</tbody></table></div></section>
    </div>
    <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold">Project results</h2><p className="mt-1 text-xs text-muted-foreground">Major codes stay in English: IS, CE, ECE, PRE, AME.</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="h-10 rounded-xl border border-border bg-background px-3 text-sm" /></div><div className="mt-4 flex gap-2 overflow-x-auto border-b border-border pb-3">{(['all', ...voterCategories] as VoterTab[]).map((tab) => <button key={tab} type="button" onClick={() => setVoterTab(tab)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${voterTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{tab === 'all' ? 'All voters' : voterLabels[tab]}</button>)}</div><p className="mt-3 text-xs text-muted-foreground">Sort view: {voterTab === 'all' ? 'All voters' : voterLabels[voterTab]}</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="pb-3">Rank / Project</th><th className="pb-3">Major</th><th className="pb-3">Student votes</th><th className="pb-3">Teacher votes</th><th className="pb-3">Visitor votes</th><th className="pb-3">Total voters</th><th className="pb-3">Total points</th></tr></thead><tbody>{visibleProjectTotals.map((project, index) => <tr key={project.id} className="border-b border-border last:border-0"><td className="py-3 font-bold"><span className="mr-2 text-primary">#{index + 1}</span>{project.title}</td><td className="py-3">{projectCategoryShortNames[project.category as ProjectCategory] ?? project.category}</td><td className="py-3">{project.byVoter.student.votes}</td><td className="py-3">{project.byVoter.teacher.votes}</td><td className="py-3">{project.byVoter.visitor.votes}</td><td className="py-3 font-bold">{project.votes}</td><td className="py-3 font-bold text-primary">{project.points}</td></tr>)}</tbody></table></div></section>
  </AdminShell>;
}
