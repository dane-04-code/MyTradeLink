import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-4 py-10">
      <SignUp />
    </main>
  );
}
