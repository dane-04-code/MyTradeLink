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
  Quote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import { trackEvent, type TrackEventType } from "@/lib/tracker";
import { StickyContactBar } from "@/components/sticky-contact-bar";
import { Wordmark } from "@/components/wordmark";
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
          case "testimonials":
            return <Testimonials key={key} profile={profile} />;
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

      <StickyContactBar profile={profile} preview={preview} />
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
            className="h-32 w-32 rounded-full object-cover ring-[5px]"
            style={{ ["--tw-ring-color" as never]: "var(--accent)" }}
          />
        ) : (
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full font-display text-5xl text-white ring-[5px]"
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
          "inline-flex items-center gap-2 rounded-md border-2 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]",
          taking
            ? "border-call text-call"
            : "border-emergency text-emergency"
        )}
      >
        <span className="relative flex h-2 w-2">
          {taking && (
            <span className="absolute inset-0 animate-ping rounded-full bg-call" />
          )}
          <span
            className={cn(
              "relative h-2 w-2 rounded-full",
              taking ? "bg-call" : "bg-emergency"
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
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-line bg-muted px-3 py-1 text-sm font-bold text-ink-700">
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
      <ul className="space-y-2.5">
        {profile.services.map((s) => (
          <li key={s.id} className="rounded-xl border-2 border-line bg-white p-4">
            <div className="font-bold text-ink-900">{s.serviceName}</div>
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
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-ink-900 bg-white p-2 shadow-hard-sm hover:bg-muted"
              aria-label="prev"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-ink-900 bg-white p-2 shadow-hard-sm hover:bg-muted"
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
            className="flex items-center gap-2 rounded-md border-2 border-ink-900 bg-white px-3 py-2 text-sm font-bold text-ink-900"
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

function Testimonials({ profile }: { profile: FullProfile }) {
  if (profile.testimonials.length === 0) return null;
  return (
    <Section title="What customers say">
      <ul className="space-y-3">
        {profile.testimonials.map((t) => (
          <li
            key={t.id}
            className="relative overflow-hidden rounded-2xl border-[2.5px] border-ink-900 bg-white px-4 pb-4 pt-5 shadow-[0_4px_0_0_#0F172A]"
          >
            <Quote
              aria-hidden
              className="absolute -left-1 -top-1 h-10 w-10 -rotate-12 opacity-15"
              style={{ color: "var(--accent)" }}
              fill="currentColor"
              strokeWidth={0}
            />
            <p className="relative whitespace-pre-line text-[15px] leading-relaxed text-ink-800">
              {t.quote}
            </p>
            <div className="mt-3 flex items-baseline gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
              <span className="text-ink-900">— {t.customerName}</span>
              {t.location && (
                <span className="text-ink-500">· {t.location}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function GoogleReviews({ profile }: { profile: FullProfile }) {
  const { googleReviewUrl, googleRating, googleReviewCount } = profile.user;
  if (!googleReviewUrl) return null;

  const hasRating =
    typeof googleRating === "number" && googleRating > 0;
  const reviewCount = googleReviewCount ?? 0;

  // Fallback to the simple button if the tradesman hasn't filled in their
  // rating / count yet — same shape as a SocialLink so it lives quietly
  // alongside the other links.
  if (!hasRating) {
    return (
      <SocialLink
        slug={profile.user.slug}
        href={googleReviewUrl}
        label="Read & leave reviews on Google"
        icon={
          <Star
            className="h-5 w-5 fill-yellow-400 text-yellow-400"
            strokeWidth={1.5}
          />
        }
      />
    );
  }

  // Full rating card.
  return (
    <Section title="Reviews">
      <a
        href={googleReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block translate-y-0 overflow-hidden rounded-2xl border-[2.5px] border-ink-900 bg-white shadow-[0_4px_0_0_#0F172A] transition-all duration-75 ease-out active:translate-y-1 active:shadow-[0_0_0_0_#0F172A]"
      >
        <div className="flex items-center gap-4 p-4">
          <div className="flex flex-col items-center justify-center">
            <span className="font-display text-4xl leading-none tracking-tight text-ink-900 tabular-nums">
              {googleRating!.toFixed(1)}
            </span>
            <StarRow rating={googleRating!} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
              On Google
            </div>
            <div className="mt-0.5 font-display text-base leading-tight tracking-tight text-ink-900">
              {reviewCount > 0 ? (
                <>
                  {reviewCount.toLocaleString()}{" "}
                  {reviewCount === 1 ? "review" : "reviews"}
                </>
              ) : (
                "Google reviews"
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-ink-700">
              Read or leave one →
            </div>
          </div>
        </div>
      </a>
    </Section>
  );
}

/**
 * Five-star row with partial fill on the last not-yet-full star so a 4.9
 * rating shows as 4 full stars + 90% of a fifth, not as 5 solid stars.
 */
function StarRow({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <div className="mt-1 flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, r - i));
        return (
          <div key={i} className="relative">
            <Star
              className="h-3.5 w-3.5 text-neutral-300"
              strokeWidth={1.5}
              fill="currentColor"
            />
            {fill > 0 && (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AreasCovered({ profile }: { profile: FullProfile }) {
  if (!profile.user.areasCovered) return null;
  return (
    <Section title="Areas covered">
      <div className="flex items-start gap-2 rounded-xl border-2 border-line bg-muted p-4 text-base text-ink-800">
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
      <div className="flex items-start gap-2 rounded-xl border-2 border-line bg-muted p-4 text-base text-ink-800">
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
        className="flex w-full items-center gap-3 rounded-xl border-2 border-line bg-white px-4 py-3.5 text-base font-bold text-ink-900 transition active:translate-y-0.5 hover:border-ink-900"
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
  // Number of photo files currently uploading. While > 0, the submit
  // button is disabled — submitting mid-upload would drop those photos.
  const [uploadingCount, setUploadingCount] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview) {
      toast.info("This is a preview — the form is fully working on your live page.");
      return;
    }
    if (uploadingCount > 0) {
      toast.error("Hold on — photos are still uploading.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      // honeypot — real users leave it blank; bots fill every field
      website: String(fd.get("website") || ""),
      customerName: String(fd.get("customerName") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
      customerEmail: String(fd.get("customerEmail") || ""),
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
        <div className="rounded-xl border-2 border-call bg-white p-5 text-ink-900">
          <div className="font-display text-lg leading-tight tracking-tight">Got it.</div>
          <p className="mt-1 text-sm text-ink-700">
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
          name="customerEmail"
          type="email"
          placeholder="Your email (optional)"
          autoComplete="email"
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
                "ut-ready:bg-muted ut-uploading:bg-muted ut-uploading:opacity-60 bg-muted text-ink-900 rounded-xl px-5 py-3 text-base font-bold border-2 border-line w-full",
              allowedContent: "text-ink-500 text-xs",
            }}
            content={{
              button: ({ ready, isUploading }) => {
                if (isUploading) {
                  return (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                    </span>
                  );
                }
                if (!ready) {
                  return <span className="text-ink-500">Loading…</span>;
                }
                return (
                  <span className="flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Add photos (optional)
                  </span>
                );
              },
              allowedContent: "Up to 3 photos · 4MB each",
            }}
            onBeforeUploadBegin={(files) => {
              setUploadingCount((c) => c + files.length);
              return files;
            }}
            onClientUploadComplete={(res) => {
              if (res) {
                setPhotoUrls((p) => [
                  ...p,
                  ...res.map((r) => r.ufsUrl ?? r.url),
                ]);
              }
              setUploadingCount(0);
            }}
            onUploadError={(err) => {
              toast.error(err.message);
              setUploadingCount(0);
            }}
          />
          {uploadingCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading {uploadingCount} photo{uploadingCount === 1 ? "" : "s"}…
            </div>
          )}
          {photoUrls.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {photoUrls.map((u) => (
                <div key={u} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="h-16 w-16 rounded-md border-2 border-ink-900 object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrls((p) => p.filter((url) => url !== u))
                    }
                    aria-label="Remove photo"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-ink-900 text-[10px] font-bold text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || uploadingCount > 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-[2.5px] border-ink-900 px-6 py-4 text-lg font-bold text-white shadow-[0_4px_0_0_#0F172A] transition-transform active:translate-y-1 active:shadow-[0_0_0_0_#0F172A] disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : uploadingCount > 0 ? (
            <>Wait for photos to finish…</>
          ) : (
            <><Send className="h-5 w-5" /> Send request</>
          )}
        </button>
      </form>
    </Section>
  );
}

function PoweredByFooter() {
  return (
    <footer className="mt-12 px-5 pb-2">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl border-2 border-ink-900 bg-ink-900 px-5 py-4 text-white shadow-hard-brand transition active:translate-y-1 active:shadow-press"
      >
        {/* hazard hatch corner — tiny version of the upgrade banner sticker */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rotate-[10deg] bg-hatch opacity-25"
        />
        <div className="relative flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
              Built with
            </div>
            <Wordmark className="mt-0.5 block text-lg leading-tight" />
            <div className="mt-0.5 text-[11px] text-white/65">
              One link for your business. Five minutes to set up. Free forever.
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md border-2 border-brand bg-brand px-3 py-1.5 text-xs font-bold text-ink-900 transition group-hover:translate-x-1">
            Get yours
            <span aria-hidden>→</span>
          </div>
        </div>
      </a>
    </footer>
  );
}
