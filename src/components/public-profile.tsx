"use client";

import { useEffect, useState, useRef } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Facebook,
  Instagram,
  Music2,
  CreditCard,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Camera,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import { trackEvent, type TrackEventType } from "@/lib/tracker";
import type { FullProfile } from "@/lib/queries";
import type { SectionKey } from "@/lib/sections";

function enabled(profile: FullProfile, key: SectionKey) {
  const s = profile.sections.find((s) => s.sectionKey === key);
  return s?.isEnabled ?? false;
}

export function PublicProfile({
  profile,
  preview = false,
}: {
  profile: FullProfile;
  preview?: boolean;
}) {
  const { user } = profile;
  const accent = user.accentColor || "#F97316";
  const orderedSections = profile.sections.filter((s) => s.isEnabled);

  // Fire a single 'view' event when the public page mounts. Skipped in
  // dashboard live-preview mode so the tradesman's own previewing doesn't
  // poison their own analytics.
  useEffect(() => {
    if (preview) return;
    trackEvent(user.slug, "view");
  }, [preview, user.slug]);

  // Banner is a hero element — always renders first if enabled, regardless
  // of where the user has dragged it in the section order. Pulled out of
  // the main switch below so the rest of the order stays user-controlled.
  const bannerEnabled = orderedSections.some(
    (s) => s.sectionKey === "banner_image"
  );

  return (
    <div
      className="mx-auto min-h-screen w-full max-w-md bg-white pb-24 font-sans"
      style={{ ["--accent" as never]: accent }}
    >
      {bannerEnabled && <BannerImage profile={profile} />}
      {orderedSections.map((s) => {
        const key = s.sectionKey as SectionKey;
        switch (key) {
          case "banner_image":
            return null; // already rendered above
          case "profile_photo":
            return <ProfileHeader key={key} profile={profile} />;
          case "availability_status":
            return <AvailabilityBadge key={key} profile={profile} />;
          case "call_button":
            return <CallButton key={key} profile={profile} />;
          case "whatsapp_button":
            return <WhatsappButton key={key} profile={profile} />;
          case "emergency_callout":
            return user.plan === "paid" ? <EmergencyButton key={key} profile={profile} /> : null;
          case "about_me":
            return <AboutMe key={key} profile={profile} />;
          case "services_list":
            return <ServicesList key={key} profile={profile} />;
          case "photo_gallery":
            return <Gallery key={key} profile={profile} />;
          case "before_after_photos":
            return <BeforeAfter key={key} profile={profile} />;
          case "certifications":
            return <Certifications key={key} profile={profile} />;
          case "google_reviews":
            return <GoogleReviews key={key} profile={profile} />;
          case "quote_form":
            return user.plan === "paid" ? <QuoteForm key={key} profile={profile} preview={preview} /> : null;
          case "areas_covered":
            return <AreasCovered key={key} profile={profile} />;
          case "payment_methods":
            return <PaymentMethods key={key} profile={profile} />;
          case "facebook_link":
            return <FacebookLink key={key} profile={profile} />;
          case "instagram_link":
            return <InstagramLink key={key} profile={profile} />;
          case "tiktok_link":
            return <TiktokLink key={key} profile={profile} />;
          case "intro_video":
            return user.plan === "paid" ? <IntroVideo key={key} profile={profile} /> : null;
          default:
            return null;
        }
      })}

      {user.plan === "free" && <PoweredByFooter />}
    </div>
  );
}

function Section({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <section className={cn("px-5 pt-7", className)}>
      {title && (
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function BannerImage({ profile }: { profile: FullProfile }) {
  const url = profile.user.bannerImageUrl;
  if (!url) return null;
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="block h-48 w-full object-cover sm:h-56"
        style={{ objectPosition: "center" }}
        loading="lazy"
      />
      {/* hard accent bar at the bottom of the banner — clear divider, no mush */}
      <div
        aria-hidden
        className="h-1 w-full"
        style={{ background: "var(--accent)" }}
      />
    </div>
  );
}

function ProfileHeader({ profile }: { profile: FullProfile }) {
  const { user } = profile;
  const bannerActive =
    !!user.bannerImageUrl && enabled(profile, "banner_image");
  return (
    <header
      className={cn(
        "relative px-5",
        bannerActive ? "-mt-16 pb-2" : "pt-9"
      )}
    >
      {!bannerActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-44 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, var(--accent), transparent 70%)",
          }}
        />
      )}
      <div className="relative flex flex-col items-center text-center">
        {user.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePhotoUrl}
            alt={user.name ?? "Profile"}
            className={cn(
              "h-32 w-32 rounded-full object-cover",
              bannerActive
                ? "ring-[5px] shadow-[0_8px_24px_rgba(15,23,42,0.25)]"
                : "ring-[5px]"
            )}
            style={{ ["--tw-ring-color" as never]: "var(--accent)" }}
          />
        ) : (
          <div
            className={cn(
              "flex h-32 w-32 items-center justify-center rounded-full font-display text-5xl text-white",
              bannerActive
                ? "ring-[5px] shadow-[0_8px_24px_rgba(15,23,42,0.25)]"
                : "ring-[5px]"
            )}
            style={{
              background: "var(--accent)",
              ["--tw-ring-color" as never]: "var(--accent)",
            }}
          >
            {(user.name ?? "T")[0].toUpperCase()}
          </div>
        )}
        <h1 className="mt-5 font-display text-3xl leading-tight tracking-tight text-ink-900">
          {user.name || "Your name"}
        </h1>
        {user.trade && (
          <p
            className="mt-0.5 text-sm font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--accent)" }}
          >
            {user.trade}
            {user.location ? ` · ${user.location}` : ""}
          </p>
        )}
      </div>
    </header>
  );
}

