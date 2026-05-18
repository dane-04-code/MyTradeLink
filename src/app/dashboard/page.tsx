import { requireOnboardedUser } from "@/lib/auth";
import { getFullProfile } from "@/lib/queries";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const profile = await getFullProfile(user.id);
  if (!profile) return null;

  return <DashboardClient initialProfile={profile} />;
}
