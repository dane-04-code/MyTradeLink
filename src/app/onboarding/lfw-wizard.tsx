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
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TRADES } from "@/lib/trades";
import { UploadButton } from "@/lib/uploadthing";
import { QUALS_BY_COUNTRY, QUAL_COUNTRIES, type QualCountry } from "@/lib/quals";
import { track } from "@/lib/fpixel";
import { cn } from "@/lib/utils";
import { Header, BlueprintGrid, Progress, Field } from "./ui";
import { saveLfwBasics, finishLfwOnboarding } from "./actions";
import {
  addQualification,
  deleteQualification,
  addEducation,
  deleteEducation,
  addSkill,
  deleteSkill,
  addPhoto,
  deletePhoto,
} from "./lfw-actions";

export type LfwInitial = {
  name: string;
  trade: string;
  location: string;
  slug: string;
  qualifications: { id: number; name: string; badgeUrl: string | null }[];
  education: {
    id: number;
    institution: string;
    qualification: string | null;
    startYear: number | null;
    endYear: number | null;
  }[];
  skills: { id: number; name: string }[];
  photos: { id: number; photoUrl: string }[];
};

const STEPS: { n: number; tag: string }[] = [
  { n: 1, tag: "Basics" },
  { n: 2, tag: "Quals" },
  { n: 3, tag: "Training" },
  { n: 4, tag: "Skills" },
  { n: 5, tag: "Photos" },
  { n: 6, tag: "Live" },
];

const inputClass =
  "w-full rounded-xl border-2 border-white/20 bg-white/[0.04] px-5 py-4 text-lg text-white placeholder:text-white/30 transition focus:border-brand focus:bg-white/[0.08] focus:outline-none";

