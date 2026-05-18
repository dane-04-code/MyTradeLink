import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireOnboardedUser } from "@/lib/auth";
import { Inbox, LayoutGrid, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-extrabold">
            <span className="text-brand">▲</span> TradeLink
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/dashboard" icon={<LayoutGrid className="h-4 w-4" />}>
              Page
            </NavLink>
            <NavLink href="/dashboard/quotes" icon={<Inbox className="h-4 w-4" />}>
              Quotes
            </NavLink>
            <NavLink href="/dashboard/billing" icon={<CreditCard className="h-4 w-4" />}>
              Billing
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user.plan === "free" && (
              <Link
                href="/pricing"
                className="hidden rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white md:inline-flex"
              >
                Upgrade
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <nav className="border-b border-neutral-200 bg-white md:hidden">
        <div className="flex">
          <NavLink href="/dashboard" mobile icon={<LayoutGrid className="h-4 w-4" />}>
            Page
          </NavLink>
          <NavLink href="/dashboard/quotes" mobile icon={<Inbox className="h-4 w-4" />}>
            Quotes
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
  return (
    <Link
      href={href}
      className={
        mobile
          ? "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-ink-700"
          : "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-neutral-100"
      }
    >
      {icon}
      {children}
    </Link>
  );
}
