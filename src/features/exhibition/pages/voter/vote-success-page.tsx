"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  categoryLabels,
  pointValues,
  projects as seedProjects,
} from "../../data/data";
import type { VoterCategory } from "../../data/types";
import { Badge, Button } from "../../components/ui";

export function VoteSuccessPage() {
  const router = useRouter();
  const project =
    seedProjects.find(
      (p) =>
        p.id ===
        (typeof window === "undefined"
          ? null
          : window.localStorage.getItem("exhibition-voted")),
    ) || seedProjects[0];
  const category =
    typeof window === "undefined"
      ? "visitor"
      : (window.localStorage.getItem("exhibition-category") as VoterCategory) ||
        "visitor";
  return (
    <main className="page-shell grid place-items-center bg-[#07141f] p-4 paper-grain">
      <div className="glow-border w-full max-w-md animate-in rounded-[1.7rem] bg-[#101d2c] p-6 text-foreground sm:p-9">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_10px_hsl(188_100%_62%/.14),0_0_30px_hsl(188_100%_62%/.35)]">
          <Check size={32} strokeWidth={3} />
        </div>
        <div className="mt-7 text-center">
          <span className="text-xs font-bold uppercase tracking-[.18em] text-primary">
            Vote receipt
          </span>
          <h1 className="glow-text mt-2 font-display text-4xl font-bold leading-tight">
            Your vote has
            <br />
            been recorded.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Thank you for adding your perspective to Campus Nexus.
          </p>
        </div>
        <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
          <img
            src={project.imageUrl}
            alt={`${project.title} project`}
            className="aspect-[2.1] w-full object-cover"
          />
          <div className="p-4">
            <Badge tone="gold">Project {project.projectNumber}</Badge>
            <h2 className="mt-2 font-display text-xl font-bold">
              {project.title}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">
                Your category
                <strong className="mt-1 block text-sm text-foreground">
                  {categoryLabels[category]}
                </strong>
              </span>
              <span className="text-muted-foreground">
                Contribution
                <strong className="mt-1 block text-sm text-foreground">
                  {pointValues[category]} points
                </strong>
              </span>
              <span className="text-muted-foreground">
                Receipt
                <strong className="mt-1 block text-sm text-foreground">
                  NS-25A7-KD
                </strong>
              </span>
              <span className="text-muted-foreground">
                Recorded
                <strong className="mt-1 block text-sm text-foreground">
                  Today · 10:42
                </strong>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            View project
          </Button>
          <Button onClick={() => router.push("/")}>Return home</Button>
        </div>
      </div>
    </main>
  );
}
