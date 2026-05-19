"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Client-side nav link that knows whether it's the current route and styles
 * itself accordingly. Used in the dashboard's desktop top nav and the
 * mobile bottom-style tab bar.
 */
export function NavLink({
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
  const pathname = usePathname();
  // /dashboard is the index — only matches exactly. Sub-routes match prefix.
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  if (mobile) {
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold transition",
          active
            ? "text-ink-900"
            : "text-ink-500 hover:text-ink-700"
        )}
      >
        <span
          className={cn(
            "flex items-center gap-1.5",
            active && "text-ink-900"
          )}
        >
          {icon}
          {children}
        </span>
        <span
          className={cn(
            "block h-0.5 w-6 rounded-full transition",
            active ? "bg-brand" : "bg-transparent"
          )}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold transition",
        active
          ? "bg-ink-900 text-white"
          : "text-ink-700 hover:bg-muted hover:text-ink-900"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
