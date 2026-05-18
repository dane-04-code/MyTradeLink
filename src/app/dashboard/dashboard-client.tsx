"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GripVertical,
  Eye,
  Plus,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { FullProfile } from "@/lib/queries";
import {
  SECTION_DEFS,
  SECTION_GROUPS,
  type SectionGroup as SectionGroupDef,
  type SectionKey,
  sectionDef,
} from "@/lib/sections";
import { THEME_PRESETS, isValidHex } from "@/lib/themes";
import { PublicProfile } from "@/components/public-profile";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import { QrButton } from "./qr-button";
import * as serverActions from "./actions";

/**
 * Demo-mode wrappers: when this client is mounted on /dashboard-demo, all
 * server actions short-circuit to a resolved no-op so the user can play
 * with the editor without hitting auth/DB. Local React state still updates
 * (optimistic logic already in place), so the UI feels live — refresh
 * just throws away the unsaved fiddling.
 */
function isDemoRoute(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/dashboard-demo")
  );
}

const DEMO_OK = { ok: true as const };

const toggleSection: typeof serverActions.toggleSection = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.toggleSection(...args);
const reorderSections: typeof serverActions.reorderSections = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.reorderSections(...args);
const updateProfile: typeof serverActions.updateProfile = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.updateProfile(...args);
const updateSlug: typeof serverActions.updateSlug = (...args) =>
  isDemoRoute()
    ? Promise.resolve({ slug: args[0] })
    : serverActions.updateSlug(...args);
const addService: typeof serverActions.addService = (...args) =>
  isDemoRoute()
    ? Promise.resolve({
        id: Math.floor(Math.random() * 1e6),
        userId: 0,
        serviceName: args[0].serviceName,
        description: args[0].description ?? null,
        displayOrder: 0,
        createdAt: new Date(),
      })
    : serverActions.addService(...args);
const deleteService: typeof serverActions.deleteService = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.deleteService(...args);
const addPhoto: typeof serverActions.addPhoto = (...args) =>
  isDemoRoute()
    ? Promise.resolve({
        id: Math.floor(Math.random() * 1e6),
        userId: 0,
        photoUrl: args[0].photoUrl,
        caption: args[0].caption ?? null,
        type: args[0].type,
        pairId: args[0].pairId ?? null,
        displayOrder: 0,
        createdAt: new Date(),
      })
    : serverActions.addPhoto(...args);
const deletePhoto: typeof serverActions.deletePhoto = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.deletePhoto(...args);
const addCertification: typeof serverActions.addCertification = (...args) =>
  isDemoRoute()
    ? Promise.resolve({
        id: Math.floor(Math.random() * 1e6),
        userId: 0,
        name: args[0].name,
        badgeUrl: args[0].badgeUrl ?? null,
        displayOrder: 0,
        createdAt: new Date(),
      })
    : serverActions.addCertification(...args);
const deleteCertification: typeof serverActions.deleteCertification = (...args) =>
  isDemoRoute()
    ? Promise.resolve(DEMO_OK)
    : serverActions.deleteCertification(...args);

