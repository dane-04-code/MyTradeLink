import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowLeft, Check, Phone } from "lucide-react";
import type { Appearance } from "@clerk/types";
import { Wordmark } from "@/components/wordmark";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-landing",
  display: "swap",
});

/**
 * Light Clerk theme that matches the redesigned landing page: white card,
 * soft shadow, orange primary button, ink text on light inputs. Shared by
 * the sign-in and sign-up pages so they stay in lockstep.
 */
export const authAppearance: Appearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "rounded-3xl border border-line bg-white px-7 py-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-20px_rgba(15,23,42,0.18)]",
    headerTitle:
      "font-display-2 text-2xl font-extrabold tracking-tight text-ink-900",
    headerSubtitle: "text-ink-500",
    socialButtonsBlockButton:
      "rounded-xl border border-line bg-white text-ink-900 transition hover:bg-muted",
    socialButtonsBlockButtonText: "font-semibold text-ink-900",
    dividerLine: "bg-line",
    dividerText: "text-ink-400",
    formFieldLabel: "text-sm font-semibold text-ink-700",
    formFieldInput:
      "rounded-xl border border-line bg-white text-ink-900 placeholder:text-ink-400 focus:border-brand focus:ring-2 focus:ring-brand/20",
    formButtonPrimary:
      "rounded-xl bg-brand text-base font-bold normal-case text-ink-900 shadow-[0_10px_24px_-10px_rgba(249,115,22,0.6)] transition hover:bg-brand-400 active:scale-[0.99]",
    footerActionText: "text-ink-500",
    footerActionLink: "font-bold text-brand-700 hover:text-brand-600",
    identityPreviewText: "text-ink-900",
    identityPreviewEditButton: "text-brand-700",
    formFieldInputShowPasswordButton: "text-ink-500 hover:text-ink-900",
    formResendCodeLink: "font-semibold text-brand-700 hover:text-brand-600",
    otpCodeFieldInput: "border border-line text-ink-900",
  },
  variables: {
    colorPrimary: "#F97316",
    colorText: "#0F172A",
    colorTextSecondary: "#64748B",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F172A",
    colorDanger: "#DC2626",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-body)",
  },
};

/**
 * Two-column auth layout. Left is a dark brand panel (orange glow + dot grid)
 * that echoes the landing page's closing CTA; right is the Clerk form on a
 * clean white surface. On mobile the brand panel drops and the form column
 * carries its own wordmark.
 */
export function AuthShell({
  panelEyebrow,
  panelTitle,
  panelHighlight,
  bullets,
  children,
}: {
  panelEyebrow: string;
  panelTitle: string;
  panelHighlight: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <main
      className={`${displayFont.variable} grid min-h-dvh grid-cols-1 bg-white lg:grid-cols-2`}
    >
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-[460px] w-[680px] rounded-full bg-brand/20 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <Link href="/" className="group relative inline-flex w-fit items-center">
          <Wordmark className="text-lg text-white transition group-hover:opacity-80" />
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {panelEyebrow}
          </span>
          <h2 className="mt-6 max-w-md font-display-2 text-5xl font-extrabold leading-[1.05] tracking-[-0.03em]">
            {panelTitle}{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
              {panelHighlight}
            </span>
          </h2>
          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15">
                  <Check className="h-3.5 w-3.5 text-brand" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* floating lead card — echoes the landing showcase */}
        <div className="animate-float-soft relative w-64 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
              New quote request
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-call">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-call" />
              now
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-white">
            Bathroom refit, 2 weeks
          </div>
          <div className="mt-0.5 text-xs text-white/60">
            Sarah D. · 3 photos attached
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-call/15 px-3 py-2 text-xs font-bold text-call">
            <Phone className="h-3.5 w-3.5" />
            They found you on your page
          </div>
        </div>
      </aside>

      {/* Form column */}
      <section className="relative flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-64 opacity-50 [mask-image:linear-gradient(to_bottom,#000,transparent)] lg:hidden"
        />
        <div className="relative w-full max-w-md">
          <Link
            href="/"
            className="group mb-8 flex items-center justify-center lg:hidden"
          >
            <Wordmark className="text-xl transition group-hover:opacity-80" />
          </Link>

          {children}

          <Link
            href="/"
            className="group mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
