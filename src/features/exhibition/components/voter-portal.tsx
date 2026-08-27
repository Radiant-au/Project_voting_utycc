"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import type { Project, VoterCategory } from "../data/types";
import { Button, cx } from "./ui";
import { projectCategoryLabel, useVoterLocale } from "../i18n";

export const primaryButton =
  "mt-4 flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-[.9rem] border border-white/15 bg-linear-to-r from-[#655cff] to-[#29c9e7] font-extrabold text-white shadow-[0_12px_26px_hsl(230_90%_50%/.24),inset_0_1px_#ffffff55] transition hover:-translate-y-px hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#252d48]/75 disabled:text-[#74809d] disabled:shadow-none";
export const voterPage =
  "relative min-h-dvh overflow-x-clip bg-[radial-gradient(circle_at_75%_12%,hsl(255_78%_60%/.18),transparent_27rem),radial-gradient(circle_at_8%_80%,hsl(190_100%_55%/.12),transparent_30rem),linear-gradient(145deg,#050816_0%,#0b1230_48%,#111541_100%)] text-[#f6f8ff]";
export const projectsPage = `${voterPage} bg-[radial-gradient(circle_at_85%_10%,hsl(255_78%_58%/.15),transparent_30rem),linear-gradient(145deg,#060918,#0b1230_55%,#09192d)]`;
export const ambient =
  "pointer-events-none fixed z-0 rounded-full opacity-50 blur-xl animate-ambient";

