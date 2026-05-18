"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracker";
import type { FullProfile } from "@/lib/queries";

/**
 * Mobile-only sticky bottom action bar. Slides into view after the
 * customer has scrolled past the main Call / WhatsApp buttons so we
 * don't double up with them when they're already visible.
 *
 * Hidden on desktop (lg:hidden) — the main buttons are visible there
 * without scrolling. Hidden in dashboard preview because it would float
 * at the bottom of the editor viewport, not the phone frame.
 */
export function StickyContactBar({
  profile,
  preview = false,
}: {
  profile: FullProfile;
  preview?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const accent = profile.user.accentColor || "#F97316";

  useEffect(() => {
    if (preview) return;
    function onScroll() {
      // Show after the user has scrolled past roughly the hero — a rough
      // single threshold works fine in practice and avoids the cost of
      // attaching an IntersectionObserver to specific DOM nodes.
      setVisible(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [preview]);

  if (preview) return null;

  const { name, trade, location, profilePhotoUrl, phone, whatsappNumber, slug } =
    profile.user;
  const whatsapp = whatsappNumber || phone;
  if (!phone && !whatsapp) return null;

  const initial = (name?.[0] ?? "T").toUpperCase();
  const cleanedWhatsapp = whatsapp?.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 lg:hidden",
        "transform transition-transform duration-200 ease-out",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Hard accent rule at the top — the "painted edge" of the van panel */}
      <div className="h-[3px] w-full" style={{ background: accent }} />

      <div className="bg-ink-900 px-3 py-2.5 shadow-[0_-12px_24px_rgba(15,23,42,0.25)]">
        <div className="mx-auto flex max-w-md items-center gap-3">
          {/* Identity */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePhotoUrl}
                alt=""
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2"
                style={{ ["--tw-ring-color" as never]: accent }}
              />
            ) : (
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-display text-white ring-2"
                style={{
                  background: accent,
                  ["--tw-ring-color" as never]: accent,
                }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-display text-[15px] leading-tight tracking-tight text-white">
                {name || "Trader"}
              </div>
              {(trade || location) && (
                <div
                  className="truncate text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: accent }}
                >
                  {trade}
                  {trade && location ? " · " : ""}
                  {location}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={() => trackEvent(slug, "call_click")}
                aria-label="Call"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white shadow-[0_3px_0_0_rgba(0,0,0,0.35)] transition-transform active:translate-y-0.5 active:shadow-[0_0_0_0_rgba(0,0,0,0)]"
              >
                <Phone className="h-5 w-5" strokeWidth={2.5} />
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${cleanedWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(slug, "whatsapp_click")}
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_3px_0_0_rgba(0,0,0,0.35)] transition-transform active:translate-y-0.5 active:shadow-[0_0_0_0_rgba(0,0,0,0)]"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
