import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingComplete) redirect("/dashboard");

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
        }}
      />
    </main>
  );
}
