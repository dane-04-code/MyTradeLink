import { SignIn } from "@clerk/nextjs";
import { AuthShell, authAppearance } from "@/components/auth/auth-shell";

export default function Page() {
  return (
    <AuthShell
      panelEyebrow="Welcome back"
      panelTitle="Back to winning"
      panelHighlight="more work."
      bullets={[
        "Your page and quote inbox, right where you left them",
        "Edit and it's live instantly, no save button",
        "Free forever, no card needed",
      ]}
    >
      <SignIn appearance={authAppearance} />
    </AuthShell>
  );
}
