import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileBySlug } from "@/lib/queries";
import { PublicProfile } from "@/components/public-profile";
import { localBusinessJsonLd } from "@/lib/structured-data";
import { DEMO_PROFILE } from "@/lib/demo-profile";
import type { FullProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

async function loadProfile(slug: string): Promise<FullProfile | null> {
  if (slug === "demo") return DEMO_PROFILE;
  return getProfileBySlug(slug);
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) return { title: "Mytradelink" };
  const u = profile.user;
  const name = u.name ?? "Mytradelink";
  const tradePart = u.trade ?? "Tradesman";
  const locationPart = u.location ? ` in ${u.location}` : "";
  const title = `${name} — ${tradePart}${locationPart} | Mytradelink`;
  const description =
    u.about?.slice(0, 200) ??
    `Contact ${u.name ?? "this tradesman"}${u.trade ? `, a ${u.trade}` : ""}${u.location ? ` in ${u.location}` : ""}, for a quote.`;
  const canonical = `${APP_URL}/t/${slug}`;
  const ogParams = new URLSearchParams({
    name: u.name ?? "",
    trade: u.trade ?? "",
    location: u.location ?? "",
    accent: u.accentColor ?? "#F97316",
    ...(u.profilePhotoUrl ? { photo: u.profilePhotoUrl } : {}),
  });
  const ogImage = `${APP_URL}/api/og/${slug}?${ogParams.toString()}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicTradePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) notFound();

  const jsonLd = localBusinessJsonLd(profile, `${APP_URL}/t/${slug}`);

  return (
    <main className="min-h-screen bg-muted py-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicProfile profile={profile} />
    </main>
  );
}
