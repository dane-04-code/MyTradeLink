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
import { SECTION_DEFS, type SectionKey, sectionDef } from "@/lib/sections";
import { PublicProfile } from "@/components/public-profile";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import {
  toggleSection,
  reorderSections,
  updateProfile,
  updateSlug,
  addService,
  deleteService,
  addPhoto,
  deletePhoto,
  addCertification,
  deleteCertification,
} from "./actions";

export function DashboardClient({ initialProfile }: { initialProfile: FullProfile }) {
  const [profile, setProfile] = useState<FullProfile>(initialProfile);
  const isPaid = profile.user.plan === "paid";
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${profile.user.slug}`
      : `/t/${profile.user.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:py-10">
      {/* Top: link bar + upgrade banner */}
      <LinkBar
        slug={profile.user.slug}
        publicUrl={publicUrl}
        onSlugChange={(s) =>
          setProfile((p) => ({ ...p, user: { ...p.user, slug: s } }))
        }
      />

      {!isPaid && <UpgradeBanner />}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: editor */}
        <div className="space-y-4">
          <SectionsEditor profile={profile} setProfile={setProfile} />
        </div>
        {/* RIGHT: live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Live preview
            </h2>
            <a
              href={`/t/${profile.user.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              <Eye className="h-4 w-4" /> Open public page
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl border-4 border-ink-900 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-center bg-ink-900 py-1.5">
              <div className="h-1 w-16 rounded-full bg-white/30" />
            </div>
            <div className="max-h-[80vh] overflow-y-auto bg-neutral-100">
              <PublicProfile profile={profile} preview />
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Your link
        </div>
        <div className="flex-1 min-w-[200px]">
          {editing ? (
            <div className="flex items-center gap-2">
              <span className="text-base text-ink-500">/t/</span>
              <input
                value={draft}
                onChange={(e) =>
                  setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                }
                className="flex-1 rounded-xl border-2 border-neutral-200 px-3 py-1.5 text-base focus:border-brand focus:outline-none"
                autoFocus
              />
              <button
                onClick={save}
                disabled={pending}
                className="rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold text-white"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(slug);
                }}
                className="text-sm text-neutral-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="truncate text-base font-semibold text-ink-900 hover:underline"
            >
              {publicUrl}
            </button>
          )}
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function UpgradeBanner() {
  return (
    <Link
      href="/pricing"
      className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand to-brand-600 p-4 text-white shadow-card transition hover:brightness-110"
    >
      <Sparkles className="h-5 w-5" />
      <div className="flex-1">
        <div className="font-semibold">Unlock all features for £9/month</div>
        <div className="text-sm text-white/80">
          Remove the TradeLink badge · quote form with photos · emergency button · intro video
        </div>
      </div>
      <div className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand">
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
  const isPaid = profile.user.plan === "paid";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ordered = useMemo(
    () =>
      [...profile.sections].sort((a, b) => a.displayOrder - b.displayOrder),
    [profile.sections]
  );

  function onDragEnd(event: { active: { id: string | number }; over: { id: string | number } | null }) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = ordered.findIndex((s) => s.sectionKey === event.active.id);
    const newIndex = ordered.findIndex((s) => s.sectionKey === event.over!.id);
    const moved = arrayMove(ordered, oldIndex, newIndex);
    const withOrder = moved.map((s, idx) => ({ ...s, displayOrder: idx }));
    setProfile((p) => ({ ...p, sections: withOrder }));
    reorderSections(moved.map((s) => s.sectionKey as SectionKey)).catch(() =>
      toast.error("Couldn't save order")
    );
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
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">
        Page sections
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Toggle to show or hide. Drag to reorder. Changes save automatically.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd as never}>
        <SortableContext items={ordered.map((s) => s.sectionKey)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {ordered.map((s) => {
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
                  onToggle={(on) => toggle(s.sectionKey as SectionKey, on, locked)}
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
        "rounded-2xl border border-neutral-200 bg-white",
        isDragging && "shadow-card"
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag"
          className="cursor-grab touch-none rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-900">{label}</span>
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                <Lock className="h-3 w-3" /> Paid
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-500">{description}</div>
        </button>

        <Toggle checked={enabled} onChange={onToggle} disabled={locked} />

        {children && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        )}
      </div>
      {open && children && (
        <div className="border-t border-neutral-100 p-4">{children}</div>
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
    case "emergency_button":
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
        />
      );
    case "services":
      return <ServicesEditor profile={profile} setProfile={setProfile} />;
    case "gallery":
      return <PhotosEditor profile={profile} setProfile={setProfile} type="gallery" label="Gallery photos" />;
    case "before_after":
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
    case "facebook":
      return (
        <FieldEditor
          profile={profile}
          setProfile={setProfile}
          field="facebookUrl"
          label="Facebook page URL"
          placeholder="https://facebook.com/..."
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
}: {
  profile: FullProfile;
  setProfile: React.Dispatch<React.SetStateAction<FullProfile>>;
  field: keyof FullProfile["user"];
  label: string;
  placeholder?: string;
  textarea?: boolean;
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

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
      ) : (
        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2 text-base focus:border-brand focus:outline-none"
        />
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
