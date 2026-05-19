import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Wordmark } from "@/components/wordmark";

export default function Page() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center bg-ink-900 px-4 py-10 text-white">
      {/* blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 90%)",
        }}
      />
      <Link
        href="/"
        className="group mb-8 flex items-center self-start sm:self-center"
      >
        <Wordmark className="text-xl transition group-hover:opacity-80" />
      </Link>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card:
              "border-2 border-white/20 bg-ink-800 shadow-none rounded-xl",
            headerTitle: "font-display text-2xl text-white",
            headerSubtitle: "text-white/70",
            socialButtonsBlockButton:
              "border-2 border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08]",
            socialButtonsBlockButtonText: "font-bold text-white",
            dividerLine: "bg-white/15",
            dividerText: "text-white/50",
            formFieldLabel: "text-white/80 font-bold text-xs uppercase tracking-[0.18em]",
            formFieldInput:
              "border-2 border-white/20 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-brand rounded-xl",
            formButtonPrimary:
              "border-2 border-ink-900 bg-brand text-ink-900 font-bold hover:bg-brand-400 active:translate-y-0.5 rounded-xl shadow-none normal-case",
            footerActionText: "text-white/60",
            footerActionLink: "text-brand font-bold hover:text-brand-400",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-brand",
          },
          variables: {
            colorPrimary: "#F97316",
            colorBackground: "#1E293B",
            colorText: "#FFFFFF",
            colorTextSecondary: "rgba(255,255,255,0.7)",
            colorInputBackground: "rgba(255,255,255,0.04)",
            colorInputText: "#FFFFFF",
            borderRadius: "0.75rem",
          },
        }}
      />
    </main>
  );
}
