import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireOnboardedUser } from "@/lib/auth";
import { Inbox, LayoutGrid, CreditCard, Sparkles, BarChart3 } from "lucide-react";
import { NavLink } from "./nav-link";
import { Wordmark } from "@/components/wordmark";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-30 border-b-2 border-ink-900 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="group flex items-center"
            >
              <Wordmark className="text-base text-ink-900 transition group-hover:opacity-80" />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/dashboard" icon={<LayoutGrid className="h-4 w-4" />}>
                My page
              </NavLink>
              <NavLink href="/dashboard/quotes" icon={<Inbox className="h-4 w-4" />}>
                Quotes
              </NavLink>
              <NavLink href="/dashboard/analytics" icon={<BarChart3 className="h-4 w-4" />}>
                Analytics
              </NavLink>
              <NavLink href="/dashboard/billing" icon={<CreditCard className="h-4 w-4" />}>
                Billing
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user.plan === "free" && (
              <Link
                href="/pricing"
                className="group hidden items-center gap-1.5 rounded-lg border-2 border-ink-900 bg-brand px-3.5 py-1.5 text-sm font-bold text-ink-900 shadow-hard-sm transition active:translate-y-0.5 active:shadow-press md:inline-flex"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <nav className="sticky top-[57px] z-20 border-b border-line bg-white md:hidden">
        <div className="grid grid-cols-4">
          <NavLink href="/dashboard" mobile icon={<LayoutGrid className="h-4 w-4" />}>
            Page
          </NavLink>
          <NavLink href="/dashboard/quotes" mobile icon={<Inbox className="h-4 w-4" />}>
            Quotes
          </NavLink>
          <NavLink href="/dashboard/analytics" mobile icon={<BarChart3 className="h-4 w-4" />}>
            Stats
          </NavLink>
          <NavLink href="/dashboard/billing" mobile icon={<CreditCard className="h-4 w-4" />}>
            Billing
          </NavLink>
        </div>
      </nav>

      {children}
    </div>
  );
}

