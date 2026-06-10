"use client";

import { useEffect, useRef } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracker";
import { StickyContactBar } from "@/components/sticky-contact-bar";
import { Wordmark } from "@/components/wordmark";
import { isSectionEnabled, type FullProfile } from "@/lib/queries";

/**
 * Public CV layout for "looking for work" accounts. Built from the exact
 * same building blocks as the business public profile (public-profile.tsx)
 * so it reads as the same product, just arranged as a hire-me CV:
 *   header → about/video → qualifications → training → skills → photos → contact.
 * Sections are gated by isSectionEnabled. No new colours or visual language.
 */
export function PublicCvProfile({
  profile,
  preview = false,
}: {
  profile: FullProfile;
  preview?: boolean;
}) {
  const { user } = profile;
  const accent = user.accentColor || "#F97316";

  useEffect(() => {
    if (preview) return;
    trackEvent(user.slug, "view");
  }, [preview, user.slug]);

  const bannerEnabled =
    isSectionEnabled(profile, "banner_image") && !!user.bannerImageUrl;

  return (
    <div
      className="mx-auto min-h-screen w-full max-w-md bg-white pb-24 font-sans"
      style={{ ["--accent" as never]: accent }}
    >
      {bannerEnabled && <BannerImage profile={profile} />}

      {isSectionEnabled(profile, "profile_photo") && (
        <ProfileHeader profile={profile} />
      )}
      {isSectionEnabled(profile, "availability_status") && (
        <AvailabilityBadge profile={profile} />
      )}

      {isSectionEnabled(profile, "about_me") && <AboutMe profile={profile} />}
      {isSectionEnabled(profile, "intro_video") && (
        <IntroVideo profile={profile} />
      )}

      {isSectionEnabled(profile, "certifications") && (
        <Certifications profile={profile} />
      )}
      {isSectionEnabled(profile, "education") && (
        <Education profile={profile} />
      )}
      {isSectionEnabled(profile, "skills") && <Skills profile={profile} />}
      {isSectionEnabled(profile, "photo_gallery") && (
        <Gallery profile={profile} />
      )}

      <Contact profile={profile} />

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
    !!user.bannerImageUrl && isSectionEnabled(profile, "banner_image");
  return (
    <header
      className={cn("relative px-5", bannerActive ? "-mt-16 pb-2" : "pt-9")}
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
  // Same visual as the business badge, but CV-appropriate label text:
  // "Available for work" / "Not currently looking" instead of the
  // business "Taking on work" / "Fully booked".
  const available = profile.user.availabilityStatus === "taking_on_work";
  return (
    <div className="mt-4 flex justify-center px-5">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-md border-2 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]",
          available
            ? "border-call text-call"
            : "border-emergency text-emergency"
        )}
      >
        <span className="relative flex h-2 w-2">
          {available && (
            <span className="absolute inset-0 animate-ping rounded-full bg-call" />
          )}
          <span
            className={cn(
              "relative h-2 w-2 rounded-full",
              available ? "bg-call" : "bg-emergency"
            )}
          />
        </span>
        {available ? "Available for work" : "Not currently looking"}
      </div>
    </div>
  );
}

function AboutMe({ profile }: { profile: FullProfile }) {
  if (!profile.user.about) return null;
  return (
    <Section title="About">
      <p className="whitespace-pre-line text-base leading-relaxed text-ink-800">
        {profile.user.about}
      </p>
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

function Certifications({ profile }: { profile: FullProfile }) {
  if (profile.certifications.length === 0) return null;
  return (
    <Section title="Qualifications">
      <div className="flex flex-wrap gap-2">
        {profile.certifications.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-md border-2 border-ink-900 bg-white px-3 py-2 text-sm font-bold text-ink-900"
          >
            {c.badgeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.badgeUrl}
                alt=""
                className="h-6 w-6 rounded object-contain"
              />
            ) : (
              <ShieldCheck
                className="h-4 w-4"
                style={{ color: "var(--accent)" }}
              />
            )}
            {c.name}
          </div>
        ))}
      </div>
    </Section>
  );
}

