"use client";

import { useState, useRef } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Facebook,
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
  const accent = user.accentColor || "#FF6B00";
  const orderedSections = profile.sections.filter((s) => s.isEnabled);

  return (
    <div
      className="mx-auto min-h-screen w-full max-w-md bg-white pb-24 font-sans"
      style={{ ["--accent" as never]: accent }}
    >
      {orderedSections.map((s) => {
        const key = s.sectionKey as SectionKey;
        switch (key) {
          case "profile_photo":
            return <ProfileHeader key={key} profile={profile} />;
          case "availability_status":
            return <AvailabilityBadge key={key} profile={profile} />;
          case "call_button":
            return <CallButton key={key} profile={profile} />;
          case "whatsapp_button":
            return <WhatsappButton key={key} profile={profile} />;
          case "emergency_button":
            return user.plan === "paid" ? <EmergencyButton key={key} profile={profile} /> : null;
          case "about_me":
            return <AboutMe key={key} profile={profile} />;
          case "services":
            return <ServicesList key={key} profile={profile} />;
          case "gallery":
            return <Gallery key={key} profile={profile} />;
          case "before_after":
            return <BeforeAfter key={key} profile={profile} />;
          case "certifications":
            return <Certifications key={key} profile={profile} />;
          case "google_reviews":
            return <GoogleReviews key={key} profile={profile} />;
          case "quote_form":
            return <QuoteForm key={key} profile={profile} preview={preview} />;
          case "areas_covered":
            return <AreasCovered key={key} profile={profile} />;
          case "payment_methods":
            return <PaymentMethods key={key} profile={profile} />;
          case "facebook":
            return <FacebookLink key={key} profile={profile} />;
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
    <section className={cn("px-5 pt-6", className)}>
      {title && <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">{title}</h2>}
      {children}
    </section>
  );
}

function ProfileHeader({ profile }: { profile: FullProfile }) {
  const { user } = profile;
  return (
    <header className="px-5 pt-8">
      <div className="flex flex-col items-center text-center">
        {user.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePhotoUrl}
            alt={user.name ?? "Profile"}
            className="h-28 w-28 rounded-full object-cover"
            style={{ boxShadow: "0 0 0 4px var(--accent)" }}
          />
        ) : (
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {(user.name ?? "T")[0].toUpperCase()}
          </div>
        )}
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">
          {user.name || "Your name"}
        </h1>
        {user.trade && (
          <p className="text-base font-semibold" style={{ color: "var(--accent)" }}>
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
    <div className="mt-5 flex justify-center px-5">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
          taking ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}
      >
        <span className={cn("h-2 w-2 rounded-full", taking ? "bg-green-500 animate-pulse" : "bg-red-500")} />
        {taking ? "Taking on work" : "Fully booked"}
      </div>
    </div>
  );
}

function CallButton({ profile }: { profile: FullProfile }) {
  if (!profile.user.phone) return null;
  return (
    <Section>
      <a
        href={`tel:${profile.user.phone}`}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-5 text-xl font-bold text-white shadow-lg active:scale-[0.98]"
      >
        <Phone className="h-6 w-6" /> Call {profile.user.name?.split(" ")[0] || "now"}
      </a>
    </Section>
  );
}

function WhatsappButton({ profile }: { profile: FullProfile }) {
  const number = profile.user.whatsappNumber || profile.user.phone;
  if (!number) return null;
  const cleaned = number.replace(/[^0-9+]/g, "");
  return (
    <Section>
      <a
        href={`https://wa.me/${cleaned.replace(/^\+/, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-5 text-xl font-bold text-white shadow-lg active:scale-[0.98]"
      >
        <MessageCircle className="h-6 w-6" /> WhatsApp
      </a>
    </Section>
  );
}

function EmergencyButton({ profile }: { profile: FullProfile }) {
  const number = profile.user.emergencyNumber || profile.user.phone;
  if (!number) return null;
  return (
    <Section>
      <a
        href={`tel:${number}`}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-5 text-xl font-bold text-white shadow-lg active:scale-[0.98]"
      >
        <Phone className="h-6 w-6" /> Emergency callout 24/7
      </a>
    </Section>
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
    <Section>
      <a
        href={profile.user.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-neutral-200 bg-white px-5 py-4 text-base font-semibold text-ink-900 active:scale-[0.98]"
      >
        <Facebook className="h-5 w-5 text-[#1877F2]" />
        Follow on Facebook
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
  const paid = profile.user.plan === "paid";
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
      slug: profile.user.slug,
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
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent(true);
      form.reset();
      setPhotoUrls([]);
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
        {paid ? (
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
        ) : null}
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
    <footer className="mt-10 px-5 text-center">
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-neutral-200"
      >
        Powered by <span className="font-bold text-brand">TradeLink</span> · Get your free page
      </a>
    </footer>
  );
}
