// Meta (Facebook) Pixel helpers.
// The pixel only loads when NEXT_PUBLIC_FACEBOOK_PIXEL_ID is set, so the app
// runs fine locally and in preview without it.

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Track a standard or custom event. No-ops if the pixel isn't loaded. */
export function track(name: string, options: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", name, options);
}