export function UniversityBrand({ compact = false }: { compact?: boolean }) {
  const { t } = useVoterLocale();
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2.5 text-white no-underline"
      aria-label="UTYCC voting portal home"
    >
      <img
        className="h-[2.35rem] w-[2.35rem] shrink-0 rounded-[.7rem] border border-white/25 object-cover shadow-[0_0_22px_hsl(190_100%_68%/.22)] sm:h-[2.7rem] sm:w-[2.7rem] sm:rounded-[.85rem]"
        src="https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748742/UTYCC_tttyy9.jpg"
        alt="UTYCC logo"
      />
      <span className="min-w-0">
        <strong className="block text-[.82rem] tracking-[.1em] sm:text-[.95rem]">
          UTYCC
        </strong>
        <span className="block max-w-[7.2rem] truncate text-[.56rem] leading-[1.2] tracking-[.03em] text-[#abb7d5] sm:max-w-64 sm:text-[.64rem]">
          {compact
            ? t("projectShow")
            : `${t("university")} ${t("universityFull")}`}
        </span>
      </span>
    </Link>
  );
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useVoterLocale();
  return (
    <div
      className="inline-grid grid-cols-2 rounded-full border border-white/15 bg-[#090d1f]/50 p-[.2rem]"
      aria-label={t("language")}
    >
      {(["MY", "EN"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={item === "MY" ? locale === "my" : locale === "en"}
          onClick={() => setLocale(item === "MY" ? "my" : "en")}
          className={cx(
            "min-h-8 min-w-8 cursor-pointer rounded-full border-0 bg-transparent text-[.68rem] font-extrabold text-[#92a0bf] min-[371px]:min-w-9",
            (item === "MY" ? locale === "my" : locale === "en") &&
              "bg-linear-to-br from-[#756fff] to-[#45cee9] text-white shadow-[0_3px_12px_hsl(236_90%_55%/.3)]",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function VoterCategoryBadge({ category }: { category: VoterCategory }) {
  const { t, categoryLabel } = useVoterLocale();
  return (
    <span
      className={cx(
        "hidden min-h-9 items-center whitespace-nowrap rounded-full border px-3 text-[.72rem] font-extrabold sm:inline-flex",
        category === "student" &&
          "border-cyan-200/20 bg-cyan-500/10 text-[#c9f6ff]",
        category === "teacher" &&
          "border-violet-200/25 bg-violet-500/15 text-[#ded9ff]",
        category === "visitor" &&
          "border-blue-200/25 bg-blue-500/15 text-[#d3e0ff]",
      )}
    >
      {categoryLabel(category)} {t("voter")}
    </span>
  );
}

export function GlassNavbar({
  category,
  onLogout,
}: {
  category?: VoterCategory;
  onLogout?: () => void;
}) {
  const { t, categoryLabel } = useVoterLocale();
  return (
    <header className="relative z-25 mx-auto mt-[max(.5rem,env(safe-area-inset-top))] flex min-h-16 w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#080d20]/50 p-2 shadow-[inset_0_1px_hsl(0_0%_100%/.1),0_16px_45px_hsl(235_80%_2%/.24)] backdrop-blur-xl sm:mt-[max(.75rem,env(safe-area-inset-top))] sm:min-h-[4.4rem] sm:w-[min(calc(100%-1.5rem),74rem)] sm:rounded-[1.25rem] sm:px-3">
      <UniversityBrand compact />
      <div className="flex min-w-0 items-center justify-end gap-2">
        <LanguageSwitcher />
        {category && <VoterCategoryBadge category={category} />}
        {category && onLogout && (
          <details className="relative">
            <summary
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center gap-px rounded-full border border-white/15 bg-[#1a2340]/75 [&::-webkit-details-marker]:hidden min-[371px]:h-[2.45rem] min-[371px]:w-[2.45rem]"
              aria-label={t("verifiedSession")}
            >
              <UserRound size={18} />
              <ChevronDown size={14} />
            </summary>
            <div className="absolute right-0 top-[calc(100%+.6rem)] w-52 rounded-2xl border border-white/15 bg-[#090d20]/90 p-4 shadow-[0_18px_45px_#030515aa] backdrop-blur-lg">
              <p className="m-0 text-[.68rem] text-[#909dbb]">
                {t("verifiedSession")}
              </p>
              <strong className="mt-[.2rem] block text-[.85rem]">
                {categoryLabel(category)} {t("voter")}
              </strong>
              <button
                className="mt-[.8rem] flex min-h-10 w-full cursor-pointer items-center gap-2 border-0 border-t border-white/15 bg-transparent text-[.76rem] font-bold text-[#ffb8c1]"
                type="button"
                onClick={onLogout}
              >
                <LogOut size={16} />
                {t("exitPortal")}
              </button>
            </div>
          </details>
        )}
      </div>
    </header>
  );
}

export function VoterStatusBanner({ isOpen }: { isOpen: boolean | null }) {
  const { t } = useVoterLocale();
  return (
    <div
      className={cx(
        "relative z-[1] mx-auto mt-4 flex max-w-6xl items-start gap-3 rounded-2xl border px-4 py-3 text-sm sm:mx-6 lg:mx-auto",
        isOpen === true
          ? "border-emerald-200/20 bg-emerald-400/10 text-[#c8fbe7]"
          : "border-amber-200/25 bg-amber-400/10 text-[#ffe8b0]",
      )}
      role="status"
      aria-live="polite"
    >
      {isOpen === true ? (
        <Check className="mt-0.5 shrink-0 text-emerald-300" size={18} />
      ) : (
        <LockKeyhole className="mt-0.5 shrink-0 text-amber-300" size={18} />
      )}
      <div>
        <strong>
          {isOpen === true
            ? t("votingOpen")
            : isOpen === false
              ? t("votingClosed")
              : t("votingUnknown")}
        </strong>
        <p className="mt-0.5 text-xs text-white/65">
          {isOpen === true
            ? t("votingOpenText")
            : isOpen === false
              ? t("votingClosedText")
              : t("votingUnknownText")}
        </p>
      </div>
    </div>
  );
}

export function VotingPinInput({
  value,
  onChange,
  onSubmit,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const { t } = useVoterLocale();
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const characters = Array.from(
    { length: 7 },
    (_, index) => value[index] || "",
  );

  const setCharacters = (next: string[]) => {
    onChange(
      next
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 7),
    );
  };

  const update = (index: number, input: string) => {
    const character = input
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(-1);

    const next = [...characters];
    next[index] = character;

    setCharacters(next);

    if (character && index < 6) {
      refs.current[index + 1]?.focus();
    }
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 6) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (event.key === "Backspace") {
      // If current input is empty, move to the previous input
      // and clear it.
      if (!characters[index] && index > 0) {
        event.preventDefault();

        const next = [...characters];
        next[index - 1] = "";

        setCharacters(next);

        const previous = refs.current[index - 1];
        previous?.focus();
        previous?.select();
      }
    } else if (event.key === "Enter" && value.length === 7) {
      event.preventDefault();
      onSubmit();
    } else if (event.key.length === 1 && !/[a-z0-9]/i.test(event.key)) {
      event.preventDefault();
    }
  };

  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 7);

    if (!pasted) return;

    event.preventDefault();

    onChange(pasted);

    requestAnimationFrame(() => {
      refs.current[Math.min(pasted.length, 7) - 1]?.focus();
    });
  };

  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      disabled={disabled}
      aria-invalid={invalid}
    >
      <legend className="sr-only">{t("sevenCode")}</legend>

      <div className="grid grid-cols-7 gap-[.18rem] min-[371px]:gap-[.22rem] sm:gap-[clamp(.25rem,1.5vw,.52rem)]">
        {characters.map((character, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={character}
            onChange={(event) => update(index, event.target.value)}
            onKeyDown={(event) => keyDown(event, index)}
            onPaste={paste}
            onFocus={(event) => event.currentTarget.select()}
            inputMode="text"
            pattern="[A-Z0-9]*"
            autoCapitalize="characters"
            spellCheck={false}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={t("character", { number: index + 1 })}
            className={cx(
              "aspect-[.8] max-h-16 min-w-0 w-full rounded-[.55rem] border border-white/20 bg-linear-to-br from-[#26365a]/50 to-[#12152f]/70 text-center text-[clamp(1rem,6vw,1.45rem)] font-extrabold text-white caret-[#69e6ff] shadow-[inset_0_1px_hsl(0_0%_100%/.1)] outline-none transition focus:-translate-y-px focus:border-[#69e6ff] focus:shadow-[0_0_0_3px_hsl(188_100%_65%/.16),inset_0_1px_hsl(0_0%_100%/.16)] sm:rounded-[.7rem]",
              invalid && "border-rose-300/75 bg-none bg-rose-950/20",
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function PinErrorMessage({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success" | "info";
}) {
  return (
    <p
      className={cx(
        "mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-[1.4] [&>svg]:mt-px [&>svg]:shrink-0",
        tone === "error" && "bg-rose-900/25 text-[#ffc6cf]",
        tone === "success" && "bg-emerald-900/25 text-[#bff8e6]",
        tone === "info" && "bg-sky-900/25 text-[#c8eaff]",
      )}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {tone === "success" ? <Check size={17} /> : <ShieldCheck size={17} />}
      {children}
    </p>
  );
}

export function GlassLoginCard({ children }: { children: ReactNode }) {
  const { t } = useVoterLocale();
  return (
    <section className="relative mx-auto w-full max-w-lg animate-rise overflow-hidden rounded-[1.4rem] border border-white/15 bg-linear-to-br from-[#17254b]/75 to-[#090b20]/70 p-[1.1rem] shadow-[inset_0_1px_hsl(0_0%_100%/.15),0_30px_80px_hsl(240_85%_3%/.48)] before:absolute before:inset-x-[20%] before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/50 before:to-transparent sm:rounded-[1.75rem] sm:p-7">
      <img
        className="mx-auto mb-3 block h-[3.4rem] w-[3.4rem] rounded-2xl border border-white/35 object-cover shadow-[0_0_28px_hsl(190_100%_68%/.22)]"
        src="https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748742/UTYCC_tttyy9.jpg"
        alt="University of Technology (Yatanarpon Cyber City) logo"
      />
      <p className="m-0 text-center text-[.68rem] font-extrabold uppercase tracking-[.14em] text-[#69e6ff]">
        {t("projectShow")}
      </p>
      <h1 className="mt-1 text-center text-3xl font-bold tracking-[-.03em]">
        {t("continueVote")}
      </h1>
      <p className="mx-auto mt-2.5 mb-5 max-w-sm text-center text-[.8rem] leading-[1.55] text-[#aeb9d4]">
        {t("enterCode")}
      </p>
      {children}
    </section>
  );
}

export function VotingPortalLogoutDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useVoterLocale();
  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-[#020412bb] p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onCancel()
      }
    >
      <section
        className="relative w-full max-w-[27rem] rounded-[1.4rem] border border-white/15 bg-[#090d20]/90 p-6 shadow-[0_30px_80px_#02030ddd]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <button
          type="button"
          className="absolute top-3 right-3 grid h-10 w-10 cursor-pointer place-items-center rounded-xl border-0 bg-white/5"
          onClick={onCancel}
          aria-label={t("close")}
        >
          <X size={18} />
        </button>
        <span className="grid h-12 w-12 place-items-center rounded-[.9rem] bg-cyan-400/10 text-[#69e6ff]">
          <LockKeyhole />
        </span>
        <h2 className="mt-4 text-2xl font-bold" id="logout-title">
          {t("exitPortal")}?
        </h2>
        <p className="text-sm leading-[1.6] text-[#9eabc6]">{t("security")}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="quiet" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t("exitPortal")}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function GlassProjectCard({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected: boolean;
  onSelect: () => void;
}) {
  const { locale, t } = useVoterLocale();
  return (
    <article
      className={cx(
        "group h-full cursor-pointer overflow-hidden rounded-[1.25rem] border border-white/15 bg-linear-to-br from-[#1c294e]/70 to-[#0c1028]/80 shadow-[inset_0_1px_hsl(0_0%_100%/.07),0_16px_35px_hsl(235_85%_3%/.24)] backdrop-blur-md transition hover:-translate-y-[3px] hover:border-cyan-200/40",
        selected &&
          "-translate-y-[3px] border-[#69e6ff] shadow-[0_0_0_2px_hsl(188_100%_60%/.12),0_16px_42px_hsl(188_90%_40%/.2)]",
      )}
      onClick={onSelect}
      data-testid={`card-project-${project.id}`}
    >
      <div className="relative aspect-[1.48] overflow-hidden bg-[#10172e]">
        <Image
          className="h-full w-full object-cover transition duration-400 group-hover:scale-[1.035]"
          src={project.imageUrl}
          alt={`${project.title} project`}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          quality={60}
        />
        {selected && (
          <b className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-linear-to-r from-[#6c66ff] to-[#29c9e7] px-2 py-1.5 text-[.62rem]">
            <Check size={16} />
            {t("project")} · {t("recorded")}
          </b>
        )}
      </div>
      <div className="flex min-h-[105px] flex-col p-3 sm:min-h-[125px] sm:p-4">
        <p className="m-0 text-[.6rem] font-extrabold uppercase tracking-[.08em] text-[#69e6ff] sm:text-[.62rem]">
          {projectCategoryLabel(project.category, locale)}
        </p>

        <h3 className="mt-2 line-clamp-3 text-xs font-bold leading-snug sm:line-clamp-2 sm:text-lg">
          {project.title}
        </h3>

        <footer className="mt-auto min-w-0 border-t border-white/15 pt-3">
          <span className="block truncate text-[.66rem] font-bold text-[#8492b0]">
            {project.teamName}
          </span>
        </footer>
      </div>
    </article>
  );
}

export function GlassVoteBar({
  project, 
  onCancel,
  onVote,
  busy = false,
}: {
  project: Project;
  onCancel: () => void;
  onVote: () => void;
  busy?: boolean;
}) {
  const { t } = useVoterLocale();
  return (
    <aside
      className="fixed right-1/2 bottom-0 z-30 flex w-full translate-x-1/2 items-center gap-2 border border-x-0 border-b-0 border-cyan-200/20 bg-[#090d20]/85 p-2.5 pb-[max(.65rem,env(safe-area-inset-bottom))] shadow-[0_-10px_50px_hsl(235_90%_2%/.55),inset_0_1px_hsl(0_0%_100%/.1)] backdrop-blur-xl min-[641px]:bottom-[max(1rem,env(safe-area-inset-bottom))] min-[641px]:w-[min(42rem,calc(100%-1.5rem))] min-[641px]:rounded-[1.1rem] min-[641px]:border-x min-[641px]:border-b min-[641px]:p-2.5"
      aria-label={t("project")}
    >
      <Image
        className="h-12 w-12 rounded-xl object-cover min-[641px]:w-14"
        src={project.imageUrl}
        alt=""
        width={56}
        height={48}
        quality={60}
      />
      <p className="m-0 min-w-0 flex-1">
        <span className="hidden text-[.58rem] uppercase text-[#8593b1] min-[371px]:block">
          {t("project")}
        </span>
        <strong className="mt-px block truncate text-[.8rem]">
          {project.title}
        </strong>
      </p>
      <button
        className="hidden min-h-10 cursor-pointer border-0 bg-transparent px-2 text-[.7rem] font-bold text-[#a9b4ce] min-[641px]:block"
        type="button"
        onClick={onCancel}
      >
        {t("cancel")}
      </button>
      <Button disabled={busy} onClick={onVote}>
        {busy ? t("record") : t("confirm")}
      </Button>
    </aside>
  );
}
