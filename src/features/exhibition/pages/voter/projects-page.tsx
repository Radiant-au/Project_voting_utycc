"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Zap } from "lucide-react";
import { categoryLabels, pointValues, projectMajors } from "../../data/data";
import { voterApi, type PublicVoterSession } from "../../data/voter-api";
import type { Project } from "../../data/types";
import { Badge, Button, EmptyState, LoadingCard, Modal } from "../../components/ui";
import {
  GlassNavbar,
  GlassProjectCard,
  GlassVoteBar,
  VotingPortalLogoutDialog,
  ambient,
  projectsPage,
} from "../../components/voter-portal";

export function ProjectsPage() {
  const router = useRouter();
  const [session, setSession] = useState<PublicVoterSession | null>();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState("");
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [logout, setLogout] = useState(false);

  useEffect(() => {
    Promise.all([voterApi.session(), voterApi.projects()])
      .then(([sessionResponse, projectResponse]) => {
        setSession(sessionResponse.session);
        setItems(projectResponse.projects);
        setVoted(sessionResponse.session.hasVoted);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const visible = useMemo(
    () =>
      items
        .filter(
          (project) =>
            !project.isArchived &&
            (!query ||
              `${project.title} ${project.teamName} ${project.shortDescription}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (category === "All" || project.category === category),
        ),
    [items, query, category],
  );
  const selectedProject = items.find((project) => project.id === selected);
  const exit = () => {
    void voterApi.logout().finally(() => router.replace("/"));
  };
  const vote = async () => {
    if (!selectedProject || submitting) return;
    setSubmitting(true);
    setVoteError(false);
    try {
      await voterApi.vote(selectedProject.id);
      router.replace("/vote/success");
    } catch {
      setSubmitting(false);
      setVoteError(true);
    }
  };

  if (!session || loading)
    return (
      <main className={projectsPage}>
        <GlassNavbar category={session?.category} />
        <div className="mx-auto max-w-6xl px-4 pt-10">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
          </div>
        </div>
      </main>
    );

  return (
    <main className={`${projectsPage} pb-32`}>
      <div
        className={`${ambient} top-[8%] -right-48 h-[min(48vw,34rem)] w-[min(48vw,34rem)] bg-[radial-gradient(circle,hsl(260_85%_65%/.42),transparent_68%)]`}
      />
      <div
        className={`${ambient} bottom-[2%] -left-40 h-[min(42vw,28rem)] w-[min(42vw,28rem)] bg-[radial-gradient(circle,hsl(188_100%_60%/.3),transparent_68%)] [animation-delay:-4s]`}
      />
      <GlassNavbar
        category={session.category}
        onLogout={() => setLogout(true)}
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
        <section className="flex flex-col items-start gap-6 border-b border-white/15 py-10 min-[641px]:py-14 min-[641px]:flex-row min-[641px]:items-end min-[641px]:justify-between">
          <div>
            <span className="text-[.68rem] font-extrabold uppercase tracking-[.14em] text-[#69e6ff]">
              UTYCC · 2025–2026 Project Show
            </span>
            <h1 className="mt-3 text-[clamp(2.25rem,6vw,4.75rem)] leading-[.98] tracking-[-.05em]">
              Choose your project.
            </h1>
            <p className="mt-4 text-sm text-[#9eabc8]">
              Discover student innovation and select the project that deserves
              your vote.
            </p>
          </div>
          <Badge tone="gold">
            {categoryLabels[session.category]} Voter ·{" "}
            {pointValues[session.category]} points
          </Badge>
        </section>
        {voted && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cyan-200/20 bg-cyan-900/10 p-4 text-[#c9f8ff]">
            <ShieldCheck className="shrink-0 text-[#69e6ff]" size={19} />
            <div>
              <strong>Your vote is already recorded.</strong>
              <p className="mt-1 text-xs text-[#93a4c3]">
                You can continue browsing the exhibition projects.
              </p>
            </div>
          </div>
        )}
        <div className="relative top-auto z-10 mt-6 rounded-2xl border border-white/15 bg-[#090d20]/75 p-2.5 shadow-[0_12px_34px_hsl(235_90%_3%/.3)] backdrop-blur-xl min-[641px]:sticky min-[641px]:top-2">
          <div className="relative">
            <Search
              className="absolute top-3.5 left-3 text-[#7f8caa]"
              size={17}
            />
            <input
              className="min-h-11 w-full rounded-xl border border-white/15 bg-[#1a2340]/65 pr-3 pl-9 text-xs outline-none focus:border-[#69e6ff] focus:ring-2 focus:ring-cyan-300/15"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects or teams"
              aria-label="Search projects or teams"
            />
          </div>
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter projects by major">
            {projectMajors.map(([short, name]) => <button key={short} type="button" title={name} aria-pressed={category === name} onClick={() => setCategory(name)} className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-extrabold transition ${category === name ? "border-[#69e6ff] bg-[#69e6ff] text-[#071126]" : "border-white/15 bg-white/5 text-[#aeb9d4] hover:border-cyan-200/40"}`}>{short}</button>)}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#9ba8c6]">
          <p>{visible.length} projects to discover</p>
          {(query || category !== "All") && (
            <button
              className="cursor-pointer border-0 bg-transparent text-xs font-extrabold text-[#69e6ff]"
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        {visible.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {visible.map((project, index) => (
              <div
                key={project.id}
                className="min-w-0 animate-rise"
                style={{ animationDelay: `${((index % 3) + 1) * 80}ms` }}
              >
                <GlassProjectCard
                  project={project}
                  selected={selected === project.id}
                  onSelect={() =>
                    !voted &&
                    setSelected(selected === project.id ? "" : project.id)
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search />}
            title="No projects found"
            text="Try a different search or clear your filters."
            action="Clear filters"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          />
        )}
      </div>
      {selectedProject && !voted && (
        <>
          <GlassVoteBar project={selectedProject} onCancel={() => setSelected("")} onVote={() => { setVoteError(false); setConfirming(true); }} />
        </>
      )}
      {confirming && selectedProject && (
        <Modal onClose={() => !submitting && setConfirming(false)}>
          <img src={selectedProject.imageUrl} alt="" className="h-28 w-full rounded-xl object-cover" />
          <Badge tone="gold">Project {selectedProject.projectNumber}</Badge>
          <h2 className="mt-3 text-2xl font-bold">Confirm your vote for {selectedProject.title}?</h2>
          <p className="mt-4 flex gap-2 text-sm font-bold text-destructive"><Zap className="shrink-0" size={17} />Your vote cannot be changed after confirmation.</p>
          {voteError && <p className="mt-3 text-sm font-bold text-destructive" role="alert">Could not record your vote. This code may already be used or voting may be closed.</p>}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="quiet" disabled={submitting} onClick={() => setConfirming(false)}>Cancel</Button>
            <Button disabled={submitting} onClick={vote}>{submitting ? "Recording…" : "Confirm vote"}</Button>
          </div>
        </Modal>
      )}
      {logout && (
        <VotingPortalLogoutDialog
          onCancel={() => setLogout(false)}
          onConfirm={exit}
        />
      )}
    </main>
  );
}