function AvailabilityBadge({ profile }: { profile: FullProfile }) {
  const taking = profile.user.availabilityStatus === "taking_on_work";
  return (
    <div className="mt-4 flex justify-center px-5">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider",
          taking
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        )}
      >
        <span
          className={cn(
            "relative flex h-2 w-2",
            taking ? "" : ""
          )}
        >
          <span
            className={cn(
              "absolute inset-0 rounded-full",
              taking ? "animate-ping bg-green-400" : ""
            )}
          />
          <span
            className={cn(
              "relative h-2 w-2 rounded-full",
              taking ? "bg-green-500" : "bg-red-500"
            )}
          />
        </span>
        {taking ? "Taking on work" : "Fully booked"}
      </div>
    </div>
  );
}

function CallButton({ profile }: { profile: FullProfile }) {
  if (!profile.user.phone) return null;
  return (
    <Section>
      <ActionButton
        href={`tel:${profile.user.phone}`}
        onClickTrack={() => trackEvent(profile.user.slug, "call_click")}
        bandClassName="bg-green-600"
        bandStyle={null}
        labelClassName="text-green-700"
        label="Call now"
        icon={<Phone className="h-6 w-6" strokeWidth={2.5} />}
        body={profile.user.phone}
        tabularBody
      />
    </Section>
  );
}

function WhatsappButton({ profile }: { profile: FullProfile }) {
  const number = profile.user.whatsappNumber || profile.user.phone;
  if (!number) return null;
  const cleaned = number.replace(/[^0-9+]/g, "");
  return (
    <Section>
      <ActionButton
        href={`https://wa.me/${cleaned.replace(/^\+/, "")}`}
        target="_blank"
        onClickTrack={() => trackEvent(profile.user.slug, "whatsapp_click")}
        bandClassName="bg-[#25D366]"
        bandStyle={null}
        labelClassName="text-[#1A8E4A]"
        label="WhatsApp"
        icon={<MessageCircle className="h-6 w-6" strokeWidth={2.5} />}
        body={
          <span className="inline-flex items-baseline gap-1.5">
            Send a message
            <span className="text-base">→</span>
          </span>
        }
      />
    </Section>
  );
}

function EmergencyButton({ profile }: { profile: FullProfile }) {
  const number = profile.user.emergencyNumber || profile.user.phone;
  if (!number) return null;
  return (
    <Section>
      <ActionButton
        href={`tel:${number}`}
        onClickTrack={() => trackEvent(profile.user.slug, "call_click")}
        bandClassName="text-white"
        bandStyle={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #DC2626 0 8px, #991B1B 8px 16px)",
        }}
        labelClassName="text-red-700"
        label="Emergency · 24/7"
        icon={<Phone className="h-6 w-6" strokeWidth={2.5} />}
        body={number}
        tabularBody
      />
    </Section>
  );
}

/**
 * Hard-edged action button, like an industrial pushbutton: 2px ink-900
 * outline, function-coloured side band holding the icon, white body with a
 * mini-caps label and a big Archivo Black hero line (a phone number or
 * action text). Sits on a hard 4px ink-900 shadow plate — pressing the
 * button drops it into its own shadow.
 */
