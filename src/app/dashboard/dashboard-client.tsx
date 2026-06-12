"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlignLeft,
  CalendarCheck,
  Camera,
  Check,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Columns2,
  Copy,
  CreditCard,
  Eye,
  GraduationCap,
  GripVertical,
  Hammer,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Quote,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  Trash2,
  Video,
  Wrench,
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
  type SectionGroup as SectionGroupDef,
  type SectionKey,
  sectionDef,
  sectionGroupsForGoal,
} from "@/lib/sections";
import { THEME_PRESETS, isValidHex } from "@/lib/themes";
import { BrandChip, detectBrand } from "@/components/brand-icons";
import { PublicProfile } from "@/components/public-profile";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import { QrButton } from "./qr-button";
import * as serverActions from "./actions";
import { LfwEditors } from "./lfw-editors";

/**
 * Pick a greeting that works for both a personal name ("Dave Wilson") and
 * a business name ("Coventry Plumbing", "DW Plumbing & Heating Ltd").
 * If the name looks like a business (contains trade/business words),
 * use a generic greeting. If it looks like a person, use their first name.
 */
const BUSINESS_WORDS = [
  "plumbing", "electric", "electrical", "roofing", "building", "builders",
  "construction", "landscaping", "gardening", "heating", "gas", "tiling",
  "plastering", "decorating", "carpentry", "joinery", "fencing", "paving",
  "kitchens", "bathrooms", "ltd", "limited", "co", "&", "and", "services",
  "solutions", "specialists", "group", "trades", "trade",
];
function greeting(name: string | null | undefined): string {
  if (!name) return "Welcome back.";
  const lower = name.toLowerCase();
  const looksLikeBusiness = BUSINESS_WORDS.some((w) =>
    new RegExp(`\\b${w}\\b`).test(lower)
  );
  if (looksLikeBusiness) return "Welcome back.";
  return `Welcome back, ${name.split(" ")[0]}.`;
}

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
const setAccountGoal: typeof serverActions.setAccountGoal = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.setAccountGoal(...args);
const setPublicEmail: typeof serverActions.setPublicEmail = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.setPublicEmail(...args);
const addTestimonial: typeof serverActions.addTestimonial = (...args) =>
  isDemoRoute()
    ? Promise.resolve({
        id: Math.floor(Math.random() * 1e6),
        userId: 0,
        customerName: args[0].customerName,
        quote: args[0].quote,
        location: args[0].location ?? null,
        displayOrder: 0,
        createdAt: new Date(),
      })
    : serverActions.addTestimonial(...args);
const deleteTestimonial: typeof serverActions.deleteTestimonial = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.deleteTestimonial(...args);
const addCustomLink: typeof serverActions.addCustomLink = (...args) =>
  isDemoRoute()
    ? Promise.resolve({
        id: Math.floor(Math.random() * 1e6),
        userId: 0,
        title: args[0].title,
        url: args[0].url,
        displayOrder: 0,
        createdAt: new Date(),
      })
    : serverActions.addCustomLink(...args);
