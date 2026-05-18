import Link from "next/link";

export default function TradeNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-16 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-3xl font-extrabold text-brand">
          ?
        </div>
        <h1 className="text-3xl font-extrabold text-ink-900">
          This Mytradelink page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-base text-ink-700">
          The link might be wrong, or the tradesman hasn&apos;t set up their page yet.
        </p>

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 text-left shadow-card">
          <div className="text-sm font-bold uppercase tracking-wider text-brand">
            Are you a tradesman?
          </div>
          <div className="mt-2 text-xl font-bold text-ink-900">
            Get your own page in 5 minutes
          </div>
          <p className="mt-2 text-sm text-ink-700">
            One link with your phone, WhatsApp, photos, reviews and a quote form.
            Free to start.
          </p>
          <Link
            href="/sign-up"
            className="btn-primary mt-5 w-full"
          >
            Create my page — free
          </Link>
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-ink-700 underline underline-offset-4 hover:text-ink-900"
        >
          Back to Mytradelink home
        </Link>
      </div>
    </main>
  );
}
