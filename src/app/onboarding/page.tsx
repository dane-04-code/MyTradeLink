import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getFullProfile } from "@/lib/queries";
import { OnboardingWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingComplete) redirect("/dashboard");

  const profile = await getFullProfile(user.id);

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <OnboardingWizard
        initial={{
          name: user.name ?? "",
          trade: user.trade ?? "",
          phone: user.phone ?? "",
          whatsappNumber: user.whatsappNumber ?? "",
          location: user.location ?? "",
          profilePhotoUrl: user.profilePhotoUrl ?? "",
          about: user.about ?? "",
          slug: user.slug,
          accountGoal: user.accountGoal,
          lfw: {
            name: user.name ?? "",
            trade: user.trade ?? "",
            location: user.location ?? "",
            slug: user.slug,
            qualifications:
              profile?.certifications.map((c) => ({
                id: c.id,
                name: c.name,
                badgeUrl: c.badgeUrl,
              })) ?? [],
            education:
              profile?.education.map((e) => ({
                id: e.id,
                institution: e.institution,
                qualification: e.qualification,
                startYear: e.startYear,
                endYear: e.endYear,
              })) ?? [],
            skills:
              profile?.services.map((s) => ({
                id: s.id,
                name: s.serviceName,
              })) ?? [],
            photos:
              profile?.photos
                .filter((p) => p.type === "gallery")
                .map((p) => ({ id: p.id, photoUrl: p.photoUrl })) ?? [],
          },
        }}
      />
    </main>
  );
}
