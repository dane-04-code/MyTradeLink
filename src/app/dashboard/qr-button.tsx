"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, X, Download } from "lucide-react";
import { toast } from "sonner";

/**
 * QR-code button for the dashboard link bar. Generates a PNG locally
 * (no API), renders it in a centred dialog, lets the user download a
 * high-res 1024px PNG suitable for printing on a van sticker / business
 * card.
 */
export function QrButton({
  url,
  slug,
}: {
  url: string;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const [thumb, setThumb] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Pre-generate the on-screen thumbnail when the dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 512,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then((data) => {
        if (!cancelled) setThumb(data);
      })
      .catch(() => toast.error("Couldn't generate QR"));
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function download() {
    try {
      const hiRes = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "H",
        margin: 3,
        width: 1024,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });
      const a = document.createElement("a");
      a.href = hiRes;
      a.download = `tradelink-${slug}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR downloaded");
    } catch {
      toast.error("Couldn't download");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 border-l border-line bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-muted"
        title="Show QR code"
      >
        <QrCode className="h-4 w-4" />
        <span className="hidden sm:inline">QR</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-ink-900 bg-white shadow-[0_8px_0_0_#0F172A]"
          >
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
                  Your QR code
                </div>
                <div className="mt-1 font-display text-2xl leading-tight tracking-tight text-ink-900">
                  Scan or print.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-5">
              <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-white">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="QR code" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-500">
                    Rendering…
                  </div>
                )}
              </div>

              <div className="mt-3 truncate rounded-xl bg-muted px-3 py-2 text-center font-mono text-xs text-ink-700">
                {url}
              </div>

              <button
                type="button"
                onClick={download}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink-900 bg-brand px-4 py-3 text-sm font-bold text-ink-900 shadow-[0_4px_0_0_#0F172A] transition active:translate-y-1 active:shadow-[0_0_0_0_#0F172A]"
              >
                <Download className="h-4 w-4" />
                Download high-res PNG
              </button>
              <p className="mt-2 text-center text-[11px] text-ink-500">
                Print it on your van, your business card, or stick it on the
                wall in the customer&apos;s kitchen.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
