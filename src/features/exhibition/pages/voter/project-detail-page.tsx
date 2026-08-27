"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { VoterApiError, voterApi, type PublicVoterSession } from "../../data/voter-api";
import type { Project } from "../../data/types";
import { Button, Modal } from "../../components/ui";
import { GlassNavbar, VoterStatusBanner, voterPage } from "../../components/voter-portal";
import { projectCategoryLabel, useVoterLocale } from "../../i18n";

export function ProjectDetailPage({ id }: { id: string }) {
  const { locale, t } = useVoterLocale();
  const router = useRouter();
  const voteKey = useRef<string | null>(null);
  const [session, setSession] = useState<PublicVoterSession | null>();
  const [project, setProject] = useState<Project | null>();
  const [votingOpen, setVotingOpen] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    voterApi.projects().then(({ session, projects, status }) => {
      const project = projects.find((item) => item.id === id);
      if (!project) return router.replace("/projects");
      setSession(session); setProject(project); setVotingOpen(status.isOpen);
    }).catch(() => router.replace("/"));
  }, [id, router]);

  const vote = async () => {
    if (!project || submitting || votingOpen !== true) return;
    setSubmitting(true); setError("");
    try {
      voteKey.current ??= crypto.randomUUID();
      await voterApi.vote(project.id, voteKey.current);
      router.replace("/vote/success");
    } catch (failure) {
      setSubmitting(false);
      const reason = failure instanceof Error ? failure.message : "request_failed";
      if (reason === "voting_closed") setVotingOpen(false);
      setError(failure instanceof VoterApiError && failure.status === 429 ? `Too many submissions. Please wait ${failure.retryAfter ?? 60} seconds and retry.` : "We could not confirm the vote. Retry safely; your previous request will not duplicate it.");
    }
  };

  if (!session || !project) return <main className={`${voterPage} grid place-items-center`}><p className="text-sm text-[#9faac4]" role="status">Loading project…</p></main>;

  const canVote = !session.hasVoted && votingOpen === true;
  return <main className={`${voterPage} pb-10`}>
    <GlassNavbar category={session.category} onLogout={() => void voterApi.logout().finally(() => router.replace("/"))} />
    {votingOpen !== null && <VoterStatusBanner isOpen={votingOpen} />}
    <article className="relative z-[1] mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Link href="/projects" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#b9c5df] hover:text-white"><ArrowLeft size={17} /> Back to projects</Link>
      <Image src={project.imageUrl} alt={`${project.title} project`} width={960} height={540} quality={75} className="mt-5 aspect-video w-full rounded-2xl object-cover" priority />
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[.12em] text-[#69e6ff]">{projectCategoryLabel(project.category, locale)} · {project.teamName}</p>
      <h1 className="mt-3 break-words text-3xl font-bold leading-tight sm:text-5xl">{project.title}</h1>
      <p className="mt-6 whitespace-pre-line text-base leading-8 text-[#c4cde1]">{project.shortDescription}</p>
      {session.hasVoted ? <p className="mt-7 flex items-center gap-2 text-sm font-bold text-[#a9f1ff]"><ShieldCheck size={18} /> Your vote is already recorded.</p> : <Button className="mt-8" disabled={!canVote} onClick={() => setConfirming(true)}>{votingOpen === false ? t("votingClosed") : "Vote for this project"}</Button>}
    </article>
    {confirming && <Modal onClose={() => !submitting && setConfirming(false)}><h2 className="text-2xl font-bold">{t("confirmVote", { title: project.title })}</h2><p className="mt-4 flex gap-2 text-sm font-bold text-destructive"><Zap className="shrink-0" size={17} />{t("cannotChange")}</p>{error && <p className="mt-3 text-sm font-bold text-destructive" role="alert">{error}</p>}<div className="mt-6 grid grid-cols-2 gap-3"><Button variant="quiet" disabled={submitting} onClick={() => setConfirming(false)}>{t("cancel")}</Button><Button disabled={submitting} onClick={vote}>{submitting ? t("record") : t("confirm")}</Button></div></Modal>}
  </main>;
}
