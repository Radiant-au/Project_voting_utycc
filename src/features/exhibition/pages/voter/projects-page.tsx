'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck } from 'lucide-react';
import { categoryLabels, pointValues } from '../../data/data';
import { clearMockPinSession, readMockPinSession, type MockPinSession } from '../../data/pin-session';
import { mockServices } from '../../data/services';
import type { Project } from '../../data/types';
import { Badge, EmptyState, LoadingCard, cx } from '../../components/ui';
import { GlassNavbar, GlassProjectCard, GlassVoteBar, VotingPortalLogoutDialog } from '../../components/voter-portal';

export function ProjectsPage() {
  const router = useRouter();
  const [session, setSession] = useState<MockPinSession | null>();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('Featured');
  const [selected, setSelected] = useState('');
  const [voted, setVoted] = useState(false);
  const [logout, setLogout] = useState(false);

  useEffect(() => {
    const stored = readMockPinSession();
    if (!stored) { router.replace('/'); return; }
    setSession(stored);
    setVoted(stored.hasVoted || Boolean(localStorage.getItem('exhibition-voted')));
    mockServices.getProjects().then(setItems).finally(() => setLoading(false));
  }, [router]);

  const visible = useMemo(() => items
    .filter((project) => !project.isArchived && (!query || `${project.title} ${project.teamName} ${project.shortDescription}`.toLowerCase().includes(query.toLowerCase())) && (category === 'All categories' || project.category === category))
    .sort((a, b) => sort === 'A–Z' ? a.title.localeCompare(b.title) : sort === 'Newest' ? b.id.localeCompare(a.id) : 0), [items, query, category, sort]);
  const selectedProject = items.find((project) => project.id === selected);
  const exit = () => { clearMockPinSession(); router.replace('/'); };

  if (!session || loading) return <main className="utycc-page projects-page"><GlassNavbar category={session?.category} /><div className="mx-auto max-w-6xl px-4 pt-10"><div className="h-10 w-56 animate-pulse rounded-lg bg-white/10" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><LoadingCard /><LoadingCard /><LoadingCard /></div></div></main>;

  return <main className="utycc-page projects-page pb-32">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <GlassNavbar category={session.category} onLogout={() => setLogout(true)} />
    <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
      <section className="projects-intro">
        <div><span>UTYCC · Project Exhibition 2026</span><h1>Explore bold ideas.<br />Choose your project.</h1><p>Discover student innovation and select the project that deserves your vote.</p></div>
        <Badge tone="gold">{categoryLabels[session.category]} Voter · {pointValues[session.category]} points</Badge>
      </section>
      {voted && <div className="voted-notice"><ShieldCheck size={19} /><div><strong>Your vote is already recorded.</strong><p>You can continue browsing the exhibition projects.</p></div></div>}
      <div className="glass-filters">
        <div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or teams" aria-label="Search projects or teams" /></div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter project category"><option>All categories</option>{[...new Set(items.map((project) => project.category))].map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort projects"><option>Featured</option><option>A–Z</option><option>Newest</option></select>
      </div>
      <div className="projects-count"><p>{visible.length} projects to discover</p>{(query || category !== 'All categories') && <button type="button" onClick={() => { setQuery(''); setCategory('All categories'); }}>Clear filters</button>}</div>
      {visible.length ? <div className="project-grid mt-4">{visible.map((project, index) => <div key={project.id} className={cx('min-w-0 animate-in', `delay-${index % 3 + 1}`)}><GlassProjectCard project={project} selected={selected === project.id} onSelect={() => !voted && setSelected(selected === project.id ? '' : project.id)} onDetails={() => router.push(`/projects/${project.id}`)} /></div>)}</div> : <EmptyState icon={<Search />} title="No projects found" text="Try a different search or clear your filters." action="Clear filters" onClick={() => { setQuery(''); setCategory('All categories'); }} />}
    </div>
    {selectedProject && !voted && <GlassVoteBar project={selectedProject} onCancel={() => setSelected('')} onVote={() => { localStorage.setItem('exhibition-selected', selectedProject.id); router.push(`/projects/${selectedProject.id}?confirm=true`); }} />}
    {logout && <VotingPortalLogoutDialog onCancel={() => setLogout(false)} onConfirm={exit} />}
  </main>;
}
