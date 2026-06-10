import type { FullProfile } from "@/lib/queries";

export function localBusinessJsonLd(profile: FullProfile, pageUrl: string) {
  const { user } = profile;
  const name = user.name ?? "Mytradelink";
  const sameAs = [user.facebookUrl, user.googleReviewUrl].filter(
    (x): x is string => !!x
  );
  const image = [
    user.profilePhotoUrl,
    ...profile.photos.filter((p) => p.type === "gallery").map((p) => p.photoUrl),
  ].filter((x): x is string => !!x);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url: pageUrl,
    image: image.length ? image : undefined,
    description: user.about ?? undefined,
    telephone: user.phone ?? undefined,
    address: user.location
      ? {
          "@type": "PostalAddress",
          addressLocality: user.location,
          addressCountry: "GB",
        }
      : undefined,
    areaServed: user.areasCovered ?? user.location ?? undefined,
    knowsAbout: user.trade ?? undefined,
    paymentAccepted: user.paymentMethods ?? undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    makesOffer: profile.services.length
      ? profile.services.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.serviceName,
            description: s.description ?? undefined,
          },
        }))
      : undefined,
    hasCredential: profile.certifications.length
      ? profile.certifications.map((c) => ({
          "@type": "EducationalOccupationalCredential",
          name: c.name,
        }))
      : undefined,
  };

  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }
  return data;
}

/**
 * Minimal schema.org Person for "looking for work" CV pages. Kept small and
 * valid — a tradie advertising themselves to employers, not a business.
 */
export function personJsonLd(profile: FullProfile, pageUrl: string) {
  const { user } = profile;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name ?? "Mytradelink",
    jobTitle: user.trade ?? undefined,
    url: pageUrl,
    image: user.profilePhotoUrl ?? undefined,
    email: user.publicEmail ?? undefined,
    telephone: user.phone ?? undefined,
    address: user.location
      ? {
          "@type": "PostalAddress",
          addressLocality: user.location,
          addressCountry: "GB",
        }
      : undefined,
  };

  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }
  return data;
}
