"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ShieldCheck, Zap } from "lucide-react";
import { projectCategoryOptions } from "../../data/project-categories";
import { VoterApiError, voterApi, type PublicVoterSession } from "../../data/voter-api";
import type { Project } from "../../data/types";
import {
  Badge,
  Button,
  EmptyState,
  LoadingCard,
  Modal,
} from "../../components/ui";
import {
  GlassNavbar,
  GlassProjectCard,
  GlassVoteBar,
  VoterStatusBanner,
  VotingPortalLogoutDialog,
  ambient,
  projectsPage,
} from "../../components/voter-portal";
import { projectCategoryLabel, useVoterLocale } from "../../i18n";

export function ProjectsPage() {
  const { locale, t, categoryLabel } = useVoterLocale();
  const router = useRouter();
  const [session, setSession] = useState<PublicVoterSession | null>();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState("");
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const voteKey = useRef<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [logout, setLogout] = useState(false);
  const [votingOpen, setVotingOpen] = useState<boolean | null>(null);

  useEffect(() => {
    voterApi.projects()
      .then(({ session: nextSession, projects, status }) => {
        setSession(nextSession);
        setItems(projects);
        setVoted(nextSession.hasVoted);
        setVotingOpen(status.isOpen);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const loadStatus = () => {
      void voterApi
        .status()
        .then(({ status }) => setVotingOpen(status.isOpen))
        .catch(() => setVotingOpen(null));
    };
    window.addEventListener("focus", loadStatus);
    return () => window.removeEventListener("focus", loadStatus);
  }, []);

  useEffect(() => {
    if (votingOpen !== true) {
      setSelected("");
      setConfirming(false);
    }
  }, [votingOpen]);

  const visible = useMemo(
    () =>
      items.filter(
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
    if (!selectedProject || submitting || votingOpen !== true) return;
    setSubmitting(true);
    setVoteError("");
    try {
      voteKey.current ??= crypto.randomUUID();
      await voterApi.vote(selectedProject.id, voteKey.current);
      router.replace("/vote/success");
    } catch (failure) {
      setSubmitting(false);
      const reason = failure instanceof Error ? failure.message : "request_failed";
      if (reason === "voting_closed")
        setVotingOpen(false);
      setVoteError(failure instanceof VoterApiError && failure.status === 429 ? `Too many submissions. Please wait ${failure.retryAfter ?? 60} seconds and retry.` : reason === "vote_session_expired" ? "Your voting session expired. Enter your code again." : reason === "vote_rejected" ? "This voting code has already been used." : "We could not confirm the vote. Retry safely; your previous request will not duplicate it.");
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
      {votingOpen !== null && <VoterStatusBanner isOpen={votingOpen} />}
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
        <section className="flex flex-col items-start gap-6 border-b border-white/15 py-10 min-[641px]:py-14 min-[641px]:flex-row min-[641px]:items-end min-[641px]:justify-between">
          <div>
            <span className="text-[.68rem] font-extrabold uppercase tracking-[.14em] text-[#69e6ff]">
              UTYCC · {t("projectShow")}
            </span>
            <h1
              className={`mt-3 ${locale === "my" ? "text-[clamp(1.8rem,5vw,3rem)]" : "text-[clamp(2.25rem,6vw,4.75rem)]"} leading-[.98] tracking-[-.05em]`}
            >
              {t("chooseProject")}
            </h1>
            <p className="mt-4 text-sm text-[#9eabc8]">{t("discover")}</p>
          </div>
          <Badge tone="gold">
            {categoryLabel(session.category)} {t("voter")}
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
              placeholder={t("search")}
              aria-label={t("search")}
            />
          </div>
          <div
            className="mt-2.5 flex gap-2 overflow-x-auto pb-1"
            aria-label={t("filterProjects")}
          >
            {projectCategoryOptions.map(([short, name]) => {
              const label = name === "All" ? t("all") : short;
              const title =
                name === "All" ? t("all") : projectCategoryLabel(name, locale);
              return (
                <button
                  key={short}
                  type="button"
                  title={title}
                  aria-label={title}
                  aria-pressed={category === name}
                  onClick={() => setCategory(name)}
                  className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-extrabold transition ${category === name ? "border-[#69e6ff] bg-[#69e6ff] text-[#071126]" : "border-white/15 bg-white/5 text-[#aeb9d4] hover:border-cyan-200/40"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#9ba8c6]">
          <p>{t("projectsFound", { count: visible.length })}</p>
          {(query || category !== "All") && (
            <button
              className="cursor-pointer border-0 bg-transparent text-xs font-extrabold text-[#69e6ff]"
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              {t("clearFilters")}
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
                    votingOpen === true &&
                    (voteKey.current = null, setSelected(selected === project.id ? "" : project.id))
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search />}
            title={t("noProjects")}
            text={t("tryAgain")}
            action={t("clearFilters")}
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          />
        )}
      </div>
      {selectedProject && !voted && votingOpen === true && (
        <>
          <GlassVoteBar
            project={selectedProject}
            onCancel={() => { voteKey.current = null; setSelected(""); }}
            onVote={() => {
              voteKey.current = null;
              setVoteError("");
              setConfirming(true);
            }}
          />
        </>
      )}
      {confirming && selectedProject && (
        <Modal onClose={() => !submitting && setConfirming(false)}>
          <Image
            src={selectedProject.imageUrl}
            alt=""
            className="h-28 w-full rounded-xl object-cover"
            width={432}
            height={112}
            quality={60}
          />
          <h2 className="mt-3 text-2xl font-bold">
            {t("confirmVote", { title: selectedProject.title })}
          </h2>
          <p className="mt-4 flex gap-2 text-sm font-bold text-destructive">
            <Zap className="shrink-0" size={17} />
            {t("cannotChange")}
          </p>
          {voteError && (
            <p className="mt-3 text-sm font-bold text-destructive" role="alert">
              {voteError}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="quiet"
              disabled={submitting}
              onClick={() => setConfirming(false)}
            >
              {t("cancel")}
            </Button>
            <Button disabled={submitting} onClick={vote}>
              {submitting ? t("record") : t("confirm")}
            </Button>
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
