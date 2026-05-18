"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TRADES } from "@/lib/trades";
import { UploadButton } from "@/lib/uploadthing";
import { saveStep1, saveStep2, saveStep3, saveStep4 } from "./actions";
import { cn } from "@/lib/utils";

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

export function OnboardingWizard({ initial }: { initial: State }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<State>(initial);
  const [isPending, startTransition] = useTransition();

  const totalSteps = 5;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function submitStep() {
    if (step === 1) {
      if (!state.name.trim() || !state.trade) {
        toast.error("Add your name and pick a trade.");
        return;
      }
      startTransition(async () => {
        const res = await saveStep1({ name: state.name.trim(), trade: state.trade });
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
      if (!state.about.trim()) {
        toast.error("Write a quick line or two so customers know who they're calling.");
        return;
      }
      startTransition(async () => {
        await saveStep4({ about: state.about.trim() });
        next();
      });
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pt-8 pb-12">
      {/* Progress */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between text-sm text-white/60">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        {step === 1 && <Step1 state={state} update={update} />}
        {step === 2 && <Step2 state={state} update={update} />}
        {step === 3 && <Step3 state={state} update={update} />}
        {step === 4 && <Step4 state={state} update={update} />}
        {step === 5 && <Step5 slug={state.slug} />}
      </div>

      <div className="mt-10">
        <button
          onClick={submitStep}
          disabled={isPending}
          className="btn-primary w-full text-xl py-5"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : step === totalSteps ? (
            <>Go to dashboard <ArrowRight className="ml-2 h-5 w-5" /></>
          ) : (
            <>Continue <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </button>
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
  );
}

function Step1({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">
        What's your name<br />and trade?
      </h1>
      <p className="mt-3 text-white/60">This goes on your public page.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="label text-white">Your name</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Dave Wilson"
            autoFocus
            className="input bg-white/5 text-white border-white/10 placeholder:text-white/30 focus:bg-white/10"
          />
        </div>
        <div>
          <label className="label text-white">Your trade</label>
          <div className="grid grid-cols-2 gap-3">
            {TRADES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("trade", t)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-4 text-left text-base font-semibold transition",
                  state.trade === t
                    ? "border-brand bg-brand/10 text-white"
                    : "border-white/10 text-white/80 hover:border-white/30"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">
        How do customers<br />reach you?
      </h1>
      <p className="mt-3 text-white/60">Your phone, WhatsApp and where you work.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="label text-white">Phone number</label>
          <input
            type="tel"
            value={state.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="07700 900123"
            className="input bg-white/5 text-white border-white/10 placeholder:text-white/30 focus:bg-white/10"
          />
        </div>
        <div>
          <label className="label text-white">WhatsApp (optional)</label>
          <input
            type="tel"
            value={state.whatsappNumber}
            onChange={(e) => update("whatsappNumber", e.target.value)}
            placeholder="07700 900123"
            className="input bg-white/5 text-white border-white/10 placeholder:text-white/30 focus:bg-white/10"
          />
        </div>
        <div>
          <label className="label text-white">Location (town or city)</label>
          <input
            type="text"
            value={state.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Manchester"
            className="input bg-white/5 text-white border-white/10 placeholder:text-white/30 focus:bg-white/10"
          />
        </div>
      </div>
    </div>
  );
}

function Step3({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">
        Add a photo of you
      </h1>
      <p className="mt-3 text-white/60">A real face builds trust faster than anything else.</p>

      <div className="mt-8 flex flex-col items-center gap-6">
        {state.profilePhotoUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.profilePhotoUrl}
              alt="profile"
              className="h-48 w-48 rounded-full object-cover ring-4 ring-brand"
            />
            <div className="absolute -bottom-2 -right-2 rounded-full bg-brand p-2 shadow-glow">
              <Check className="h-5 w-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-dashed border-white/20 text-white/40">
            No photo yet
          </div>
        )}

        <UploadButton
          endpoint="profilePhoto"
          appearance={{
            button:
              "ut-ready:bg-brand ut-uploading:opacity-60 bg-brand text-white rounded-2xl px-6 py-4 text-lg font-semibold",
            allowedContent: "text-white/50 text-sm",
          }}
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              update("profilePhotoUrl", res[0].url);
              toast.success("Photo uploaded");
            }
          }}
          onUploadError={(err) => { toast.error(err.message); }}
        />
        <p className="text-center text-sm text-white/40">
          You can skip and add this later.
        </p>
      </div>
    </div>
  );
}

function Step4({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(key: K, value: State[K]) => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">
        Tell customers about you
      </h1>
      <p className="mt-3 text-white/60">Two lines. Keep it real, keep it short.</p>

      <div className="mt-8 space-y-5">
        <textarea
          value={state.about}
          onChange={(e) => update("about", e.target.value)}
          rows={5}
          placeholder="Local plumber based in Manchester with 12 years' experience. I do reliable work, turn up when I say I will, and charge fair prices."
          className="input min-h-[160px] bg-white/5 text-white border-white/10 placeholder:text-white/30 focus:bg-white/10"
        />
        <p className="text-sm text-white/40">
          {state.about.length}/300 characters
        </p>
      </div>
    </div>
  );
}

function Step5({ slug }: { slug: string }) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/t/${slug}`;
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand shadow-glow">
        <Check className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold md:text-4xl">Your page is live</h1>
      <p className="mt-3 text-white/60">Share this link everywhere — your van, WhatsApp, Facebook bio, business cards.</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-wide text-white/40">Your link</div>
        <div className="mt-1 truncate text-lg font-semibold text-brand">{url}</div>
      </div>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          toast.success("Link copied");
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base font-medium text-white hover:bg-white/10"
      >
        <Copy className="h-4 w-4" /> Copy link
      </button>

      <a
        href={`/t/${slug}`}
        target="_blank"
        className="mt-3 block text-sm text-white/60 hover:text-white"
      >
        Open my page →
      </a>
    </div>
  );
}
