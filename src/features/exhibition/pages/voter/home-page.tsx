"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { voterApi } from "../../data/voter-api";
import {
  GlassLoginCard,
  GlassNavbar,
  PinErrorMessage,
  VotingPinInput,
  ambient,
  primaryButton,
  voterPage,
} from "../../components/voter-portal";
import { useVoterLocale } from '../../i18n';

export function HomePage() {
  const { t, categoryLabel } = useVoterLocale();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success">(
    "idle",
  );
  const [error, setError] = useState<"invalid" | "rate_limited" | "network-error" | "">("");
  const [category, setCategory] = useState("");

  const changePin = (value: string) => {
    setPin(value);
    setError("");
    setStatus("idle");
  };
  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (pin.length !== 7 || status === "verifying") return;
    setError("");
    setStatus("verifying");
    try {
      const { session } = await voterApi.verifyCode(pin);
      setCategory(categoryLabel(session.category));
      setStatus("success");
      setTimeout(() => router.replace("/projects"), 650);
    } catch (failure) {
      const reason =
        failure instanceof Error ? failure.message : "network-error";
      setStatus("idle");
      setError(
        reason === "rate_limited"
          ? "rate_limited"
          : reason === "invalid_code"
            ? "invalid"
            : "network-error",
      );
    }
  };

  return (
    <main className={voterPage}>
      <div
        className={`${ambient} top-[8%] -right-48 h-[min(48vw,34rem)] w-[min(48vw,34rem)] bg-[radial-gradient(circle,hsl(260_85%_65%/.42),transparent_68%)]`}
      />
      <div
        className={`${ambient} bottom-[2%] -left-40 h-[min(42vw,28rem)] w-[min(42vw,28rem)] bg-[radial-gradient(circle,hsl(188_100%_60%/.3),transparent_68%)] [animation-delay:-4s]`}
      />
      <div
        className={`${ambient} top-[48%] left-[48%] h-56 w-56 bg-[radial-gradient(circle,hsl(220_100%_70%/.2),transparent_68%)] [animation-delay:-8s]`}
      />
      <GlassNavbar />
      <div className="relative z-[1] mx-auto grid w-[min(calc(100%-1.25rem),32rem)] items-center gap-8 py-8 min-[760px]:min-h-[calc(100dvh-9rem)] min-[760px]:w-[min(calc(100%-2rem),70rem)] min-[760px]:grid-cols-[1fr_minmax(28rem,32rem)] min-[760px]:gap-[clamp(2rem,7vw,6rem)] min-[760px]:py-12">
        <div className="animate-rise text-center min-[760px]:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-900/10 px-3 py-2 text-[.68rem] font-extrabold uppercase tracking-[.08em] text-[#b4ecf8]">
            <Sparkles size={15} />
            {t('projectShow')}
          </span>
          <h2 className="mt-5 text-[clamp(1.55rem,7.8vw,3.25rem)] leading-[1.08] tracking-[-.035em]">
            {t('homeTitle')}
            <br />
            {t('homeSubtitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[.92rem] leading-[1.65] text-[#aab5d0] min-[760px]:ml-0">
            {t('homeDescription')}
          </p>
        </div>
        <GlassLoginCard>
          <form onSubmit={submit} noValidate>
            <VotingPinInput
              value={pin}
              onChange={changePin}
              onSubmit={submit}
              disabled={status === "verifying" || status === "success"}
              invalid={Boolean(error)}
            />
            {error && <PinErrorMessage>{error === 'invalid' ? t('invalidCode') : error === 'rate_limited' ? t('rateLimited') : t('serviceUnavailable')}</PinErrorMessage>}
            {status === "success" && (
              <PinErrorMessage tone="success">
                {t('welcome', { category })}
              </PinErrorMessage>
            )}
            <button
              className={primaryButton}
              type="submit"
              disabled={pin.length !== 7 || status !== "idle"}
            >
              {status === "verifying" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  {t('verifying')}
                </>
              ) : status === "success" ? (
                <>
                  <ShieldCheck size={18} />
                  {t('codeVerified')}
                </>
              ) : (
                t('continueVote')
              )}
            </button>
          </form>
          <p className="mx-auto mt-3.5 flex items-start justify-center gap-1.5 text-center text-[.68rem] leading-[1.4] text-[#929ebb] [&>svg]:shrink-0">
            <LockKeyhole size={15} />
            {t('security')}
          </p>
        </GlassLoginCard>
      </div>
      <footer className="relative z-[1] px-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] text-center text-[.65rem] text-[#72809f]">
        {t('secureFooter')}
      </footer>
    </main>
  );
}