export function LfwWizard({ initial }: { initial: LfwInitial }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Basics
  const [name, setName] = useState(initial.name);
  const [trade, setTrade] = useState(initial.trade);
  const [location, setLocation] = useState(initial.location);
  const [slug, setSlug] = useState(initial.slug);

  // Lists
  const [quals, setQuals] = useState(initial.qualifications);
  const [edu, setEdu] = useState(initial.education);
  const [skills, setSkills] = useState(initial.skills);
  const [photos, setPhotos] = useState(initial.photos);

  const totalSteps = STEPS.length;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function submitStep() {
    if (step === 1) {
      if (!name.trim() || !trade) {
        toast.error("Add your name and pick a trade.");
        return;
      }
      if (!location.trim()) {
        toast.error("Add the town or city you're in.");
        return;
      }
      startTransition(async () => {
        const res = await saveLfwBasics({
          name: name.trim(),
          trade,
          location: location.trim(),
        });
        if (res.slug) setSlug(res.slug);
        next();
      });
    } else if (step === 5) {
      // Photos optional — finish onboarding here, before the live screen.
      startTransition(async () => {
        await finishLfwOnboarding();
        track("CompleteRegistration");
        next();
      });
    } else {
      // Steps 2, 3, 4 save inline via their own server actions; just advance.
      next();
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
          {step === 1 && (
            <StepBasics
              name={name}
              setName={setName}
              trade={trade}
              setTrade={setTrade}
              location={location}
              setLocation={setLocation}
            />
          )}
          {step === 2 && (
            <StepQuals quals={quals} setQuals={setQuals} />
          )}
          {step === 3 && <StepEducation edu={edu} setEdu={setEdu} />}
          {step === 4 && <StepSkills skills={skills} setSkills={setSkills} />}
          {step === 5 && <StepPhotos photos={photos} setPhotos={setPhotos} />}
          {step === 6 && <StepLive slug={slug} name={name} />}
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
              onClick={() => router.push("/dashboard")}
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
/* Step 1 — Basics                                                    */
/* ------------------------------------------------------------------ */
function StepBasics({
  name,
  setName,
  trade,
  setTrade,
  location,
  setLocation,
}: {
  name: string;
  setName: (v: string) => void;
  trade: string;
  setTrade: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        Let&apos;s get the <br />
        <span className="text-brand">basics down.</span>
      </h1>
      <p className="mt-3 text-white/60">This goes at the top of your page.</p>

      <div className="mt-8 space-y-6">
        <Field label="Your name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jack Wilson"
            autoFocus
            className={inputClass}
          />
        </Field>
        <Field label="Trade">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRADES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrade(t)}
                className={cn(
                  "rounded-lg border-2 px-3 py-3 text-left text-[13px] font-bold leading-tight transition",
                  trade === t
                    ? "border-ink-900 bg-brand text-ink-900"
                    : "border-white/15 bg-white/[0.04] text-white/80 hover:border-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Town or city">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Manchester"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Qualifications                                            */
/* ------------------------------------------------------------------ */
function StepQuals({
  quals,
  setQuals,
}: {
  quals: LfwInitial["qualifications"];
  setQuals: React.Dispatch<React.SetStateAction<LfwInitial["qualifications"]>>;
}) {
  const [country, setCountry] = useState<QualCountry>("UK");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const have = new Set(quals.map((q) => q.name.toLowerCase()));

  async function add(nameRaw: string, badgeUrl?: string) {
    const name = nameRaw.trim();
    if (!name) return;
    if (have.has(name.toLowerCase()) && !badgeUrl) {
      toast.error("Already added.");
      return;
    }
    setBusy(true);
    try {
      const row = await addQualification({ name, badgeUrl });
      setQuals((q) => [...q, { id: row.id, name: row.name, badgeUrl: row.badgeUrl }]);
      setCustom("");
    } catch {
      toast.error("Could not add that.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setQuals((q) => q.filter((x) => x.id !== id));
    await deleteQualification(id);
  }

  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        Your <span className="text-brand">qualifications.</span>
      </h1>
      <p className="mt-3 text-white/60">
        Tap the ones you&apos;ve got. These prove you&apos;re legit.
      </p>

      <div className="mt-8 space-y-6">
        {/* Country toggle */}
        <div className="inline-flex rounded-xl border-2 border-white/15 bg-white/[0.04] p-1">
          {QUAL_COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCountry(c)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-bold transition",
                country === c
                  ? "bg-brand text-ink-900"
                  : "text-white/60 hover:text-white"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Quick-add chips */}
        <Field label="Quick add">
          <div className="flex flex-wrap gap-2">
            {QUALS_BY_COUNTRY[country].map((q) => {
              const added = have.has(q.toLowerCase());
              return (
                <button
                  key={q}
                  type="button"
                  disabled={busy || added}
                  onClick={() => add(q)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed",
                    added
                      ? "border-ink-900 bg-brand text-ink-900 opacity-70"
                      : "border-white/15 bg-white/[0.04] text-white/80 hover:border-white"
                  )}
                >
                  {added ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {q}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Custom add */}
        <Field label="Add your own" hint="Plus an optional photo of the card">
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add(custom);
                }
              }}
              placeholder="e.g. SMSTS"
              className={inputClass}
            />
            <button
              type="button"
              disabled={busy || !custom.trim()}
              onClick={() => add(custom)}
              className="flex-shrink-0 rounded-xl border-2 border-white bg-white px-5 text-base font-bold text-ink-900 transition active:translate-y-0.5 hover:bg-white/90 disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <div className="mt-3">
            <UploadButton
              endpoint="certification"
              appearance={{
                button:
                  "ut-ready:bg-white/[0.06] ut-uploading:opacity-60 bg-white/[0.06] text-white rounded-xl px-5 py-3 text-sm font-bold border-2 border-white/20",
                allowedContent: "text-white/40 text-xs",
              }}
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) {
                  const label = custom.trim() || "Card / badge";
                  add(label, res[0].url);
                  toast.success("Card added");
                }
              }}
              onUploadError={(err) => {
                toast.error(err.message);
              }}
            />
          </div>
        </Field>

        {/* Added chips */}
        {quals.length > 0 && (
          <Field label="Added">
            <div className="flex flex-wrap gap-2">
              {quals.map((q) => (
                <span
                  key={q.id}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-ink-900 bg-brand px-3 py-2.5 text-sm font-bold text-ink-900"
                >
                  {q.badgeUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.badgeUrl}
                      alt=""
                      className="h-5 w-5 rounded object-cover"
                    />
                  )}
                  {q.name}
                  <button
                    type="button"
                    onClick={() => remove(q.id)}
                    className="-mr-1 ml-0.5 rounded p-0.5 hover:bg-ink-900/10"
                    aria-label={`Remove ${q.name}`}
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          </Field>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Education                                                 */
/* ------------------------------------------------------------------ */
function StepEducation({
  edu,
  setEdu,
}: {
  edu: LfwInitial["education"];
  setEdu: React.Dispatch<React.SetStateAction<LfwInitial["education"]>>;
}) {
  const [institution, setInstitution] = useState("");
  const [qualification, setQualification] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [busy, setBusy] = useState(false);

  function parseYear(v: string): number | null {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 1950 && n < 2100 ? n : null;
  }

  async function add() {
    if (!institution.trim()) {
      toast.error("Add the college or training place.");
      return;
    }
    setBusy(true);
    try {
      const row = await addEducation({
        institution: institution.trim(),
        qualification: qualification.trim() || undefined,
        startYear: parseYear(startYear),
        endYear: parseYear(endYear),
      });
      setEdu((e) => [
        ...e,
        {
          id: row.id,
          institution: row.institution,
          qualification: row.qualification,
          startYear: row.startYear,
          endYear: row.endYear,
        },
      ]);
      setInstitution("");
      setQualification("");
      setStartYear("");
      setEndYear("");
    } catch {
      toast.error("Could not add that.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setEdu((e) => e.filter((x) => x.id !== id));
    await deleteEducation(id);
  }

  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        Training &amp; <span className="text-brand">education.</span>
      </h1>
      <p className="mt-3 text-white/60">College, course, the years you did it.</p>

      <div className="mt-8 space-y-5">
        <Field label="College or training place">
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Manchester College"
            className={inputClass}
          />
        </Field>
        <Field label="Course" hint="Optional">
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            placeholder="Level 3 NVQ Plumbing"
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" hint="Year">
            <input
              type="number"
              inputMode="numeric"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="2021"
              className={inputClass}
            />
          </Field>
          <Field label="To" hint="Year">
            <input
              type="number"
              inputMode="numeric"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="2023"
              className={inputClass}
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={busy || !institution.trim()}
          onClick={add}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/[0.04] px-4 py-3.5 text-base font-bold text-white transition hover:border-white disabled:opacity-50"
        >
          <Plus className="h-5 w-5" /> Add
        </button>

        {edu.length > 0 && (
          <div className="space-y-2">
            {edu.map((e) => (
              <div
                key={e.id}
                className="flex items-start justify-between gap-3 rounded-xl border-2 border-white/15 bg-white/[0.04] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-bold text-white">
                    {e.institution}
                  </div>
                  {e.qualification && (
                    <div className="truncate text-sm text-white/60">
                      {e.qualification}
                    </div>
                  )}
                  {(e.startYear || e.endYear) && (
                    <div className="mt-0.5 text-xs text-white/40">
                      {e.startYear ?? ""}
                      {e.startYear && e.endYear ? " – " : ""}
                      {e.endYear ?? ""}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="flex-shrink-0 rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Skills                                                    */
/* ------------------------------------------------------------------ */
function StepSkills({
  skills,
  setSkills,
}: {
  skills: LfwInitial["skills"];
  setSkills: React.Dispatch<React.SetStateAction<LfwInitial["skills"]>>;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    const name = value.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Already added.");
      return;
    }
    setBusy(true);
    try {
      const row = await addSkill(name);
      setSkills((s) => [...s, { id: row.id, name: row.serviceName }]);
      setValue("");
    } catch {
      toast.error("Could not add that.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setSkills((s) => s.filter((x) => x.id !== id));
    await deleteSkill(id);
  }

  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        What can you <span className="text-brand">do?</span>
      </h1>
      <p className="mt-3 text-white/60">
        Add your skills. One tap each, keep it short.
      </p>

      <div className="mt-8 space-y-6">
        <Field label="Add a skill">
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder="First fix"
              autoFocus
              className={inputClass}
            />
            <button
              type="button"
              disabled={busy || !value.trim()}
              onClick={add}
              className="flex-shrink-0 rounded-xl border-2 border-white bg-white px-5 text-base font-bold text-ink-900 transition active:translate-y-0.5 hover:bg-white/90 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </Field>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-ink-900 bg-brand px-3 py-2.5 text-sm font-bold text-ink-900"
              >
                {s.name}
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="-mr-1 ml-0.5 rounded p-0.5 hover:bg-ink-900/10"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Photos (optional)                                         */
/* ------------------------------------------------------------------ */
function StepPhotos({
  photos,
  setPhotos,
}: {
  photos: LfwInitial["photos"];
  setPhotos: React.Dispatch<React.SetStateAction<LfwInitial["photos"]>>;
}) {
  const [busy, setBusy] = useState(false);

  async function add(url: string) {
    setBusy(true);
    try {
      const row = await addPhoto({ photoUrl: url });
      setPhotos((p) => [...p, { id: row.id, photoUrl: row.photoUrl }]);
    } catch {
      toast.error("Could not save that photo.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setPhotos((p) => p.filter((x) => x.id !== id));
    await deletePhoto(id);
  }

  return (
    <div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
        Show your <span className="text-brand">work.</span>
      </h1>
      <p className="mt-3 text-white/60">
        Photos of jobs or training. Optional — you can add these later.
      </p>

      <div className="mt-8 space-y-6">
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photoUrl}
                  alt=""
                  className="aspect-square w-full rounded-xl border-2 border-white/15 object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink-900 bg-white text-ink-900 hover:bg-white/90"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <UploadButton
            endpoint="gallery"
            appearance={{
              button:
                "ut-ready:bg-white ut-uploading:opacity-60 bg-white text-ink-900 rounded-xl px-6 py-4 text-base font-bold border-2 border-white",
              allowedContent: "text-white/50 text-sm",
            }}
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                res.forEach((f) => {
                  if (f.url) add(f.url);
                });
                toast.success("Photos uploaded");
              }
            }}
            onUploadError={(err) => {
              toast.error(err.message);
            }}
          />
          {busy && (
            <span className="text-sm text-white/40">Saving…</span>
          )}
          <p className="text-center text-sm text-white/40">
            Optional — skip and add photos later from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 6 — You're live                                               */
/* ------------------------------------------------------------------ */
function StepLive({ slug, name }: { slug: string; name: string }) {
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
            You&apos;re live, {name?.split(" ")[0] || "mate"}.
          </h1>
        </div>
      </div>

      <p className="text-white/70">
        Share this link everywhere — your TikTok bio, WhatsApp, job applications,
        text it to a gaffer. Update your page once, the link stays the same.
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
