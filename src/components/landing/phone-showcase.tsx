import {
  Phone,
  MessageCircle,
  Check,
  Star,
  ShieldCheck,
  Camera,
  TrendingUp,
  Hammer,
} from "lucide-react";

/**
 * Hero visual: a clean phone running a finished Mytradelink profile, with
 * live lead notifications floating around it. Each card drifts on its own
 * rhythm so the whole thing reads as "your page, out there winning work".
 */
export function PhoneShowcase() {
  return (
    <div className="relative mx-auto w-fit">
      {/* warm glow + dot grid backdrop */}
      <div
        aria-hidden
        className="absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgba(249,115,22,0.18),transparent)]"
      />
      <div
        aria-hidden
        className="bg-dot-grid absolute -inset-10 rounded-[64px] opacity-60 [mask-image:radial-gradient(closest-side,#000,transparent)]"
      />

      {/* floating: incoming quote request */}
      <div className="animate-float-soft absolute -left-28 top-8 z-20 hidden w-56 rounded-2xl border border-line bg-white/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(15,23,42,0.25)] backdrop-blur md:block">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
            New quote request
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-call">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-call" />
            now
          </span>
        </div>
        <div className="mt-1.5 text-sm font-bold text-ink-900">
          Bathroom refit, 2 weeks
        </div>
        <div className="mt-0.5 text-xs text-ink-600">
          Sarah D. · 3 photos attached
        </div>
      </div>

      {/* floating: incoming call */}
      <div className="animate-float-soft-delayed absolute -right-24 top-48 z-20 hidden w-52 rounded-2xl border border-line bg-white/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(15,23,42,0.25)] backdrop-blur md:block">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-call/10">
            <Phone className="h-4 w-4 text-call" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-ink-900">Incoming call</div>
            <div className="truncate text-xs text-ink-600">
              Found you on your page
            </div>
          </div>
        </div>
      </div>

      {/* floating: five-star review */}
      <div className="animate-float-soft-slow absolute -left-24 bottom-36 z-20 hidden w-52 rounded-2xl border border-line bg-white/95 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(15,23,42,0.25)] backdrop-blur md:block">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-star text-star" />
          ))}
        </div>
        <div className="mt-1.5 text-xs leading-snug text-ink-700">
          &ldquo;Turned up on time, spotless job. Found him in one tap.&rdquo;
        </div>
      </div>

      {/* floating: weekly views chip */}
      <div className="animate-float-soft-delayed absolute -right-16 bottom-14 z-20 hidden items-center gap-2.5 rounded-full border border-line bg-white/95 py-2 pl-2.5 pr-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(15,23,42,0.25)] backdrop-blur md:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15">
          <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
        </span>
        <div className="text-xs">
          <span className="font-bold text-ink-900">312 views</span>{" "}
          <span className="text-ink-500">this week</span>
        </div>
      </div>

      {/* the phone */}
      <div className="relative z-10 h-[600px] w-[296px] rounded-[44px] border-[8px] border-ink-900 bg-ink-900 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)] transition-transform duration-500 ease-out hover:-translate-y-1.5 sm:h-[640px] sm:w-[312px]">
        <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-900" />
        <div className="h-full w-full overflow-hidden rounded-[36px] bg-white">
          {/* profile header */}
          <div className="flex flex-col items-center bg-gradient-to-b from-brand-50 to-white px-5 pb-4 pt-10 text-center">
            <div className="relative">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-bold text-white shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)]">
                DW
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-call">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </div>
            </div>
            <h3 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-ink-900">
              Dave Wilson Plumbing
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink-600">
              <Hammer className="h-3 w-3 text-brand-600" />
              Plumber · Sydney
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-call/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-call">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-call" />
              Taking on work
            </div>
          </div>

          {/* contact buttons */}
          <div className="space-y-2 px-4">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-call py-3 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(22,163,74,0.5)]">
              <Phone className="h-4 w-4" /> Call Dave
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp py-3 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(37,211,102,0.5)]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </div>
          </div>

          {/* gallery */}
          <div className="px-4 pt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                Recent work
              </span>
              <Camera className="h-3 w-3 text-ink-500" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-sky-200 to-sky-400" />
              <div className="aspect-square rounded-lg bg-gradient-to-br from-brand-200 to-brand-400" />
              <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-200 to-slate-400" />
            </div>
          </div>

          {/* trust rows */}
          <div className="space-y-2 px-4 pt-3.5">
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-muted px-3 py-2.5">
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-brand-600"
                strokeWidth={2.5}
              />
              <span className="text-xs font-bold text-ink-900">
                Licensed Plumber
              </span>
              <span className="ml-auto font-mono text-[10px] text-ink-500">
                NSW 12345
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-muted px-3 py-2.5 text-xs">
              <Star className="h-3.5 w-3.5 fill-star text-star" />
              <span className="font-bold text-ink-900">4.9</span>
              <span className="text-ink-500">on Google · 84 reviews</span>
            </div>
          </div>

          {/* quote form teaser */}
          <div className="px-4 pt-3.5">
            <div className="rounded-xl bg-brand-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
                Get a quote
              </div>
              <div className="mt-1.5 space-y-1.5">
                <div className="h-7 rounded-lg border border-brand-200 bg-white" />
                <div className="flex h-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-ink-900">
                  Send quote request
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile-only compact lead card (the desktop floats are hidden) */}
      <div className="animate-float-soft absolute -right-2 top-24 z-20 w-44 rounded-2xl border border-line bg-white/95 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(15,23,42,0.25)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
            New quote
          </span>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-call" />
        </div>
        <div className="mt-1 text-xs font-bold text-ink-900">
          Bathroom refit, 2 weeks
        </div>
      </div>
      <div className="animate-float-soft-slow absolute -left-3 bottom-28 z-20 flex items-center gap-2 rounded-full border border-line bg-white/95 py-1.5 pl-2 pr-3 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(15,23,42,0.25)] backdrop-blur md:hidden">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/15">
          <TrendingUp className="h-3 w-3 text-brand-600" />
        </span>
        <span className="text-[11px] font-bold text-ink-900">
          312 views <span className="font-normal text-ink-500">this week</span>
        </span>
      </div>
    </div>
  );
}