export function DashboardClient({ initialProfile }: { initialProfile: FullProfile }) {
  const [profile, setProfile] = useState<FullProfile>(initialProfile);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const isPaid = profile.user.plan === "paid";
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${profile.user.slug}`
      : `/t/${profile.user.slug}`;

  return (
    <div className="relative">
      {/* subtle blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-10">
        {/* Page heading */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
              My page
            </div>
            <h1 className="mt-1 font-display text-3xl leading-none tracking-tight text-ink-900 md:text-4xl">
              Welcome back, {profile.user.name?.split(" ")[0] || "boss"}.
            </h1>
          </div>
        </div>

        <LinkBar
          slug={profile.user.slug}
          publicUrl={publicUrl}
          onSlugChange={(s) =>
            setProfile((p) => ({ ...p, user: { ...p.user, slug: s } }))
          }
        />

        {!isPaid && <UpgradeBanner />}

        {/* Mobile Edit / Preview tabs */}
        <div className="mt-6 flex rounded-2xl border border-line bg-white p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              mobileTab === "edit"
                ? "bg-ink-900 text-white"
                : "text-ink-700 hover:bg-muted"
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              mobileTab === "preview"
                ? "bg-ink-900 text-white"
                : "text-ink-700 hover:bg-muted"
            )}
          >
            Preview
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:mt-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT: editor */}
          <div className={cn(mobileTab === "preview" && "hidden lg:block")}>
            <SectionsEditor profile={profile} setProfile={setProfile} />
          </div>
          {/* RIGHT: live preview */}
          <div
            className={cn(
              "lg:sticky lg:top-32 lg:self-start",
              mobileTab === "edit" && "hidden lg:block"
            )}
          >
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
                  Live preview
                </div>
                <div className="mt-0.5 text-sm font-bold text-ink-900">
                  What customers see
                </div>
              </div>
              <a
                href={`/t/${profile.user.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-ink-800"
              >
                <Eye className="h-3.5 w-3.5" /> Open page
              </a>
            </div>
            {/* Phone-shaped frame, capped at real-phone width so the
                PublicProfile inside (max-w-md = 448px) fills the frame
                edge-to-edge — banner spans the full preview width. */}
            <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[36px] border-[10px] border-ink-900 bg-ink-900 shadow-[0_30px_60px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-center bg-ink-900 py-1.5">
                <div className="h-1 w-16 rounded-full bg-white/30" />
              </div>
              <div className="max-h-[80vh] overflow-y-auto bg-white">
                <PublicProfile profile={profile} preview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkBar({
  slug,
  publicUrl,
  onSlugChange,
}: {
  slug: string;
  publicUrl: string;
  onSlugChange: (s: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(slug);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function copy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  function save() {
    startTransition(async () => {
      const res = await updateSlug(draft);
      onSlugChange(res.slug);
      setDraft(res.slug);
      setEditing(false);
      toast.success("Link updated");
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-stretch gap-0 sm:flex-nowrap">
        <div className="flex items-center gap-2 border-line px-4 py-3 sm:border-r">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">
            Your link
          </div>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          {editing ? (
            <div className="flex w-full items-center gap-2">
              <span className="font-mono text-sm text-ink-500">tradelink.app/t/</span>
              <input
                value={draft}
                onChange={(e) =>
                  setDraft(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                  )
                }
                className="flex-1 rounded-lg border-2 border-line px-3 py-1.5 font-mono text-sm focus:border-brand focus:outline-none"
                autoFocus
              />
              <button
                onClick={save}
                disabled={pending}
                className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-ink-800 disabled:opacity-60"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(slug);
                }}
                className="text-xs font-bold text-ink-500 hover:text-ink-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group flex items-baseline gap-1 truncate text-left font-mono text-sm md:text-base"
              title="Click to edit"
            >
              <span className="text-ink-500">tradelink.app/t/</span>
              <span className="font-semibold text-brand">{slug}</span>
              <span className="ml-2 hidden text-[10px] font-bold uppercase tracking-wider text-ink-500 opacity-0 transition group-hover:opacity-100 sm:inline">
                edit
              </span>
            </button>
          )}
        </div>
        <QrButton url={publicUrl} slug={slug} />
        <button
          onClick={copy}
          className="flex items-center justify-center gap-2 border-t border-line bg-ink-900 px-5 text-sm font-bold text-white transition hover:bg-ink-800 sm:border-l sm:border-t-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function UpgradeBanner() {
  return (
    <Link
      href="/pricing"
      className="group relative mt-4 flex items-center gap-4 overflow-hidden rounded-2xl bg-ink-900 p-5 text-white transition hover:bg-ink-800"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-8 h-40 w-40 rotate-[8deg] opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #F97316 0 6px, transparent 6px 18px)",
        }}
      />
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-ink-900">
        <Sparkles className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="relative flex-1">
        <div className="font-display text-lg leading-tight tracking-tight">
          Unlock the lot for <span className="text-brand">£9/month</span>
        </div>
        <div className="mt-0.5 text-sm text-white/65">
          Quote requests · Emergency callout · Intro video · No TradeLink badge
        </div>
      </div>
      <div className="relative inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink-900 transition group-hover:translate-x-1">
        Upgrade
      </div>
    </Link>
  );
}

function SectionsEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
          Page sections
        </div>
        <div className="mt-0.5 text-sm font-bold text-ink-900">
          Toggle on/off, drag to reorder within a group, click to edit.{" "}
          <span className="font-normal text-ink-500">Auto-saves.</span>
        </div>
      </div>

      <div className="space-y-3">
        {SECTION_GROUPS.map((group) => (
          <SectionGroupCard
            key={group.id}
            group={group}
            profile={profile}
            setProfile={setProfile}
          />
        ))}
        <ThemeCard profile={profile} setProfile={setProfile} />
      </div>
    </div>
  );
}

/**
 * A collapsible group containing the sections for one logical category.
 * Drag-reorder works within the group; the overall public-page ordering
 * is groupIndex * 100 + indexInGroup, persisted to displayOrder.
 */
function SectionGroupCard({
  group,
  profile,
  setProfile,
}: {
  group: SectionGroupDef;
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const isPaid = profile.user.plan === "paid";
  const [open, setOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sectionsInGroup = useMemo(() => {
    return group.keys
      .map((key) => profile.sections.find((s) => s.sectionKey === key))
      .filter((s): s is NonNullable<typeof s> => !!s)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [group, profile.sections]);

  const enabledCount = sectionsInGroup.filter((s) => s.isEnabled).length;

  function rebuildGlobalOrder(updatedKeysForThisGroup: SectionKey[]) {
    const groupOrderIndex = SECTION_GROUPS.findIndex((g) => g.id === group.id);

    const fullOrder: SectionKey[] = [];
    SECTION_GROUPS.forEach((g, gIdx) => {
      if (gIdx === groupOrderIndex) {
        fullOrder.push(...updatedKeysForThisGroup);
      } else {
        const keys = g.keys
          .map((k) => profile.sections.find((s) => s.sectionKey === k))
          .filter((s): s is NonNullable<typeof s> => !!s)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((s) => s.sectionKey as SectionKey);
        fullOrder.push(...keys);
      }
    });
    return fullOrder;
  }

  function onDragEnd(event: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIdx = sectionsInGroup.findIndex(
      (s) => s.sectionKey === event.active.id
    );
    const newIdx = sectionsInGroup.findIndex(
      (s) => s.sectionKey === event.over!.id
    );
    if (oldIdx < 0 || newIdx < 0) return;
    const moved = arrayMove(sectionsInGroup, oldIdx, newIdx);
    const newKeys = moved.map((s) => s.sectionKey as SectionKey);
    const fullOrder = rebuildGlobalOrder(newKeys);

    // Apply locally
    setProfile((p) => ({
      ...p,
      sections: p.sections.map((s) => {
        const idx = fullOrder.indexOf(s.sectionKey as SectionKey);
        return idx >= 0 ? { ...s, displayOrder: idx } : s;
      }),
    }));
    reorderSections(fullOrder).catch(() => toast.error("Couldn't save order"));
  }

  function toggle(key: SectionKey, on: boolean, locked: boolean) {
    if (locked) {
      toast.info("That's a paid feature. Upgrade to unlock.");
      return;
    }
    setProfile((p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.sectionKey === key ? { ...s, isEnabled: on } : s
      ),
    }));
    toggleSection(key, on).catch(() => toast.error("Couldn't save"));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted"
      >
        <span className="h-1.5 w-6 rounded-full bg-brand" />
        <div className="flex-1">
          <div className="font-display text-base leading-tight tracking-tight text-ink-900">
            {group.title}
          </div>
          <div className="mt-0.5 text-xs text-ink-500">{group.blurb}</div>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-700">
          {enabledCount}/{sectionsInGroup.length} on
        </span>
        <span className="text-ink-500">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-line bg-muted/40 p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd as never}
          >
            <SortableContext
              items={sectionsInGroup.map((s) => s.sectionKey)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {sectionsInGroup.map((s) => {
                  const def = sectionDef(s.sectionKey as SectionKey);
                  if (!def) return null;
                  const locked = !!def.paidOnly && !isPaid;
                  return (
                    <SortableRow
                      key={s.sectionKey}
                      id={s.sectionKey}
                      label={def.label}
                      description={def.description}
                      enabled={s.isEnabled}
                      locked={locked}
                      onToggle={(on) =>
                        toggle(s.sectionKey as SectionKey, on, locked)
                      }
                    >
                      <SectionDetail
                        sectionKey={s.sectionKey as SectionKey}
                        profile={profile}
                        setProfile={setProfile}
                      />
                    </SortableRow>
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

/**
 * Theme picker — 5 swatches + custom hex. Writes to users.accentColor.
 */
function ThemeCard({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const accent = profile.user.accentColor ?? "#F97316";
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState(accent);

  function setAccent(hex: string) {
    setProfile((p) => ({
      ...p,
      user: { ...p.user, accentColor: hex },
    }));
    updateProfile({ accentColor: hex }).catch(() =>
      toast.error("Couldn't save")
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="h-1.5 w-6 rounded-full" style={{ background: accent }} />
        <div className="flex-1">
          <div className="font-display text-base leading-tight tracking-tight text-ink-900">
            Theme
          </div>
          <div className="mt-0.5 text-xs text-ink-500">
            Accent colour for your buttons and highlights.
          </div>
        </div>
      </div>
      <div className="border-t border-line bg-muted/40 p-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {THEME_PRESETS.map((t) => {
            const active = accent.toLowerCase() === t.accent.toLowerCase();
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAccent(t.accent)}
                className={cn(
                  "group rounded-xl border-2 bg-white p-2 text-left transition",
                  active
                    ? "border-ink-900 ring-2 ring-ink-900/10"
                    : "border-line hover:border-ink-700"
                )}
                title={t.hint}
              >
                <div
                  className="mb-1.5 h-10 w-full rounded-md"
                  style={{ background: t.accent }}
                />
                <div className="text-[11px] font-bold text-ink-900">{t.label}</div>
                {active && (
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    Active
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowCustom((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:border-ink-500"
          >
            <Plus className="h-3.5 w-3.5" />
            {showCustom ? "Hide" : "Custom colour"}
          </button>
          {showCustom && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-white"
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                maxLength={7}
                placeholder="#F97316"
                className="w-28 rounded-lg border border-line px-3 py-2 font-mono text-sm focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!isValidHex(customHex)) {
                    toast.error("Use a valid 6-digit hex like #F97316.");
                    return;
                  }
                  setAccent(customHex);
                  toast.success("Theme updated");
                }}
                className="rounded-lg bg-ink-900 px-3 py-2 text-xs font-bold text-white hover:bg-ink-800"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableRow({
  id,
  label,
  description,
  enabled,
  locked,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  locked: boolean;
  onToggle: (on: boolean) => void;
  children?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const [open, setOpen] = useState(false);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-line bg-white transition",
        isDragging && "shadow-[0_20px_40px_rgba(15,23,42,0.15)] ring-2 ring-brand",
        locked && "opacity-90"
      )}
    >
      <div className="flex items-center gap-1 p-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab touch-none rounded-lg p-2 text-ink-500 transition hover:bg-muted hover:text-ink-900 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 text-left px-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink-900">{label}</span>
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-900">
                <Lock className="h-2.5 w-2.5" strokeWidth={3} /> Pro
              </span>
            )}
          </div>
          <div className="mt-0.5 text-sm text-ink-500">{description}</div>
        </button>

        <Toggle checked={enabled} onChange={onToggle} disabled={locked} />

        {children && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-ink-500 transition hover:bg-muted hover:text-ink-900"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        )}
      </div>
      {open && children && (
        <div className="border-t border-line bg-muted/50 p-4">{children}</div>
      )}
    </li>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-pressed={checked}
      className={cn(
        "relative h-7 w-12 rounded-full transition",
        disabled
          ? "bg-neutral-200 opacity-60"
          : checked
            ? "bg-brand"
            : "bg-neutral-300"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

/* ------------------------------- Section detail editors ------------------------------- */

function SectionDetail({
  sectionKey,
  profile,
  setProfile,
}: {
  sectionKey: SectionKey;
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  switch (sectionKey) {
    case "profile_photo":
      return <ProfilePhotoEditor profile={profile} setProfile={setProfile} />;
    case "banner_image":
      return <BannerEditor profile={profile} setProfile={setProfile} />;
    case "call_button":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="phone"
          label="Phone number for the call button"
          placeholder="07700 900123"
        />
      );
    case "whatsapp_button":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="whatsappNumber"
          label="WhatsApp number"
          placeholder="07700 900123"
        />
      );
    case "emergency_callout":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="emergencyNumber"
          label="Emergency callout number"
          placeholder="07700 900123"
        />
      );
    case "availability_status":
      return <AvailabilityEditor profile={profile} setProfile={setProfile} />;
    case "about_me":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="about"
          label="About you"
          textarea
          maxLength={280}
        />
      );
    case "services_list":
      return <ServicesEditor profile={profile} setProfile={setProfile} />;
    case "photo_gallery":
      return <PhotosEditor profile={profile} setProfile={setProfile} type="gallery" label="Gallery photos" />;
    case "before_after_photos":
      return <BeforeAfterEditor profile={profile} setProfile={setProfile} />;
    case "certifications":
      return <CertificationsEditor profile={profile} setProfile={setProfile} />;
    case "google_reviews":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="googleReviewUrl"
          label="Google reviews URL"
          placeholder="https://g.page/r/..."
        />
      );
    case "areas_covered":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="areasCovered"
          label="Towns or postcodes you cover"
          textarea
        />
      );
    case "payment_methods":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="paymentMethods"
          label="How you take payment"
          placeholder="Cash, card, bank transfer"
        />
      );
    case "facebook_link":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="facebookUrl"
          label="Facebook page URL"
          placeholder="https://facebook.com/..."
        />
      );
    case "instagram_link":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="instagramUrl"
          label="Instagram profile URL"
          placeholder="https://instagram.com/..."
        />
      );
    case "tiktok_link":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="tiktokUrl"
          label="TikTok profile URL"
          placeholder="https://tiktok.com/@..."
        />
      );
    case "intro_video":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="introVideoUrl"
          label="Intro video URL"
          placeholder="https://..."
        />
      );
    case "quote_form":
      return (
        <p className="text-sm text-neutral-500">
          Customers can request a quote from your page. {profile.user.plan === "paid" ? "Photo upload is enabled." : "Upgrade to enable photo uploads."}
        </p>
      );
    default:
      return null;
  }
}

function useAutoSave<T extends Record<string, unknown>>(
  fn: (data: T) => Promise<unknown>
) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  function save(data: T) {
    fn(data)
      .then(() => setSavedAt(Date.now()))
      .catch(() => toast.error("Couldn't save"));
  }
  return { save, savedAt };
}

function FieldEditor({
  profile,
  setProfile,
  field,
  label,
  placeholder,
  textarea,
  maxLength,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
  field: keyof FullProfile["user"];
  label: string;
  placeholder?: string;
  textarea?: boolean;
  maxLength?: number;
}) {
  const value = (profile.user[field] as string | null) ?? "";
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) {
        setProfile((p) => ({ ...p, user: { ...p.user, [field]: local } }));
        updateProfile({ [field]: local } as never).catch(() =>
          toast.error("Couldn't save")
        );
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  const onChange = (v: string) =>
    setLocal(maxLength ? v.slice(0, maxLength) : v);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={local}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={maxLength}
          className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
      ) : (
        <input
          value={local}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
      )}
      {maxLength && (
        <p className="mt-1 text-xs text-ink-500">
          {local.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
}

function ProfilePhotoEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  return (
    <div className="flex items-center gap-4">
      {profile.user.profilePhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.user.profilePhotoUrl}
          alt=""
          className="h-20 w-20 rounded-full object-cover ring-2 ring-brand"
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-neutral-200" />
      )}
      <UploadButton
        endpoint="profilePhoto"
        appearance={{
          button:
            "ut-ready:bg-brand bg-brand text-white rounded-xl px-4 py-2 text-sm font-semibold",
          allowedContent: "text-neutral-500 text-xs",
        }}
        onClientUploadComplete={(res) => {
          const url = res?.[0]?.url;
          if (url) {
            setProfile((p) => ({ ...p, user: { ...p.user, profilePhotoUrl: url } }));
            updateProfile({ profilePhotoUrl: url });
            toast.success("Photo updated");
          }
        }}
        onUploadError={(err) => { toast.error(err.message); }}
      />
    </div>
  );
}

function BannerEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  function clear() {
    setProfile((p) => ({ ...p, user: { ...p.user, bannerImageUrl: null } }));
    updateProfile({ bannerImageUrl: "" }).catch(() =>
      toast.error("Couldn't remove banner")
    );
  }
  return (
    <div className="space-y-3">
      {/* Edge-to-edge preview: break out of the section card's p-4 with
          negative side margins, so the banner looks like the full-bleed
          hero it actually is on the public page. */}
      {profile.user.bannerImageUrl ? (
        <div className="relative -mx-4 aspect-[5/2] overflow-hidden border-y border-ink-900/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.user.bannerImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Avatar position indicator so they know where it'll overlap */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
            <div className="h-12 w-12 -translate-y-6 rounded-full border-[3px] border-white/85 bg-white/30 backdrop-blur-sm" />
          </div>
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-bold text-ink-900 shadow-sm hover:bg-white"
          >
            <Trash className="h-3 w-3" /> Remove
          </button>
        </div>
      ) : (
        <div className="-mx-4 flex aspect-[5/2] flex-col items-center justify-center border-y-2 border-dashed border-line bg-muted/50 px-6 text-center text-xs text-ink-500">
          <div className="font-bold text-ink-700">No banner yet</div>
          <div className="mt-1">
            Wide landscape photo · 1600×640 ideal · centre of the image survives the crop
          </div>
        </div>
      )}
      <UploadButton
        endpoint="banner"
        appearance={{
          button:
            "ut-ready:bg-ink-900 bg-ink-900 text-white rounded-xl px-4 py-2 text-sm font-semibold",
          allowedContent: "text-ink-500 text-xs",
        }}
        onClientUploadComplete={(res) => {
          const url = res?.[0]?.url;
          if (url) {
            setProfile((p) => ({ ...p, user: { ...p.user, bannerImageUrl: url } }));
            updateProfile({ bannerImageUrl: url });
            toast.success("Banner updated");
          }
        }}
        onUploadError={(err) => {
          toast.error(err.message);
        }}
      />
    </div>
  );
}

function AvailabilityEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  function set(v: "taking_on_work" | "fully_booked") {
    setProfile((p) => ({ ...p, user: { ...p.user, availabilityStatus: v } }));
    updateProfile({ availabilityStatus: v }).catch(() => toast.error("Couldn't save"));
  }
  return (
    <div className="flex gap-2">
      <button
        onClick={() => set("taking_on_work")}
        className={cn(
          "flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold",
          profile.user.availabilityStatus === "taking_on_work"
            ? "border-green-500 bg-green-50 text-green-800"
            : "border-neutral-200 text-neutral-600"
        )}
      >
        Taking on work
      </button>
      <button
        onClick={() => set("fully_booked")}
        className={cn(
          "flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold",
          profile.user.availabilityStatus === "fully_booked"
            ? "border-red-500 bg-red-50 text-red-800"
            : "border-neutral-200 text-neutral-600"
        )}
      >
        Fully booked
      </button>
    </div>
  );
}

function ServicesEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  async function add() {
    if (!name.trim()) return;
    const row = await addService({ serviceName: name.trim(), description: desc.trim() || undefined });
    setProfile((p) => ({ ...p, services: [...p.services, row] }));
    setName("");
    setDesc("");
  }

  async function remove(id: number) {
    await deleteService(id);
    setProfile((p) => ({ ...p, services: p.services.filter((s) => s.id !== id) }));
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {profile.services.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
            <div>
              <div className="font-semibold">{s.serviceName}</div>
              {s.description && <div className="text-sm text-neutral-500">{s.description}</div>}
            </div>
            <button onClick={() => remove(s.id)} className="text-neutral-400 hover:text-red-600">
              <Trash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-dashed border-neutral-300 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service name"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Short description (optional)"
          className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
        <button
          onClick={add}
          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add service
        </button>
      </div>
    </div>
  );
}

function PhotosEditor({
  profile,
  setProfile,
  type,
  label,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
  type: "gallery" | "before" | "after";
  label: string;
}) {
  const list = profile.photos.filter((p) => p.type === type);

  async function remove(id: number) {
    await deletePhoto(id);
    setProfile((p) => ({ ...p, photos: p.photos.filter((ph) => ph.id !== id) }));
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-ink-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {list.map((p) => (
          <div key={p.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photoUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <button
              onClick={() => remove(p.id)}
              className="absolute -top-1 -right-1 rounded-full bg-red-600 p-0.5 text-white"
            >
              <Trash className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <UploadButton
        endpoint="gallery"
        appearance={{
          button: "ut-ready:bg-brand bg-brand text-white rounded-xl px-4 py-2 text-sm font-semibold",
          allowedContent: "text-neutral-500 text-xs",
        }}
        onClientUploadComplete={async (res) => {
          if (!res) return;
          for (const r of res) {
            const row = await addPhoto({ photoUrl: r.url, type });
            setProfile((p) => ({ ...p, photos: [...p.photos, row] }));
          }
          toast.success("Uploaded");
        }}
        onUploadError={(err) => { toast.error(err.message); }}
      />
    </div>
  );
}

function BeforeAfterEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  return (
    <div className="space-y-4">
      <PhotosEditor profile={profile} setProfile={setProfile} type="before" label="Before photos" />
      <PhotosEditor profile={profile} setProfile={setProfile} type="after" label="After photos" />
    </div>
  );
}

function CertificationsEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [name, setName] = useState("");
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);

  async function add() {
    if (!name.trim()) return;
    const row = await addCertification({ name: name.trim(), badgeUrl: badgeUrl ?? undefined });
    setProfile((p) => ({ ...p, certifications: [...p.certifications, row] }));
    setName("");
    setBadgeUrl(null);
  }

  async function remove(id: number) {
    await deleteCertification(id);
    setProfile((p) => ({ ...p, certifications: p.certifications.filter((c) => c.id !== id) }));
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {profile.certifications.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center gap-2">
              {c.badgeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.badgeUrl} alt="" className="h-8 w-8 rounded object-contain" />
              ) : null}
              <span className="font-semibold">{c.name}</span>
            </div>
            <button onClick={() => remove(c.id)} className="text-neutral-400 hover:text-red-600">
              <Trash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-dashed border-neutral-300 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Certification name (e.g. Gas Safe Registered)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-2">
          <UploadButton
            endpoint="certification"
            appearance={{
              button: "ut-ready:bg-neutral-100 bg-neutral-100 text-ink-900 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm font-semibold",
              allowedContent: "hidden",
            }}
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url;
              if (url) setBadgeUrl(url);
            }}
            onUploadError={(err) => { toast.error(err.message); }}
          />
          {badgeUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={badgeUrl} alt="" className="h-8 w-8 rounded object-contain" />
          )}
        </div>
        <button
          onClick={add}
          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add certification
        </button>
      </div>
    </div>
  );
}
