"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Facebook,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { TRADES } from "@/lib/trades";
import { UploadButton } from "@/lib/uploadthing";
import { saveStep1, saveStep2, saveStep3, saveStep4, saveGoal } from "./actions";
import { track } from "@/lib/fpixel";
import { cn } from "@/lib/utils";
import { Header, BlueprintGrid, Progress, Field } from "./ui";
import { LfwWizard, type LfwInitial } from "./lfw-wizard";
import type { AccountGoal } from "@/lib/db/schema";

type State = {
  name: string;
  trade: string;
  phone: string;
  whatsappNumber: string;
  location: string;
  profilePhotoUrl: string;
  about: string;
  slug: string;
};

type WizardInitial = State & {
  accountGoal: AccountGoal;
  lfw: LfwInitial;
};

const STEPS: { n: number; tag: string; title: string }[] = [
  { n: 1, tag: "Business", title: "What's your business?" },
  { n: 2, tag: "Reach", title: "How do customers reach you?" },
  { n: 3, tag: "Photo", title: "Put a face to the name" },
  { n: 4, tag: "About", title: "Tell them about yourself" },
  { n: 5, tag: "Live", title: "You're live" },
];

export function OnboardingWizard({ initial }: { initial: WizardInitial }) {
  const router = useRouter();
  const [chosen, setChosen] = useState(false);
  const [goal, setGoal] = useState<AccountGoal>(initial.accountGoal);
  const [step, setStep] = useState(1);
  const [state, setState] = useState<State>(initial);
  const [isPending, startTransition] = useTransition();

  const totalSteps = STEPS.length;

  // First screen: pick a goal. Always shown on entry so a returning,
  // not-yet-onboarded user can still change their mind.
  if (!chosen) {
    return (
      <GoalChooser
        goal={goal}
        setGoal={setGoal}
        isPending={isPending}
        onContinue={() => {
          startTransition(async () => {
            await saveGoal(goal);
            setChosen(true);
          });
        }}
      />
    );
  }

  if (goal === "looking_for_work") {
    return <LfwWizard initial={initial.lfw} />;
  }

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  async function submitStep() {
    if (step === 1) {
      if (!state.name.trim() || !state.trade) {
        toast.error("Add your business name and pick a trade.");
        return;
      }
      startTransition(async () => {
        const res = await saveStep1({
          name: state.name.trim(),
          trade: state.trade,
        });
        if (res.slug) update("slug", res.slug);
        next();
      });
    } else if (step === 2) {
      if (!state.phone.trim() || !state.location.trim()) {
        toast.error("Phone and location are needed.");
        return;
      }
      startTransition(async () => {
        await saveStep2({
          phone: state.phone.trim(),
          whatsappNumber: state.whatsappNumber.trim(),
          location: state.location.trim(),
        });
        next();
      });
    } else if (step === 3) {
      startTransition(async () => {
        await saveStep3({ profilePhotoUrl: state.profilePhotoUrl });
        next();
      });
    } else if (step === 4) {
      // About is optional per PRD §4.1 step 4
      startTransition(async () => {
        await saveStep4({ about: state.about.trim() });
        // Profile is now live — this is the signup conversion we optimise ads for.
        track("CompleteRegistration");
        next();
      });
    } else {
      router.push("/dashboard");
    }
  }

  const current = STEPS[step - 1];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <BlueprintGrid />
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pt-6 pb-10">
        <Header />

        <Progress step={step} total={totalSteps} current={current.tag} />

        <div className="mt-8 flex-1">
          {step === 1 && <Step1 state={state} update={update} />}
          {step === 2 && <Step2 state={state} update={update} />}
          {step === 3 && <Step3 state={state} update={update} />}
          {step === 4 && <Step4 state={state} update={update} />}
          {step === 5 && <Step5 slug={state.slug} state={state} />}
        </div>

        <div className="mt-10">
          {step < totalSteps ? (
            <button
              onClick={submitStep}
              disabled={isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-6 py-5 text-xl font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-1 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={submitStep}
              disabled={isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white bg-white px-6 py-5 text-xl font-bold text-ink-900 transition hover:bg-white/90 active:translate-y-1 disabled:opacity-60"
            >
              Go to dashboard
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </button>
          )}
          {step > 1 && step < totalSteps && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="mt-4 w-full text-center text-sm text-white/60 hover:text-white"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Goal chooser — the new first screen                                */
/* ------------------------------------------------------------------ */
function GoalChooser({
  goal,
  setGoal,
  isPending,
  onContinue,
}: {
  goal: AccountGoal;
  setGoal: (g: AccountGoal) => void;
  isPending: boolean;
  onContinue: () => void;
}) {
  const options: { value: AccountGoal; title: string; sub: string }[] = [
    {
      value: "looking_for_work",
      title: "I'm looking for work",
      sub: "Show your quals and get hired",
    },
    {
      value: "business",
      title: "I'm promoting my business",
      sub: "Win customers for your trade",
    },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <BlueprintGrid />
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pt-6 pb-10">
        <Header />

        <div className="mt-8 flex-1">
          <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
            What brings <br />
            <span className="text-brand">you here?</span>
          </h1>
          <p className="mt-3 text-white/60">Pick the one that fits you.</p>

          <div className="mt-8 space-y-3">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setGoal(o.value)}
                className={cn(
                  "w-full rounded-xl border-2 px-5 py-5 text-left transition active:translate-y-0.5",
                  goal === o.value
                    ? "border-2 border-ink-900 bg-brand text-ink-900"
                    : "border-white/15 bg-white/[0.04] text-white hover:border-white"
                )}
              >
                <div className="text-lg font-bold">{o.title}</div>
                <div
                  className={cn(
                    "mt-0.5 text-sm",
                    goal === o.value ? "text-ink-900/70" : "text-white/50"
                  )}
                >
                  {o.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={onContinue}
            disabled={isPending}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-6 py-5 text-xl font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Who are you?                                              */
/* ------------------------------------------------------------------ */
function Step1({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        What&apos;s your <br />
        <span className="text-brand">business?</span>
      </h1>
      <p className="mt-3 text-white/60">This goes big at the top of your page.</p>

      <div className="mt-8 space-y-6">
        <Field
          label="Business name"
          hint="Sole trader? Just use your name"
        >
          <input
            type="text"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Dave Wilson Plumbing"
            autoFocus
            className="w-full rounded-xl border-2 border-white/20 bg-white/[0.04] px-5 py-4 text-lg text-white placeholder:text-white/30 transition focus:border-brand focus:bg-white/[0.08] focus:outline-none"
          />
        </Field>
        <Field label="Trade">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRADES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("trade", t)}
                className={cn(
                  "rounded-lg border-2 px-3 py-3 text-left text-[13px] font-bold leading-tight transition",
                  state.trade === t
                    ? "border-ink-900 bg-brand text-ink-900"
                    : "border-white/15 bg-white/[0.04] text-white/80 hover:border-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — How do customers reach you?                               */
/* ------------------------------------------------------------------ */
function Step2({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        How do customers <br />
        <span className="text-brand">reach you?</span>
      </h1>
      <p className="mt-3 text-white/60">
        Your phone, WhatsApp and the town you cover.
      </p>

      <div className="mt-8 space-y-5">
        <Field label="Phone number">
          <input
            type="tel"
            value={state.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="07700 900123"
            className="w-full rounded-xl border-2 border-white/20 bg-white/[0.04] px-5 py-4 text-lg text-white placeholder:text-white/30 transition focus:border-brand focus:bg-white/[0.08] focus:outline-none"
          />
        </Field>
        <Field label="WhatsApp" hint="Defaults to your phone if blank">
          <input
            type="tel"
            value={state.whatsappNumber}
            onChange={(e) => update("whatsappNumber", e.target.value)}
            placeholder="07700 900123"
            className="w-full rounded-xl border-2 border-white/20 bg-white/[0.04] px-5 py-4 text-lg text-white placeholder:text-white/30 transition focus:border-brand focus:bg-white/[0.08] focus:outline-none"
          />
        </Field>
        <Field label="Town or city">
          <input
            type="text"
            value={state.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Manchester"
            className="w-full rounded-xl border-2 border-white/20 bg-white/[0.04] px-5 py-4 text-lg text-white placeholder:text-white/30 transition focus:border-brand focus:bg-white/[0.08] focus:outline-none"
          />
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Put a face to the name                                    */
/* ------------------------------------------------------------------ */
function Step3({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  const initial = (state.name?.[0] ?? "T").toUpperCase();

  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        Put a face to <br />
        <span className="text-brand">the name.</span>
      </h1>
      <p className="mt-3 text-white/60">
        Tradesmen with a photo get 3× more enquiries.
      </p>

      <div className="mt-10 flex flex-col items-center gap-7">
        {state.profilePhotoUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.profilePhotoUrl}
              alt="profile"
              className="h-44 w-44 rounded-full border-[5px] border-brand object-cover"
            />
            <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink-900 bg-call">
              <Check className="h-5 w-5 text-white" strokeWidth={3} />
            </div>
          </div>
        ) : (
          <div className="flex h-44 w-44 items-center justify-center rounded-full border-[5px] border-brand bg-ink-800 font-display text-6xl text-brand">
            {initial}
          </div>
        )}

        <UploadButton
          endpoint="profilePhoto"
          appearance={{
            button:
              "ut-ready:bg-white ut-uploading:opacity-60 bg-white text-ink-900 rounded-xl px-6 py-4 text-base font-bold border-2 border-white",
            allowedContent: "text-white/50 text-sm",
          }}
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              update("profilePhotoUrl", res[0].url);
              toast.success("Photo uploaded");
            }
          }}
          onUploadError={(err) => {
            toast.error(err.message);
          }}
        />
        <p className="text-center text-sm text-white/40">
          Optional — you can skip and add a photo later from your dashboard.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Tell them about yourself                                  */
/* ------------------------------------------------------------------ */
function Step4({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  const remaining = 280 - state.about.length;
  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        Tell them about <br />
        <span className="text-brand">yourself.</span>
      </h1>
      <p className="mt-3 text-white/60">
        Two lines. Years on the tools, what you do best, where you cover.
      </p>

      <div className="mt-8 space-y-3">
        <textarea
          value={state.about}
          onChange={(e) => update("about", e.target.value.slice(0, 280))}
          rows={6}
          maxLength={280}
          placeholder="Been a plumber for 15 years. Based in Manchester. No job too small."
          className="w-full rounded-2xl border-2 border-white/10 bg-white/5 px-5 py-4 text-lg leading-relaxed text-white placeholder:text-white/30 focus:border-brand focus:bg-white/10 focus:outline-none"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Optional — skip if you'd rather.</span>
          <span
            className={cn(
              "font-mono",
              remaining < 40 ? "text-brand" : "text-white/40"
            )}
          >
            {state.about.length}/280
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — You're live                                               */
/* ------------------------------------------------------------------ */
function Step5({ slug, state }: { slug: string; state: State }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${slug}`
      : `/t/${slug}`;
  const path = `mytradelink.page/t/${slug}`;

  const shareText = `Here's my page — ${path}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;

  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-ink-900 bg-brand text-ink-900 ring-2 ring-white/15">
          <Check className="h-7 w-7" strokeWidth={3} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">
            All done
          </div>
          <h1 className="font-display text-3xl leading-tight tracking-tight md:text-4xl">
            You&apos;re live, {state.name?.split(" ")[0] || "mate"}.
          </h1>
        </div>
      </div>

      <p className="text-white/70">
        Share this link everywhere — your van, WhatsApp bio, Facebook, business
        cards. Update your page once, the link stays the same.
      </p>

      {/* URL card */}
      <div className="mt-7 overflow-hidden rounded-xl border-2 border-white/25 bg-white/[0.04]">
        <div className="flex items-center gap-1.5 border-b-2 border-white/15 bg-white/[0.06] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-brand" />
          <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
            Your link
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex min-w-0 items-baseline gap-1 truncate font-mono text-base">
            <span className="text-white/45">mytradelink.page/t/</span>
            <span className="font-bold text-brand">{slug}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success("Link copied");
            }}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border-2 border-white bg-white px-3 py-2 text-xs font-bold text-ink-900 transition active:translate-y-0.5 hover:bg-white/90"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-whatsapp px-4 py-4 text-base font-bold text-white transition active:translate-y-1 hover:brightness-110"
        >
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-fb px-4 py-4 text-base font-bold text-white transition active:translate-y-1 hover:brightness-110"
        >
          <Facebook className="h-5 w-5" /> Facebook
        </a>
      </div>

      <a
        href={`/t/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white/20 bg-white/[0.04] px-4 py-3.5 text-sm font-bold text-white/80 transition hover:border-white hover:text-white"
      >
        <ExternalLink className="h-4 w-4" /> Open my page
      </a>
    </div>
  );
}

