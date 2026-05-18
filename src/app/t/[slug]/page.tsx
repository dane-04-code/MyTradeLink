import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileBySlug } from "@/lib/queries";
import { PublicProfile } from "@/components/public-profile";
import { localBusinessJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tradelink.app";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) return { title: "TradeLink" };
  const u = profile.user;
  const title = `${u.name ?? "TradeLink"}${u.trade ? ` · ${u.trade}` : ""}${u.location ? ` · ${u.location}` : ""}`;
  const description =
    u.about?.slice(0, 200) ??
    `Contact ${u.name ?? "this tradesman"}${u.trade ? `, a ${u.trade}` : ""}${u.location ? ` in ${u.location}` : ""}, for a quote.`;
  const canonical = `${APP_URL}/t/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      images: u.profilePhotoUrl ? [u.profilePhotoUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: u.profilePhotoUrl ? [u.profilePhotoUrl] : undefined,
    },
  };
}

export default async function PublicTradePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) notFound();

  const jsonLd = localBusinessJsonLd(profile, `${APP_URL}/t/${slug}`);

  return (
    <main className="min-h-screen bg-neutral-100 py-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicProfile profile={profile} />
    </main>
  );
}