const deleteCustomLink: typeof serverActions.deleteCustomLink = (...args) =>
  isDemoRoute() ? Promise.resolve(DEMO_OK) : serverActions.deleteCustomLink(...args);

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
              {greeting(profile.user.name)}
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
        <div className="mt-6 flex rounded-lg border-2 border-ink-900 bg-white p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-bold transition",
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
              "flex-1 rounded-md px-4 py-2 text-sm font-bold transition",
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
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-white px-3 py-1.5 text-xs font-bold text-ink-900 shadow-hard-sm transition active:translate-y-0.5 active:shadow-press hover:bg-muted"
              >
                <Eye className="h-3.5 w-3.5" /> Open page
              </a>
            </div>
            {/* Phone-shaped frame, capped at real-phone width so the
                PublicProfile inside (max-w-md = 448px) fills the frame
                edge-to-edge — banner spans the full preview width. */}
            <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[36px] border-[10px] border-ink-900 bg-ink-900 shadow-[0_8px_0_0_#0F172A]">
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
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white shadow-hard">
      <div className="flex flex-wrap items-stretch sm:flex-nowrap">
        {/* Address-bar dot cluster — feels like a real browser nav row. */}
        <div className="hidden items-center gap-1.5 border-ink-900 bg-muted px-4 sm:flex sm:border-r-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-900/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-900/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand" />
        </div>
        <div className="flex flex-1 items-center px-4 py-3.5">
          {editing ? (
            <div className="flex w-full items-center gap-2">
              <span className="font-mono text-sm text-ink-500">mytradelink.page/t/</span>
              <input
                value={draft}
                onChange={(e) =>
                  setDraft(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                  )
                }
                className="flex-1 rounded-md border-2 border-ink-900 bg-white px-2.5 py-1 font-mono text-sm focus:outline-none"
                autoFocus
              />
              <button
                onClick={save}
                disabled={pending}
                className="rounded-md border-2 border-ink-900 bg-brand px-3 py-1 text-xs font-bold text-ink-900 transition active:translate-y-0.5 disabled:opacity-60"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(slug);
                }}
                className="text-xs font-bold uppercase tracking-wider text-ink-500 hover:text-ink-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group flex w-full items-baseline gap-1 truncate text-left font-mono"
              title="Click to edit"
            >
              <span className="text-sm text-ink-500 sm:text-base">mytradelink.page/t/</span>
              <span className="text-sm font-bold text-brand sm:text-base">{slug}</span>
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500 opacity-0 transition group-hover:opacity-100">
                Edit
              </span>
            </button>
          )}
        </div>
        <QrButton url={publicUrl} slug={slug} />
        <button
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy link"}
          className="flex items-center justify-center gap-2 border-t-2 border-ink-900 bg-ink-900 px-5 py-3 text-sm font-bold text-white transition active:bg-ink-800 sm:border-l-2 sm:border-t-0"
        >
          {copied ? <Check className="h-4 w-4 text-brand" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
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
      className="group relative mt-4 flex items-center gap-4 overflow-hidden rounded-xl border-2 border-ink-900 bg-ink-900 p-5 text-white shadow-hard-brand transition active:translate-y-1 active:shadow-press"
    >
      {/* Hazard hatch in the corner — feels like a real construction tape sticker. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-[10deg] bg-hatch opacity-40"
      />
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-brand text-ink-900 ring-2 ring-ink-900">
        <Sparkles className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="relative flex-1 min-w-0">
        <div className="font-display text-lg leading-tight tracking-tight md:text-xl">
          Unlock the lot for <span className="text-brand">£9/month</span>
        </div>
        <div className="mt-1 truncate text-sm text-white/70">
          Quote requests · Emailed to you · Emergency callout · Intro video · No badge
        </div>
      </div>
      <div className="relative inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-brand bg-brand px-3.5 py-2 text-sm font-bold text-ink-900 transition group-hover:translate-x-1">
        Upgrade
        <span aria-hidden>→</span>
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
  const goal = profile.user.accountGoal;
  const isLfw = goal === "looking_for_work";
  const groups = useMemo(() => sectionGroupsForGoal(goal), [goal]);
  return (
    <div>
      <GoalToggle profile={profile} setProfile={setProfile} />
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
        {groups.map((group) => (
          <SectionGroupCard
            key={group.id}
            group={group}
            groups={groups}
            profile={profile}
            setProfile={setProfile}
          />
        ))}
        <ThemeCard profile={profile} setProfile={setProfile} />
      </div>

      {isLfw && (
        <div className="mt-3">
          <LfwEditors profile={profile} setProfile={setProfile} />
        </div>
      )}
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
  groups,
  profile,
  setProfile,
}: {
  group: SectionGroupDef;
  groups: SectionGroupDef[];
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
    const groupOrderIndex = groups.findIndex((g) => g.id === group.id);

    const fullOrder: SectionKey[] = [];
    groups.forEach((g, gIdx) => {
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
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted"
      >
        <span className="h-5 w-1.5 rounded-sm bg-brand" />
        <div className="flex-1 min-w-0">
          <div className="font-display text-base leading-tight tracking-tight text-ink-900">
            {group.title}
          </div>
          <div className="mt-0.5 truncate text-xs text-ink-500">{group.blurb}</div>
        </div>
        <span className="hidden rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-700 sm:inline-block">
          {enabledCount}/{sectionsInGroup.length}
        </span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-ink-900 transition",
            open ? "bg-ink-900 text-white" : "bg-muted"
          )}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <div className="border-t-2 border-ink-900 bg-muted/40 p-3">
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
                      icon={sectionIcon(s.sectionKey as SectionKey)}
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
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          className="h-5 w-1.5 rounded-sm"
          style={{ background: accent }}
        />
        <div className="flex-1">
          <div className="font-display text-base leading-tight tracking-tight text-ink-900">
            Theme
          </div>
          <div className="mt-0.5 text-xs text-ink-500">
            Accent colour for your buttons and highlights.
          </div>
        </div>
      </div>
      <div className="border-t-2 border-ink-900 bg-muted/40 p-4">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {THEME_PRESETS.map((t) => {
            const active = accent.toLowerCase() === t.accent.toLowerCase();
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAccent(t.accent)}
                className={cn(
                  "group relative rounded-md border-2 bg-white p-2 text-left transition",
                  active
                    ? "border-ink-900 shadow-hard-sm"
                    : "border-line hover:border-ink-900"
                )}
                title={t.hint}
              >
                <div
                  className="mb-1.5 h-10 w-full rounded-sm border border-ink-900/20"
                  style={{ background: t.accent }}
                />
                <div className="text-[11px] font-bold text-ink-900">{t.label}</div>
                {active && (
                  <span
                    aria-hidden
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink-900 bg-brand text-ink-900"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowCustom((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
          >
            <Plus className="h-3.5 w-3.5" />
            {showCustom ? "Hide" : "Custom colour"}
          </button>
          {showCustom && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-md border-2 border-ink-900 bg-white p-0"
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                maxLength={7}
                placeholder="#F97316"
                className="w-28 rounded-md border-2 border-line px-3 py-2 font-mono text-sm focus:border-ink-900 focus:outline-none"
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
                className="rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5"
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

/**
 * Icon shown on each row of the page builder so the list scans visually.
 * Social rows reuse the real brand logos from the public page; everything
 * else gets a neutral chip with a matching lucide glyph.
 */
function sectionIcon(key: SectionKey): React.ReactNode {
  const brandKeys: Partial<Record<SectionKey, Parameters<typeof BrandChip>[0]["brand"]>> = {
    facebook_link: "facebook",
    instagram_link: "instagram",
    tiktok_link: "tiktok",
    website_link: "website",
    custom_links: "generic",
    whatsapp_button: "whatsapp",
  };
  const brand = brandKeys[key];
  if (brand) return <BrandChip brand={brand} className="h-8 w-8 rounded-lg" />;

  const glyphs: Partial<Record<SectionKey, React.ReactNode>> = {
    banner_image: <ImageIcon className="h-4 w-4" />,
    profile_photo: <CircleUserRound className="h-4 w-4" />,
    availability_status: <CalendarCheck className="h-4 w-4" />,
    call_button: <Phone className="h-4 w-4" />,
    emergency_callout: <Siren className="h-4 w-4" />,
    about_me: <AlignLeft className="h-4 w-4" />,
    services_list: <Wrench className="h-4 w-4" />,
    photo_gallery: <Camera className="h-4 w-4" />,
    before_after_photos: <Columns2 className="h-4 w-4" />,
    certifications: <ShieldCheck className="h-4 w-4" />,
    testimonials: <Quote className="h-4 w-4" />,
    google_reviews: <Star className="h-4 w-4" />,
    quote_form: <ClipboardList className="h-4 w-4" />,
    areas_covered: <MapPin className="h-4 w-4" />,
    payment_methods: <CreditCard className="h-4 w-4" />,
    intro_video: <Video className="h-4 w-4" />,
    education: <GraduationCap className="h-4 w-4" />,
    skills: <Hammer className="h-4 w-4" />,
    email_button: <Mail className="h-4 w-4" />,
  };
  return (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-ink-700">
      {glyphs[key]}
    </span>
  );
}

function SortableRow({
  id,
  icon,
  label,
  description,
  enabled,
  locked,
  onToggle,
  children,
}: {
  id: string;
  icon?: React.ReactNode;
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
        "rounded-xl border border-line bg-white transition",
        isDragging && "border-ink-900 shadow-hard",
        locked && "opacity-90"
      )}
    >
      <div className="flex items-center gap-1 p-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab touch-none rounded-md p-2 text-ink-500 transition hover:bg-muted hover:text-ink-900 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        {icon}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 text-left px-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink-900">{label}</span>
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-ink-900 bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
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
            className="rounded-md p-2 text-ink-500 transition hover:bg-muted hover:text-ink-900"
            aria-label={open ? "Collapse" : "Expand"}
          >
            <ChevronDown
              className={cn("h-5 w-5 transition-transform", open && "rotate-180")}
            />
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
        "relative inline-flex h-7 w-[52px] flex-shrink-0 items-center rounded-full border-2 border-ink-900 transition-colors",
        disabled
          ? "bg-muted opacity-60"
          : checked
            ? "bg-brand"
            : "bg-muted"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "block h-5 w-5 rounded-full border-2 border-ink-900 bg-white transition-transform",
          checked ? "translate-x-[26px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}

/**
 * Goal toggle — segmented control matching the availability/tab toggles.
 * Switching reseeds sections additively (nothing is deleted) and changes
 * which sections show. Bound to setAccountGoal.
 */
function GoalToggle({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const goal = profile.user.accountGoal;
  const [pending, startTransition] = useTransition();

  function set(next: "looking_for_work" | "business") {
    if (next === goal || pending) return;
    setProfile((p) => ({ ...p, user: { ...p.user, accountGoal: next } }));
    startTransition(async () => {
      try {
        await setAccountGoal(next);
        toast.success(
          next === "looking_for_work"
            ? "Set to looking for work"
            : "Set to promoting your business"
        );
      } catch {
        // Roll back on failure.
        setProfile((p) => ({ ...p, user: { ...p.user, accountGoal: goal } }));
        toast.error("Couldn't switch");
      }
    });
  }

  return (
    <div className="mb-4 overflow-hidden rounded-xl border-2 border-ink-900 bg-white">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="h-5 w-1.5 rounded-sm bg-brand" />
        <div className="flex-1">
          <div className="font-display text-base leading-tight tracking-tight text-ink-900">
            What&apos;s your page for?
          </div>
          <div className="mt-0.5 text-xs text-ink-500">
            Switching changes which sections show. Nothing gets deleted.
          </div>
        </div>
      </div>
      <div className="border-t-2 border-ink-900 bg-muted/40 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => set("looking_for_work")}
            disabled={pending}
            className={cn(
              "rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition disabled:opacity-60",
              goal === "looking_for_work"
                ? "border-ink-900 bg-ink-900 text-white shadow-hard-sm"
                : "border-line bg-white text-ink-700 hover:border-ink-900 hover:text-ink-900"
            )}
          >
            I&apos;m looking for work
          </button>
          <button
            type="button"
            onClick={() => set("business")}
            disabled={pending}
            className={cn(
              "rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition disabled:opacity-60",
              goal === "business"
                ? "border-ink-900 bg-ink-900 text-white shadow-hard-sm"
                : "border-line bg-white text-ink-700 hover:border-ink-900 hover:text-ink-900"
            )}
          >
            I&apos;m promoting my business
          </button>
        </div>
      </div>
    </div>
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
    case "testimonials":
      return <TestimonialsEditor profile={profile} setProfile={setProfile} />;
    case "google_reviews":
      return <GoogleReviewsEditor profile={profile} setProfile={setProfile} />;
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
    case "website_link":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="websiteUrl"
          label="Your website address"
          placeholder="yourbusiness.com.au"
        />
      );
    case "custom_links":
      return <CustomLinksEditor profile={profile} setProfile={setProfile} />;
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
    case "email_button":
      return <PublicEmailEditor profile={profile} setProfile={setProfile} />;
    case "education":
      return (
        <p className="text-sm text-ink-500">
          Add your training and college below. Scroll down to the{" "}
          <strong className="text-ink-900">Training &amp; education</strong>{" "}
          editor.
        </p>
      );
    case "skills":
      return (
        <p className="text-sm text-ink-500">
          Add the skills you have on the tools below, in the{" "}
          <strong className="text-ink-900">Skills</strong> editor.
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
          className="w-full rounded-xl border-2 border-line px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
      ) : (
        <input
          value={local}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-xl border-2 border-line px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
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

/**
 * Public email editor for the email_button section. Auto-saves to
 * users.publicEmail via setPublicEmail (basic shape validated server-side).
 */
function PublicEmailEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const value = profile.user.publicEmail ?? "";
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local === value) return;
      setProfile((p) => ({ ...p, user: { ...p.user, publicEmail: local || null } }));
      setPublicEmail(local).catch(() =>
        toast.error("Enter a valid email address")
      );
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">
        Email for employers to reach you
      </label>
      <input
        type="email"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border-2 border-line px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
      />
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
            "ut-ready:bg-brand bg-brand text-ink-900 rounded-md px-4 py-2 text-sm font-bold border-2 border-ink-900",
          allowedContent: "text-ink-500 text-xs",
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

function GoogleReviewsEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  return (
    <div className="space-y-3">
      <FieldEditor
        profile={profile}
        setProfile={setProfile}
        field="googleReviewUrl"
        label="Google reviews link"
        placeholder="https://g.page/r/..."
      />
      <div className="grid grid-cols-2 gap-3">
        <NumericFieldEditor
          profile={profile}
          setProfile={setProfile}
          field="googleRating"
          label="Your rating"
          placeholder="4.9"
          min={0}
          max={5}
          step={0.1}
        />
        <NumericFieldEditor
          profile={profile}
          setProfile={setProfile}
          field="googleReviewCount"
          label="Number of reviews"
          placeholder="84"
          min={0}
          step={1}
        />
      </div>
      <p className="text-[11px] text-ink-500">
        Find these on your Google Business profile. We&apos;ll display{" "}
        <strong className="text-ink-900">five stars</strong> with the rating
        and review count. Leave them blank to show a plain link instead.
      </p>
    </div>
  );
}

function NumericFieldEditor({
  profile,
  setProfile,
  field,
  label,
  placeholder,
  min,
  max,
  step,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
  field: "googleRating" | "googleReviewCount";
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const current = profile.user[field];
  const initial = current === null || current === undefined ? "" : String(current);
  const [local, setLocal] = useState(initial);

  useEffect(() => {
    setLocal(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local === initial) return;
      const numeric =
        local.trim() === ""
          ? null
          : field === "googleRating"
            ? Number(local)
            : Math.round(Number(local));
      const clamped =
        numeric === null || Number.isNaN(numeric)
          ? null
          : Math.max(min ?? -Infinity, Math.min(max ?? Infinity, numeric));
      setProfile((p) => ({
        ...p,
        user: { ...p.user, [field]: clamped },
      }));
      updateProfile({ [field]: clamped } as never).catch(() =>
        toast.error("Couldn't save")
      );
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        className="w-full rounded-xl border-2 border-line px-3 py-2 text-base tabular-nums focus:border-ink-900 focus:outline-none"
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
            <Trash2 className="h-3 w-3" /> Remove
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
            "ut-ready:bg-ink-900 bg-ink-900 text-white rounded-md px-4 py-2 text-sm font-bold border-2 border-ink-900",
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
  const status = profile.user.availabilityStatus;
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => set("taking_on_work")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition",
          status === "taking_on_work"
            ? "border-ink-900 bg-ink-900 text-white shadow-hard-sm"
            : "border-line bg-white text-ink-700 hover:border-ink-900 hover:text-ink-900"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "taking_on_work" ? "bg-call" : "bg-ink-500/40"
          )}
        />
        Taking on work
      </button>
      <button
        type="button"
        onClick={() => set("fully_booked")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition",
          status === "fully_booked"
            ? "border-ink-900 bg-ink-900 text-white shadow-hard-sm"
            : "border-line bg-white text-ink-700 hover:border-ink-900 hover:text-ink-900"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "fully_booked" ? "bg-emergency" : "bg-ink-500/40"
          )}
        />
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
    const row = await addService({
      serviceName: name.trim(),
      description: desc.trim() || undefined,
    });
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
      {profile.services.length === 0 ? (
        <EmptyState
          title="Add what you do"
          body="Boiler service, bathroom install, leak repair — list the work you actually take on. Three or four is plenty."
        />
      ) : (
        <ul className="space-y-2">
          {profile.services.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3"
            >
              <div className="min-w-0">
                <div className="font-bold text-ink-900">{s.serviceName}</div>
                {s.description && (
                  <div className="mt-0.5 text-sm text-ink-500">
                    {s.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(s.id)}
                aria-label="Remove"
                className="flex-shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-emergency"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-xl border-2 border-dashed border-line bg-white p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service name (e.g. Bathroom installs)"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="One-line description (optional)"
          className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
        <button
          onClick={add}
          disabled={!name.trim()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5 hover:bg-ink-800 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add service
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

  const emptyCopy: Record<typeof type, { title: string; body: string }> = {
    gallery: {
      title: "No photos yet",
      body: "Snap your best work on your phone — finished bathrooms, neat pipework, clean vans. Up to 12 photos.",
    },
    before: {
      title: "No 'before' photos",
      body: "Customers love a transformation. Add the dingy bathroom, the broken boiler, the mossy roof — the starting point.",
    },
    after: {
      title: "No 'after' photos",
      body: "Pair each before with its after to show the result of your work.",
    },
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
        {label}
      </div>
      {list.length === 0 ? (
        <EmptyState title={emptyCopy[type].title} body={emptyCopy[type].body} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((p) => (
            <div key={p.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.photoUrl}
                alt=""
                className="h-20 w-20 rounded-lg border border-line object-cover"
              />
              <button
                onClick={() => remove(p.id)}
                aria-label="Remove"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-white shadow-sm hover:bg-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <UploadButton
        endpoint="gallery"
        appearance={{
          button:
            "ut-ready:bg-ink-900 bg-ink-900 text-white rounded-md px-4 py-2 text-sm font-bold border-2 border-ink-900",
          allowedContent: "text-ink-500 text-xs",
        }}
        onClientUploadComplete={async (res) => {
          if (!res) return;
          for (const r of res) {
            const row = await addPhoto({ photoUrl: r.url, type });
            setProfile((p) => ({ ...p, photos: [...p.photos, row] }));
          }
          toast.success(`${res.length} photo${res.length === 1 ? "" : "s"} added`);
        }}
        onUploadError={(err) => {
          toast.error(err.message);
        }}
      />
    </div>
  );
}

/**
 * Compact empty state used inside expanded section editors.
 */
function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-line bg-white p-5 text-center">
      <div className="font-display text-lg leading-tight tracking-tight text-ink-900">
        {title}
      </div>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">{body}</p>
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
    const row = await addCertification({
      name: name.trim(),
      badgeUrl: badgeUrl ?? undefined,
    });
    setProfile((p) => ({
      ...p,
      certifications: [...p.certifications, row],
    }));
    setName("");
    setBadgeUrl(null);
  }

  async function remove(id: number) {
    await deleteCertification(id);
    setProfile((p) => ({
      ...p,
      certifications: p.certifications.filter((c) => c.id !== id),
    }));
  }

  return (
    <div className="space-y-3">
      {profile.certifications.length === 0 ? (
        <EmptyState
          title="Your trust badges"
          body="Gas Safe, NICEIC, CSCS, City &amp; Guilds, public liability — the credentials that make customers click Call."
        />
      ) : (
        <ul className="space-y-2">
          {profile.certifications.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {c.badgeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.badgeUrl}
                    alt=""
                    className="h-8 w-8 flex-shrink-0 rounded object-contain"
                  />
                ) : (
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-muted">
                    <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={2.5} />
                  </span>
                )}
                <span className="truncate font-bold text-ink-900">{c.name}</span>
              </div>
              <button
                onClick={() => remove(c.id)}
                aria-label="Remove"
                className="flex-shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-emergency"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-xl border-2 border-dashed border-line bg-white p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gas Safe Registered #12345"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-2">
          <UploadButton
            endpoint="certification"
            appearance={{
              button:
                "ut-ready:bg-white bg-white text-ink-900 border-2 border-ink-900 rounded-md px-3 py-1.5 text-xs font-bold",
              allowedContent: "hidden",
            }}
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url;
              if (url) setBadgeUrl(url);
            }}
            onUploadError={(err) => {
              toast.error(err.message);
            }}
          />
          <span className="text-[11px] text-ink-500">Badge image (optional)</span>
          {badgeUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badgeUrl}
              alt=""
              className="h-8 w-8 rounded object-contain"
            />
          )}
        </div>
        <button
          onClick={add}
          disabled={!name.trim()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5 hover:bg-ink-800 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add certification
        </button>
      </div>
    </div>
  );
}

const MAX_CUSTOM_LINKS = 10;

function CustomLinksEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const atCap = profile.customLinks.length >= MAX_CUSTOM_LINKS;

  function add() {
    if (!title.trim() || !url.trim() || pending) return;
    startTransition(async () => {
      try {
        const row = await addCustomLink({ title: title.trim(), url: url.trim() });
        setProfile((p) => ({ ...p, customLinks: [...p.customLinks, row] }));
        setTitle("");
        setUrl("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't add that link");
      }
    });
  }

  async function remove(id: number) {
    await deleteCustomLink(id);
    setProfile((p) => ({
      ...p,
      customLinks: p.customLinks.filter((l) => l.id !== id),
    }));
  }

  return (
    <div className="space-y-3">
      {profile.customLinks.length === 0 ? (
        <EmptyState
          title="Add any link you like"
          body="Your YouTube channel, a booking page, a price list. Give it a title and paste the link. We'll show the right logo automatically."
        />
      ) : (
        <ul className="space-y-2">
          {profile.customLinks.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <BrandChip brand={detectBrand(l.url)} className="h-8 w-8 rounded-lg" />
                <div className="min-w-0">
                  <div className="truncate font-bold text-ink-900">{l.title}</div>
                  <div className="truncate text-xs text-ink-500">{l.url}</div>
                </div>
              </div>
              <button
                onClick={() => remove(l.id)}
                aria-label="Remove"
                className="flex-shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-emergency"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {atCap ? (
        <p className="text-xs text-ink-500">
          That&apos;s the maximum of {MAX_CUSTOM_LINKS} links. Remove one to add another.
        </p>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-line bg-white p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 80))}
            placeholder="Link title (e.g. Watch my YouTube)"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste the link (e.g. youtube.com/@yourchannel)"
            inputMode="url"
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
          />
          <button
            onClick={add}
            disabled={!title.trim() || !url.trim() || pending}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5 hover:bg-ink-800 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add link
          </button>
        </div>
      )}
    </div>
  );
}

function TestimonialsEditor({
  profile,
  setProfile,
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
}) {
  const [customerName, setCustomerName] = useState("");
  const [quote, setQuote] = useState("");
  const [location, setLocation] = useState("");

  async function add() {
    if (!customerName.trim() || !quote.trim()) return;
    const row = await addTestimonial({
      customerName: customerName.trim(),
      quote: quote.trim(),
      location: location.trim() || undefined,
    });
    setProfile((p) => ({ ...p, testimonials: [...p.testimonials, row] }));
    setCustomerName("");
    setQuote("");
    setLocation("");
  }

  async function remove(id: number) {
    await deleteTestimonial(id);
    setProfile((p) => ({
      ...p,
      testimonials: p.testimonials.filter((t) => t.id !== id),
    }));
  }

  return (
    <div className="space-y-3">
      {profile.testimonials.length === 0 ? (
        <EmptyState
          title="Add a customer quote"
          body="Pop in what a happy customer texted you about the job. Two or three short quotes is plenty — they're worth more than a star rating."
        />
      ) : (
        <ul className="space-y-2">
          {profile.testimonials.map((t) => (
            <li
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3"
            >
              <div className="flex min-w-0 gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-muted">
                  <Quote className="h-3.5 w-3.5 text-brand" fill="currentColor" strokeWidth={0} />
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-3 text-sm leading-snug text-ink-800">
                    {t.quote}
                  </p>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
                    {t.customerName}
                    {t.location ? ` · ${t.location}` : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(t.id)}
                aria-label="Remove"
                className="flex-shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-emergency"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-xl border-2 border-dashed border-line bg-white p-3">
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name (e.g. Sarah M.)"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value.slice(0, 280))}
          placeholder="What they said — keep it short and real."
          rows={3}
          className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
        <div className="mt-1 text-[11px] text-ink-500">
          {quote.length}/280 characters
        </div>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where they're based (optional)"
          className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-ink-900 focus:outline-none"
        />
        <button
          onClick={add}
          disabled={!customerName.trim() || !quote.trim()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold text-white transition active:translate-y-0.5 hover:bg-ink-800 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add review
        </button>
      </div>
    </div>
  );
}
