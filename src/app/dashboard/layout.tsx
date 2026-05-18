import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireOnboardedUser } from "@/lib/auth";
import { Inbox, LayoutGrid, CreditCard, Hammer, Sparkles, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-brand transition group-hover:rotate-[-6deg]">
                <Hammer className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base tracking-tight text-ink-900">
                TRADELINK
              </span>
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
                className="hidden items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-ink-800 md:inline-flex"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand" />
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

function NavLink({
  href,
  children,
  icon,
  mobile,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        href={href}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold text-ink-700"
      >
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold text-ink-700 transition hover:bg-ink-900 hover:text-white"
    >
      {icon}
      {children}
    </Link>
  );
}
