"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  FlaskConical,
  Globe2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { categoryLabels, pointValues } from "../data/data";
import type { VoterCategory } from "../data/types";

export const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      data-testid="link-exhibition-logo"
    >
      <span
        className={cx(
          "grid h-10 w-10 place-items-center rounded-xl shadow-sm",
          inverse
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <Sparkles size={20} strokeWidth={2.5} />
      </span>
      <span
        className={cx(
          "font-display text-lg font-bold leading-none",
          inverse ? "text-[#fcfaf4]" : "text-foreground",
        )}
      >
        Campus Nexus
        <br />
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[.22em] opacity-70">
          university project grid
        </span>
      </span>
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  onClick,
  type = "button",
  disabled = false,
  title,
}: {
  children: ReactNode;
  variant?: "primary" | "quiet" | "outline" | "danger" | "gold";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-[0_6px_0_hsl(178_48%_25%)] hover:-translate-y-0.5",
        variant === "gold" &&
          "bg-accent text-accent-foreground shadow-[0_6px_0_hsl(37_67%_43%)] hover:-translate-y-0.5",
        variant === "quiet" && "bg-muted text-foreground hover:bg-secondary",
        variant === "outline" &&
          "border border-border bg-card text-foreground hover:border-primary hover:text-primary",
        variant === "danger" && "bg-destructive text-white",
        className,
      )}
      data-testid={`button-${title?.toLowerCase().replace(/\s+/g, "-") || "action"}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "gold" | "lavender" | "red" | "muted";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
        tone === "teal" && "bg-primary/10 text-primary",
        tone === "gold" && "bg-accent/25 text-[#8b5e13] dark:text-accent",
        tone === "lavender" &&
          "bg-[#7f77a8]/15 text-[#655c8b] dark:text-[#bbb5e5]",
        tone === "red" && "bg-destructive/10 text-destructive",
        tone === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-primary/30 bg-[#101d2c] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_hsl(188_100%_62%/.22)] animate-in">
      <Check size={16} className="text-primary" />
      {message}
      <button
        onClick={onClose}
        aria-label="Close notification"
        data-testid="button-close-toast"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function useToastMessage() {
  const [message, setMessage] = useState("");
  return { message, notify: setMessage, clear: () => setMessage("") };
}

export function VoterHeader({ category }: { category?: VoterCategory }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <Logo />
      <div className="flex items-center gap-2">
        {category && (
          <Badge tone="gold">
            {categoryLabels[category]} · {pointValues[category]} pt
          </Badge>
        )}
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground"
          aria-label="Profile menu"
          data-testid="button-profile-menu"
        >
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}

const categoryInfo: Record<
  VoterCategory,
  { icon: typeof UserRound; description: string; color: string }
> = {
  student: {
    icon: BookOpen,
    description: "Undergraduate and graduate students",
    color: "bg-primary/10 text-primary",
  },
  teacher: {
    icon: FlaskConical,
    description: "Faculty and academic staff",
    color: "bg-accent/10 text-accent",
  },
  visitor: {
    icon: Globe2,
    description: "Guests and exhibition visitors",
    color: "bg-[#8f86ff]/15 text-[#b6afff]",
  },
};

export function CategoryCard({
  category,
  selected,
  onClick,
}: {
  category: VoterCategory;
  selected: boolean;
  onClick: () => void;
}) {
  const info = categoryInfo[category];
  const Icon = info.icon;
  return (
    <button
      onClick={onClick}
      className={cx(
        "relative flex min-h-36 w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition duration-200",
        selected
          ? "border-primary bg-primary/8 shadow-[0_8px_22px_hsl(178_48%_35%/.12)]"
          : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/50",
      )}
      data-testid={`card-category-${category}`}
    >
      <span
        className={cx(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
          info.color,
        )}
      >
        <Icon size={21} />
      </span>
      <span>
        <span className="block font-display text-xl font-bold">
          {categoryLabels[category]}
        </span>
        <span className="mt-1 block max-w-[220px] text-sm leading-5 text-muted-foreground">
          {info.description}
        </span>
        <span className="mt-3 block text-xs font-bold text-primary">
          {pointValues[category]} point{pointValues[category] > 1 ? "s" : ""}{" "}
          per vote
        </span>
      </span>
      {selected && (
        <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check size={15} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#182238]/45 p-3 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-[1.5rem] bg-card p-6 shadow-2xl animate-in sm:p-8"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Close dialog"
          data-testid="button-close-dialog"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[1.55] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
export function EmptyState({
  icon,
  title,
  text,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="my-16 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {text}
      </p>
      {action && (
        <Button variant="outline" className="mt-5" onClick={onClick}>
          {action}
        </Button>
      )}
    </div>
  );
}

export function NotFound() {
  const router = useRouter();
  return (
    <main className="grid min-h-[100dvh] place-items-center p-6 text-center">
      <div>
        <Logo />
        <h1 className="mt-12 font-display text-5xl font-bold">
          This room is empty.
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for has moved.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    </main>
  );
}
