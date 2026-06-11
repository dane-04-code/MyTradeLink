"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 40);
}

/**
 * The hero's interactive moment: type your name, watch your link build
 * itself, hit claim. Routes straight into sign-up.
 */
export function ClaimBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const slug = slugify(value);

  function claim(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    router.push("/sign-up");
  }

  return (
    <form onSubmit={claim} className="w-full max-w-xl">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-2xl sm:border-2 sm:border-ink-900/10 sm:bg-white sm:p-1.5 sm:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)] sm:transition sm:duration-200 sm:focus-within:border-brand sm:focus-within:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_36px_-10px_rgba(249,115,22,0.35)]">
        <div className="flex min-w-0 flex-1 items-center gap-0 rounded-2xl border-2 border-ink-900/10 bg-white px-4 py-3.5 transition duration-200 focus-within:border-brand sm:rounded-xl sm:border-0 sm:py-3 sm:focus-within:border-0">
          <span className="select-none whitespace-nowrap font-mono text-sm text-ink-500 sm:text-base">
            mytradelink.page/t/
          </span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="your-name"
            aria-label="Choose your page name"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm font-bold text-ink-900 caret-brand placeholder:font-normal placeholder:text-ink-500/50 focus:outline-none sm:text-base"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-6 py-3.5 text-base font-bold text-ink-900 shadow-[0_8px_24px_-8px_rgba(249,115,22,0.55)] transition duration-200 hover:bg-brand-400 hover:shadow-[0_10px_28px_-8px_rgba(249,115,22,0.7)] active:scale-[0.98] disabled:opacity-70 sm:rounded-xl sm:py-3"
        >
          <span aria-hidden className="cta-sheen" />
          {loading ? "One sec..." : "Claim my link"}
          {!loading && (
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </button>
      </div>
      <p
        className="mt-2.5 pl-1 text-sm text-ink-500 transition-opacity duration-300"
        aria-live="polite"
      >
        {slug ? (
          <>
            <span className="font-semibold text-call">Nice.</span>{" "}
            <span className="font-mono font-semibold text-ink-700">
              /t/{slug}
            </span>{" "}
            has your name on it.
          </>
        ) : (
          <>Free forever. No card needed. Live in 5 minutes.</>
        )}
      </p>
    </form>
  );
}
