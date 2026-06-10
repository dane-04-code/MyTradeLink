"use client";

import { useState, useTransition } from "react";
import { Plus, Trash, GraduationCap, Wrench } from "lucide-react";
import { toast } from "sonner";

import type { FullProfile } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { QUALS_BY_COUNTRY, QUAL_COUNTRIES, type QualCountry } from "@/lib/quals";
import {
  addEducation,
  updateEducation,
  deleteEducation,
  addSkill,
  deleteSkill,
  addQualification,
} from "@/app/onboarding/lfw-actions";

/**
 * The looking-for-work-only editors: Training & education, Skills, plus a
 * quick-add panel for qualifications (UK/AU chips). These only render for
 * looking_for_work accounts; the business dashboard never mounts this file.
 *
 * Visual language mirrors the existing dashboard editors (ServicesEditor,
 * CertificationsEditor): dashed add cards, line-bordered list rows, ink-900
 * add buttons, brand chips. No save buttons — adds/edits persist immediately.
 */
export function LfwEditors({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  return (
    <div className="space-y-3">
      <EducationEditor profile={profile} setProfile={setProfile} />
      <SkillsEditor profile={profile} setProfile={setProfile} />
      <QualQuickAdd profile={profile} setProfile={setProfile} />
    </div>
  );
}

/* ------------------------------- Card shell ------------------------------- */

function EditorCard({
  title,
  blurb,
  icon,
  children,
}: {
  title: string;
  blurb: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted text-brand">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-base leading-tight tracking-tight text-ink-900">
            {title}
          </div>
          <div className="mt-0.5 truncate text-xs text-ink-500">{blurb}</div>
        </div>
      </div>
      <div className="border-t-2 border-ink-900 bg-muted/40 p-3">{children}</div>
    </div>
  );
}

/* ------------------------------- Education ------------------------------- */

function EducationEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [institution, setInstitution] = useState("");
  const [qualification, setQualification] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    if (!institution.trim() || pending) return;
    startTransition(async () => {
      try {
        const row = await addEducation({
          institution: institution.trim(),
          qualification: qualification.trim() || undefined,
          startYear: startYear.trim() ? Number(startYear) : null,
          endYear: endYear.trim() ? Number(endYear) : null,
        });
        setProfile((p) => ({ ...p, education: [...p.education, row] }));
        setInstitution("");
        setQualification("");
        setStartYear("");
        setEndYear("");
      } catch {
        toast.error("Couldn't add");
      }
    });
  }

  function remove(id: number) {
    setProfile((p) => ({
      ...p,
      education: p.education.filter((e) => e.id !== id),
    }));
    deleteEducation(id).catch(() => toast.error("Couldn't remove"));
  }

  return (
    <EditorCard
      title="Training & education"
      blurb="College, courses, apprenticeships."
      icon={<GraduationCap className="h-4 w-4" strokeWidth={2.5} />}
    >
      <div className="space-y-3">
        {profile.education.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-line bg-white p-5 text-center">
            <div className="font-display text-lg leading-tight tracking-tight text-ink-900">
              Add your training
            </div>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              Your college, apprenticeship, or any course you&apos;ve done. The
              years are optional.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {profile.education.map((e) => (
              <EducationRow
                key={e.id}
                row={e}
                setProfile={setProfile}
                onRemove={() => remove(e.id)}
              />
            ))}
          </ul>
        )}

        <div className="rounded-xl border-2 border-dashed border-line bg-white p-3">
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="College or training provider"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
          />
          <input
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            placeholder="What you studied (optional)"
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              value={startYear}
              onChange={(e) =>
                setStartYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
              }
              placeholder="Start year"
              inputMode="numeric"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base tabular-nums focus:border-ink-900 focus:outline-none"
            />
            <input
              value={endYear}
              onChange={(e) =>
                setEndYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
              }
              placeholder="End year"
              inputMode="numeric"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base tabular-nums focus:border-ink-900 focus:outline-none"
            />
          </div>
          <button
            onClick={add}
            disabled={!institution.trim() || pending}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5 hover:bg-ink-800 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add training
          </button>
        </div>
      </div>
    </EditorCard>
  );
}

