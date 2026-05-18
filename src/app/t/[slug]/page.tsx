import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileBySlug } from "@/lib/queries";
import { PublicProfile } from "@/components/public-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) return { title: "TradeLink" };
  const u = profile.user;
  const title = `${u.name ?? "TradeLink"}${u.trade ? ` · ${u.trade}` : ""}${u.location ? ` · ${u.location}` : ""}`;
  return {
    title,
    description: u.about ?? `Contact ${u.name ?? "this tradesman"} for a quote.`,
    openGraph: {
      title,
      description: u.about ?? undefined,
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

  return (
    <main className="min-h-screen bg-neutral-100 py-0">
      <PublicProfile profile={profile} />
    </main>
  );
}