function ActionButton({
  href,
  target,
  onClickTrack,
  bandClassName,
  bandStyle,
  labelClassName,
  label,
  icon,
  body,
  tabularBody,
}: {
  href: string;
  target?: string;
  onClickTrack?: () => void;
  bandClassName: string;
  bandStyle: React.CSSProperties | null;
  labelClassName: string;
  label: string;
  icon: React.ReactNode;
  body: React.ReactNode;
  tabularBody?: boolean;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      onClick={onClickTrack}
      className="flex translate-y-0 overflow-hidden rounded-2xl border-[2.5px] border-ink-900 bg-white shadow-[0_4px_0_0_#0F172A] transition-all duration-75 ease-out active:translate-y-1 active:shadow-[0_0_0_0_#0F172A]"
    >
      <div
        className={cn(
          "flex w-[68px] flex-shrink-0 items-center justify-center border-r-[2.5px] border-ink-900 text-white",
          bandClassName
        )}
        style={bandStyle ?? undefined}
      >
        {icon}
      </div>
      <div className="flex-1 px-4 py-3.5">
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.22em]",
            labelClassName
          )}
        >
          {label}
        </div>
        <div
          className={cn(
            "mt-0.5 font-display text-[22px] leading-tight tracking-tight text-ink-900",
            tabularBody && "tabular-nums"
          )}
        >
          {body}
        </div>
      </div>
    </a>
  );
}

function AboutMe({ profile }: { profile: FullProfile }) {
  if (!profile.user.about) return null;
  return (
    <Section title="About">
      <p className="whitespace-pre-line text-base leading-relaxed text-ink-800">
        {profile.user.about}
      </p>
      {profile.user.yearsExperience ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-ink-700">
          <Clock className="h-4 w-4" /> {profile.user.yearsExperience} years' experience
        </div>
      ) : null}
    </Section>
  );
}