function EducationRow({
  row,
  setProfile,
  onRemove,
}: {
  row: FullProfile["education"][number];
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [institution, setInstitution] = useState(row.institution);
  const [qualification, setQualification] = useState(row.qualification ?? "");
  const [startYear, setStartYear] = useState(
    row.startYear === null ? "" : String(row.startYear)
  );
  const [endYear, setEndYear] = useState(
    row.endYear === null ? "" : String(row.endYear)
  );
  const [pending, startTransition] = useTransition();

  function save() {
    if (!institution.trim() || pending) return;
    const patch = {
      institution: institution.trim(),
      qualification: qualification.trim() || null,
      startYear: startYear.trim() ? Number(startYear) : null,
      endYear: endYear.trim() ? Number(endYear) : null,
    };
    startTransition(async () => {
      try {
        await updateEducation(row.id, patch);
        setProfile((p) => ({
          ...p,
          education: p.education.map((e) =>
            e.id === row.id ? { ...e, ...patch } : e
          ),
        }));
        setEditing(false);
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  const years = [row.startYear, row.endYear].filter((y) => y !== null);

  if (!editing) {
    return (
      <li className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="font-bold text-ink-900">{row.institution}</div>
          {row.qualification && (
            <div className="mt-0.5 text-sm text-ink-500">{row.qualification}</div>
          )}
          {years.length > 0 && (
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
              {years.join(" – ")}
            </div>
          )}
        </button>
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="flex-shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-emergency"
        >
          <Trash className="h-4 w-4" />
        </button>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-ink-900 bg-white p-3">
      <input
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        placeholder="College or training provider"
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
      />
      <input
        value={qualification}
        onChange={(e) => setQualification(e.target.value)}
        placeholder="What you studied (optional)"
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input
          value={startYear}
          onChange={(e) =>
            setStartYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
          }
          placeholder="Start year"
          inputMode="numeric"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base tabular-nums focus:border-ink-900 focus:outline-none"
        />
        <input
          value={endYear}
          onChange={(e) =>
            setEndYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
          }
          placeholder="End year"
          inputMode="numeric"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base tabular-nums focus:border-ink-900 focus:outline-none"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={save}
          disabled={!institution.trim() || pending}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-brand px-3 py-2 text-xs font-bold text-ink-900 transition active:translate-y-0.5 disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs font-bold uppercase tracking-wider text-ink-500 hover:text-ink-900"
        >
          Cancel
        </button>
      </div>
    </li>
  );
}

/* --------------------------------- Skills --------------------------------- */

function SkillsEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    startTransition(async () => {
      try {
        const row = await addSkill(trimmed);
        setProfile((p) => ({ ...p, services: [...p.services, row] }));
        setName("");
      } catch {
        toast.error("Couldn't add");
      }
    });
  }

  function remove(id: number) {
    setProfile((p) => ({
      ...p,
      services: p.services.filter((s) => s.id !== id),
    }));
    deleteSkill(id).catch(() => toast.error("Couldn't remove"));
  }

  return (
    <EditorCard
      title="Skills"
      blurb="What you can do on the tools."
      icon={<Wrench className="h-4 w-4" strokeWidth={2.5} />}
    >
      <div className="space-y-3">
        {profile.services.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-line bg-white p-5 text-center">
            <div className="font-display text-lg leading-tight tracking-tight text-ink-900">
              Add your skills
            </div>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              First fix, fault finding, pipe bending, plastering — the things
              you can actually do on site.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.services.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 bg-white py-1 pl-3 pr-1.5 text-sm font-bold text-ink-900"
              >
                {s.serviceName}
                <button
                  onClick={() => remove(s.id)}
                  aria-label={`Remove ${s.serviceName}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-ink-500 hover:bg-muted hover:text-emergency"
                >
                  <Trash className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Add a skill"
            className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
          />
          <button
            onClick={add}
            disabled={!name.trim() || pending}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5 hover:bg-ink-800 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </EditorCard>
  );
}

/* ----------------------------- Qualifications ----------------------------- */

/**
 * Quick-add panel for qualifications (the certifications table, shared with
 * the business cert editor). UK/AU chips tap-to-add the common cards.
 * The list itself is shown by the shared Certifications section editor above.
 */
function QualQuickAdd({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [country, setCountry] = useState<QualCountry>("UK");
  const [pending, startTransition] = useTransition();

  const have = new Set(
    profile.certifications.map((c) => c.name.trim().toLowerCase())
  );

  function quickAdd(qual: string) {
    if (pending || have.has(qual.toLowerCase())) return;
    startTransition(async () => {
      try {
        const row = await addQualification({ name: qual });
        setProfile((p) => ({
          ...p,
          certifications: [...p.certifications, row],
        }));
      } catch {
        toast.error("Couldn't add");
      }
    });
  }

  return (
    <EditorCard
      title="Quick-add qualifications"
      blurb="Tap a card you hold — it adds to your badges."
      icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}
    >
      <div className="space-y-3">
        <div className="inline-flex rounded-lg border-2 border-ink-900 bg-white p-1">
          {QUAL_COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCountry(c)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-bold transition",
                country === c
                  ? "bg-ink-900 text-white"
                  : "text-ink-700 hover:bg-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {QUALS_BY_COUNTRY[country].map((qual) => {
            const added = have.has(qual.toLowerCase());
            return (
              <button
                key={qual}
                type="button"
                onClick={() => quickAdd(qual)}
                disabled={added || pending}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-bold transition",
                  added
                    ? "border-line bg-muted text-ink-500"
                    : "border-ink-900 bg-white text-ink-900 hover:bg-brand"
                )}
              >
                {added ? null : <Plus className="h-3.5 w-3.5" />}
                {qual}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-ink-500">
          Your full list lives in the{" "}
          <strong className="text-ink-900">Certifications &amp; badges</strong>{" "}
          section above, where you can also add your own.
        </p>
      </div>
    </EditorCard>
  );
}
