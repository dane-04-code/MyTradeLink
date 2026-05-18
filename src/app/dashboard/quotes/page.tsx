import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { QuotesList } from "./quotes-list";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const user = await requireOnboardedUser();
  const rows = await db.query.quoteRequests.findMany({
    where: eq(quoteRequests.userId, user.id),
    orderBy: [desc(quoteRequests.createdAt)],
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:py-10">
      <h1 className="mb-1 text-2xl font-bold">Quote requests</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Customers who reached out from your page.
      </p>
      <QuotesList quotes={rows} />
    </div>
  );
}
