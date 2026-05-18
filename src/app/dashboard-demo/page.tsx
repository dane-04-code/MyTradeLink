import Link from "next/link";
import {
  Hammer,
  Inbox,
  LayoutGrid,
  CreditCard,
  Sparkles,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { DashboardClient } from "@/app/dashboard/dashboard-client";
import { DEMO_PROFILE } from "@/lib/demo-profile";

export const dynamic = "force-dynamic";

/**
 * /dashboard-demo — clone of /dashboard but mounted with hardcoded
 * DEMO_PROFILE and no auth. Server actions are short-circuited inside
 * DashboardClient when window.location starts with /dashboard-demo, so
 * toggling sections, dragging, picking themes etc. all update local
 * state but never round-trip to the server. Refresh discards the play.
 */
export default function DashboardDemoPage() {
  // Free plan in the demo so locked Pro sections are visible, not invisible.
  const profile = { ...DEMO_PROFILE, user: { ...DEMO_PROFILE.user, plan: "free" as const } };

  return (
    <div className="min-h-screen bg-muted">
      {/* Demo banner — sits above the dashboard header */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs lg:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-900">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-900" />
              Demo mode
            </span>
            <span className="text-white/70">
              Play with the page builder. Changes don&apos;t save, photo uploads
              won&apos;t work.
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-bold text-white hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>

      {/* Dashboard header (mirrors dashboard/layout.tsx but no auth/UserButton) */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard-demo" className="group flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-brand transition group-hover:rotate-[-6deg]">
                <Hammer className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base tracking-tight text-ink-900">
                TRADELINK
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/dashboard-demo" icon={<LayoutGrid className="h-4 w-4" />}>
                My page
              </NavLink>
              <NavLink href="/dashboard-demo" icon={<Inbox className="h-4 w-4" />} disabled>
                Quotes
              </NavLink>
              <NavLink href="/dashboard-demo" icon={<BarChart3 className="h-4 w-4" />} disabled>
                Analytics
              </NavLink>
              <NavLink href="/dashboard-demo" icon={<CreditCard className="h-4 w-4" />} disabled>
                Billing
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-ink-800 md:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Upgrade
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile tab bar (mirrors dashboard/layout.tsx) */}
      <nav className="sticky top-[57px] z-20 border-b border-line bg-white md:hidden">
        <div className="grid grid-cols-4">
          <NavLink href="/dashboard-demo" mobile icon={<LayoutGrid className="h-4 w-4" />}>
            Page
          </NavLink>
          <NavLink href="/dashboard-demo" mobile icon={<Inbox className="h-4 w-4" />} disabled>
            Quotes
          </NavLink>
          <NavLink href="/dashboard-demo" mobile icon={<BarChart3 className="h-4 w-4" />} disabled>
            Stats
          </NavLink>
          <NavLink href="/dashboard-demo" mobile icon={<CreditCard className="h-4 w-4" />} disabled>
            Billing
          </NavLink>
        </div>
      </nav>

      <DashboardClient initialProfile={profile} />
    </div>
  );
}

function NavLink({
  href,
  children,
  icon,
  mobile,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  mobile?: boolean;
  disabled?: boolean;
}) {
  const baseMobile =
    "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold";
  const baseDesktop =
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition";
  const className = mobile
    ? `${baseMobile} ${disabled ? "text-ink-500/40" : "text-ink-700"}`
    : `${baseDesktop} ${
        disabled
          ? "cursor-not-allowed text-ink-500/40"
          : "text-ink-700 hover:bg-ink-900 hover:text-white"
      }`;
  if (disabled) {
    return (
      <span className={className} title="Disabled in demo">
        {icon}
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {icon}
      {children}
    </Link>
  );
}