function ServicesList({ profile }: { profile: FullProfile }) {
  if (profile.services.length === 0) return null;
  return (
    <Section title="Services">
      <ul className="space-y-3">
        {profile.services.map((s) => (
          <li key={s.id} className="rounded-2xl border border-neutral-200 p-4">
            <div className="font-semibold text-ink-900">{s.serviceName}</div>
            {s.description && (
              <div className="mt-1 text-sm text-ink-700">{s.description}</div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Gallery({ profile }: { profile: FullProfile }) {
  const gallery = profile.photos.filter((p) => p.type === "gallery");
  const ref = useRef<HTMLDivElement>(null);
  if (gallery.length === 0) return null;

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <Section title="Recent work">
      <div className="relative">
        <div
          ref={ref}
          className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {gallery.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.photoUrl}
              alt={p.caption ?? ""}
              className="aspect-[4/3] h-56 w-72 flex-shrink-0 snap-center rounded-2xl object-cover"
            />
          ))}
        </div>
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
              aria-label="prev"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
              aria-label="next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </Section>
  );
}

function BeforeAfter({ profile }: { profile: FullProfile }) {
  const beforePhotos = profile.photos.filter((p) => p.type === "before");
  const afterPhotos = profile.photos.filter((p) => p.type === "after");
  if (beforePhotos.length === 0 && afterPhotos.length === 0) return null;

  const pairs = beforePhotos.map((b) => ({
    before: b,
    after: afterPhotos.find((a) => a.pairId === b.id) ?? afterPhotos[0],
  }));

  return (
    <Section title="Before & after">
      <div className="space-y-4">
        {pairs.map((pair) => (
          <div key={pair.before.id} className="grid grid-cols-2 gap-2">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pair.before.photoUrl} alt="before" className="aspect-square w-full rounded-xl object-cover" />
              <div className="mt-1 text-center text-xs font-semibold text-neutral-500">BEFORE</div>
            </div>
            <div>
              {pair.after && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pair.after.photoUrl} alt="after" className="aspect-square w-full rounded-xl object-cover" />
              )}
              <div className="mt-1 text-center text-xs font-semibold text-neutral-500">AFTER</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Certifications({ profile }: { profile: FullProfile }) {
  if (profile.certifications.length === 0) return null;
  return (
    <Section title="Qualified">
      <div className="flex flex-wrap gap-2">
        {profile.certifications.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 shadow-sm"
          >
            {c.badgeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.badgeUrl} alt="" className="h-6 w-6 rounded object-contain" />
            ) : (
              <ShieldCheck className="h-4 w-4" style={{ color: "var(--accent)" }} />
            )}
            {c.name}
          </div>
        ))}
      </div>
    </Section>
  );
}

function GoogleReviews({ profile }: { profile: FullProfile }) {
  if (!profile.user.googleReviewUrl) return null;
  return (
    <Section>
      <a
        href={profile.user.googleReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-neutral-200 bg-white px-5 py-4 text-base font-semibold text-ink-900 active:scale-[0.98]"
      >
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        Read & leave reviews on Google
      </a>
    </Section>
  );
}

function AreasCovered({ profile }: { profile: FullProfile }) {
  if (!profile.user.areasCovered) return null;
  return (
    <Section title="Areas covered">
      <div className="flex items-start gap-2 rounded-2xl bg-neutral-50 p-4 text-base text-ink-800">
        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
        <span>{profile.user.areasCovered}</span>
      </div>
    </Section>
  );
}

function PaymentMethods({ profile }: { profile: FullProfile }) {
  if (!profile.user.paymentMethods) return null;
  return (
    <Section title="Payment">
      <div className="flex items-start gap-2 rounded-2xl bg-neutral-50 p-4 text-base text-ink-800">
        <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
        <span>{profile.user.paymentMethods}</span>
      </div>
    </Section>
  );
}

function FacebookLink({ profile }: { profile: FullProfile }) {
  if (!profile.user.facebookUrl) return null;
  return (
    <SocialLink
      slug={profile.user.slug}
      href={profile.user.facebookUrl}
      label="Follow on Facebook"
      icon={<Facebook className="h-5 w-5 text-[#1877F2]" />}
    />
  );
}

function InstagramLink({ profile }: { profile: FullProfile }) {
  if (!profile.user.instagramUrl) return null;
  return (
    <SocialLink
      slug={profile.user.slug}
      href={profile.user.instagramUrl}
      label="Follow on Instagram"
      icon={
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">
          <Instagram className="h-4 w-4" />
        </span>
      }
    />
  );
}

function TiktokLink({ profile }: { profile: FullProfile }) {
  if (!profile.user.tiktokUrl) return null;
  return (
    <SocialLink
      slug={profile.user.slug}
      href={profile.user.tiktokUrl}
      label="Follow on TikTok"
      icon={
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink-900 text-white">
          <Music2 className="h-4 w-4" />
        </span>
      }
    />
  );
}

function SocialLink({
  slug,
  href,
  label,
  icon,
}: {
  slug: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Section>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(slug, "social_click")}
        className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-base font-bold text-ink-900 transition active:scale-[0.98]"
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="h-4 w-4 text-ink-500" />
      </a>
    </Section>
  );
}

function IntroVideo({ profile }: { profile: FullProfile }) {
  if (!profile.user.introVideoUrl) return null;
  return (
    <Section title="Meet me">
      <video
        src={profile.user.introVideoUrl}
        controls
        playsInline
        className="w-full rounded-2xl"
      />
    </Section>
  );
}

function QuoteForm({ profile, preview }: { profile: FullProfile; preview: boolean }) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview) {
      toast.info("This is a preview — the form is fully working on your live page.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      // honeypot — real users leave it blank; bots fill every field
      website: String(fd.get("website") || ""),
      customerName: String(fd.get("customerName") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
      jobDescription: String(fd.get("jobDescription") || ""),
      postcode: String(fd.get("postcode") || ""),
      photoUrls,
    };
    if (!body.customerName || !body.customerPhone || !body.jobDescription) {
      toast.error("Add your name, phone and a description.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quote/${profile.user.slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Too many requests — try again in a bit.");
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setSent(true);
      form.reset();
      setPhotoUrls([]);
      trackEvent(profile.user.slug, "quote_submit");
      toast.success("Sent. They'll get back to you soon.");
    } catch (err) {
      toast.error("Couldn't send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Section title="Request sent">
        <div className="rounded-2xl bg-green-50 p-5 text-green-800">
          <div className="text-lg font-bold">Got it.</div>
          <p className="mt-1 text-sm">
            {profile.user.name?.split(" ")[0] || "They"} will get in touch shortly.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Get a quote">
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Honeypot — hidden from real users, bots fill it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <input
          name="customerName"
          placeholder="Your name"
          required
          className="input"
        />
        <input
          name="customerPhone"
          type="tel"
          placeholder="Your phone"
          required
          className="input"
        />
        <input
          name="postcode"
          placeholder="Postcode"
          className="input"
        />
        <textarea
          name="jobDescription"
          placeholder="Describe the job"
          rows={4}
          required
          className="input min-h-[120px]"
        />
        <div>
          <UploadButton
            endpoint="quotePhotos"
            appearance={{
              button:
                "ut-ready:bg-neutral-100 ut-uploading:opacity-60 bg-neutral-100 text-ink-900 rounded-2xl px-5 py-3 text-base font-semibold border border-neutral-200 w-full",
              allowedContent: "text-neutral-500 text-xs",
            }}
            content={{
              button: (
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Add photos (optional)
                </span>
              ),
            }}
            onClientUploadComplete={(res) => {
              if (res) setPhotoUrls((p) => [...p, ...res.map((r) => r.url)]);
            }}
            onUploadError={(err) => { toast.error(err.message); }}
          />
          {photoUrls.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {photoUrls.map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-bold text-white shadow-lg active:scale-[0.98] disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5" /> Send request</>}
        </button>
      </form>
    </Section>
  );
}

function PoweredByFooter() {
  return (
    <footer className="mt-12 px-5 pb-2 text-center">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-500 hover:text-ink-700"
      >
        <span>Built with</span>
        <span className="font-display tracking-tight text-ink-900">TRADELINK</span>
        <span className="text-ink-500">— get yours free</span>
      </a>
    </footer>
  );
}
