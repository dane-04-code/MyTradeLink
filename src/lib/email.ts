import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "TradeLink <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your TradeLink page is live 🎉",
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0B0B0F">
        <h1 style="color:#F97316;margin:0 0 12px">Welcome, ${escape(name)}.</h1>
        <p style="font-size:16px;line-height:1.5">Your professional trade page is ready. Finish setting it up — it takes 5 minutes.</p>
        <p style="margin-top:24px"><a href="${appUrl}/onboarding" style="display:inline-block;background:#F97316;color:#fff;padding:14px 22px;border-radius:14px;text-decoration:none;font-weight:700">Finish your page</a></p>
        <p style="color:#555;margin-top:32px;font-size:13px">— The TradeLink crew</p>
      </div>
    `,
  });
}

export async function sendNewQuoteEmail(opts: {
  to: string;
  tradesmanName: string;
  customerName: string;
  customerPhone: string;
  jobDescription: string;
  postcode?: string | null;
}) {
  if (!resend) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `New quote request from ${opts.customerName}`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0B0B0F">
        <h1 style="color:#F97316;margin:0 0 8px">New quote request</h1>
        <p style="margin:0 0 16px">Hi ${escape(opts.tradesmanName)}, you've got a lead.</p>
        <div style="background:#f5f5f7;border-radius:14px;padding:16px;font-size:15px;line-height:1.5">
          <div><strong>Name:</strong> ${escape(opts.customerName)}</div>
          <div><strong>Phone:</strong> <a href="tel:${escape(opts.customerPhone)}">${escape(opts.customerPhone)}</a></div>
          ${opts.postcode ? `<div><strong>Postcode:</strong> ${escape(opts.postcode)}</div>` : ""}
          <div style="margin-top:8px"><strong>Job:</strong><br/>${escape(opts.jobDescription).replace(/\n/g, "<br/>")}</div>
        </div>
        <p style="margin-top:20px"><a href="${appUrl}/dashboard/quotes" style="display:inline-block;background:#F97316;color:#fff;padding:12px 18px;border-radius:14px;text-decoration:none;font-weight:700">View in dashboard</a></p>
      </div>
    `,
  });
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
