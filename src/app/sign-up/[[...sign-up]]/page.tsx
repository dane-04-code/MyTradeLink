import { SignUp } from "@clerk/nextjs";
import { AuthShell, authAppearance } from "@/components/auth/auth-shell";

export default function Page() {
  return (
    <AuthShell
      panelEyebrow="Your business, one link"
      panelTitle="Win more work from"
      panelHighlight="one link."
      bullets={[
        "Live in five minutes, no designer or domain",
        "Call, WhatsApp, photos, reviews and quotes",
        "Free forever, no card needed",
      ]}
    >
      <SignUp appearance={authAppearance} />
    </AuthShell>
  );
}