function formatYears(startYear: number | null, endYear: number | null) {
  if (startYear && endYear) return `${startYear}–${endYear}`;
  if (endYear) return `${endYear}`;
  if (startYear) return `${startYear}`;
  return "";
}

function Education({ profile }: { profile: FullProfile }) {
  if (profile.education.length === 0) return null;
  return (
    <Section title="Training & education">
      <ul className="space-y-2.5">
        {profile.education.map((e) => {
          const years = formatYears(e.startYear, e.endYear);
          return (
            <li
              key={e.id}
              className="flex items-start gap-3 rounded-xl border-2 border-line bg-white p-4"
            >
              <GraduationCap
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                style={{ color: "var(--accent)" }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-ink-900">{e.institution}</div>
                {e.qualification && (
                  <div className="mt-1 text-sm text-ink-700">
                    {e.qualification}
                  </div>
                )}
              </div>
              {years && (
                <div className="flex-shrink-0 text-sm font-bold tabular-nums text-ink-500">
                  {years}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function Skills({ profile }: { profile: FullProfile }) {
  if (profile.services.length === 0) return null;
  return (
    <Section title="Skills">
      <div className="flex flex-wrap gap-2">
        {profile.services.map((s) => (
          <span
            key={s.id}
            className="rounded-md border-2 border-line bg-muted px-3 py-1.5 text-sm font-bold text-ink-800"
          >
            {s.serviceName}
          </span>
        ))}
      </div>
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
    <Section title="Training photos">
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

function Contact({ profile }: { profile: FullProfile }) {
  const { user } = profile;
  const showCall = isSectionEnabled(profile, "call_button") && !!user.phone;
  const whatsappNumber = user.whatsappNumber || user.phone;
  const showWhatsapp =
    isSectionEnabled(profile, "whatsapp_button") && !!whatsappNumber;
  const showEmail =
    isSectionEnabled(profile, "email_button") && !!user.publicEmail;

  if (!showCall && !showWhatsapp && !showEmail) return null;

  const cleaned = whatsappNumber
    ? whatsappNumber.replace(/[^0-9+]/g, "").replace(/^\+/, "")
    : "";

  return (
    <Section title="Get in touch" className="space-y-3">
      {showCall && (
        <ActionButton
          href={`tel:${user.phone}`}
          onClickTrack={() => trackEvent(user.slug, "call_click")}
          bandClassName="bg-green-600"
          bandStyle={null}
          labelClassName="text-green-700"
          label="Call now"
          icon={<Phone className="h-6 w-6" strokeWidth={2.5} />}
          body={user.phone}
          tabularBody
        />
      )}
      {showWhatsapp && (
        <ActionButton
          href={`https://wa.me/${cleaned}`}
          target="_blank"
          onClickTrack={() => trackEvent(user.slug, "whatsapp_click")}
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
      )}
      {showEmail && (
        <ActionButton
          href={`mailto:${user.publicEmail}`}
          // No dedicated email event type in the DB enum yet — reuse the
          // generic social_click so the email button still registers as
          // an outbound contact click without a schema migration.
          onClickTrack={() => trackEvent(user.slug, "social_click")}
          bandClassName="text-white"
          bandStyle={{ background: "var(--accent)" }}
          labelClassName="text-ink-700"
          label="Email"
          icon={<Mail className="h-6 w-6" strokeWidth={2.5} />}
          body={
            <span className="inline-flex items-baseline gap-1.5">
              Send an email
              <span className="text-base">→</span>
            </span>
          }
        />
      )}
    </Section>
  );
}

/**
 * Hard-edged action button — copied verbatim from public-profile.tsx so the
 * call / WhatsApp / email buttons are visually identical to the business page.
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

function PoweredByFooter() {
  return (
    <footer className="mt-12 px-5 pb-2">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl border-2 border-ink-900 bg-ink-900 px-5 py-4 text-white shadow-hard-brand transition active:translate-y-1 active:shadow-press"
      >
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
