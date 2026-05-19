import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "Mytradelink <onboarding@resend.dev>";

const INK = "#0F172A";
const BRAND = "#F97316";
const MUTED = "#F8FAFC";
const LINE = "#E2E8F0";
const TEXT_SECONDARY = "#64748B";

/**
 * Renders the common email shell used by both transactional emails.
 * Email clients ignore <link> tags and most external CSS, so everything
 * inlines. We avoid web-fonts (Gmail strips them) and use a strong
 * system stack — display-y for headings, neutral sans for body.
 */
function shell(opts: { previewText: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Mytradelink</title>
</head>
<body style="margin:0;padding:0;background:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK}">
  <!-- preview text (hidden in body, shown in inbox previews) -->
  <div style="display:none;font-size:1px;color:${MUTED};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${opts.previewText}</div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${MUTED}">
    <tr>
      <td align="center" style="padding:24px 12px">
        <table role="presentation" width="560" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#FFFFFF;border:2px solid ${INK};border-radius:18px;overflow:hidden;box-shadow:0 4px 0 0 ${INK}">

          <!-- Header: ink-900 bar with the wordmark -->
          <tr>
            <td style="background:${INK};padding:18px 24px;color:#FFFFFF">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle">
                    <span style="display:inline-block;color:#FFFFFF;font-weight:900;font-size:20px;letter-spacing:-0.02em">MY<span style="color:${BRAND}">.</span>TRADE<span style="color:${BRAND}">.</span>LINK</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3px brand accent rule -->
          <tr><td style="line-height:3px;height:3px;background:${BRAND};font-size:0">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px 28px">
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid ${LINE};padding:18px 28px;color:${TEXT_SECONDARY};font-size:12px;line-height:1.5">
              Mytradelink · A digital profile page builder for UK tradesmen.<br>
              You're getting this because you signed up. Reply to this email if anything looks off.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function eyebrow(text: string) {
  return `<div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND};margin-bottom:8px">${escape(text)}</div>`;
}

function heading(text: string) {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:900;font-size:36px;line-height:1.05;letter-spacing:-0.02em;color:${INK};margin:0">${escape(text)}</h1>`;
}

function paragraph(text: string) {
  return `<p style="font-size:16px;line-height:1.55;color:${INK};margin:16px 0 0">${escape(text)}</p>`;
}

function primaryButton(label: string, href: string) {
  return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:24px">
    <tr><td>
      <a href="${href}" style="display:inline-block;background:${BRAND};color:${INK};font-weight:800;text-decoration:none;padding:14px 22px;border:2px solid ${INK};border-radius:14px;box-shadow:0 4px 0 0 ${INK};font-size:14px;letter-spacing:0.01em">${escape(label)}</a>
    </td></tr>
  </table>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 14px;border-bottom:1px solid ${LINE};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${TEXT_SECONDARY};width:96px;vertical-align:top">${escape(label)}</td>
    <td style="padding:8px 14px;border-bottom:1px solid ${LINE};font-size:15px;color:${INK};line-height:1.5">${value}</td>
  </tr>`;
}

/* ------------------------------------------------------------------ */
/* Welcome email                                                      */
/* ------------------------------------------------------------------ */
export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const firstName = name?.split(" ")[0] || "there";

  const body = `
    ${eyebrow("Welcome aboard")}
    ${heading(`You're in, ${firstName}.`)}
    ${paragraph("Your Mytradelink page is ready. Spend five minutes filling in your details and you'll have a professional shareable link by lunch.")}
    ${primaryButton("Finish my page", `${appUrl}/onboarding`)}
    <div style="margin-top:32px;padding:18px;background:${MUTED};border-radius:12px;font-size:14px;line-height:1.55;color:${INK}">
      <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_SECONDARY};margin-bottom:6px">Quick wins</strong>
      1. Add a profile photo — pages with one get 3× more enquiries<br>
      2. Add 3-4 of your best services so customers see what you do<br>
      3. Share your link on WhatsApp + your van — that's where the leads come from
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your Mytradelink page is live 🎉",
    html: shell({
      previewText: "Your Mytradelink page is ready. Finish setup in five minutes.",
      bodyHtml: body,
    }),
  });
}

/* ------------------------------------------------------------------ */
/* New quote request email                                            */
/* ------------------------------------------------------------------ */
export async function sendNewQuoteEmail(opts: {
  to: string;
  tradesmanName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  jobDescription: string;
  postcode?: string | null;
}) {
  if (!resend) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cleanedPhone = opts.customerPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  const jobHtml = escape(opts.jobDescription).replace(/\n/g, "<br>");

  const body = `
    ${eyebrow("New lead")}
    ${heading(`Quote from ${opts.customerName}.`)}
    ${paragraph(`Hi ${opts.tradesmanName.split(" ")[0]}, a customer just sent a request through your Mytradelink page. Call them back quickly — speed matters.`)}

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:24px;border:1px solid ${LINE};border-radius:12px;overflow:hidden">
      ${detailRow("Name", escape(opts.customerName))}
      ${detailRow(
        "Phone",
        `<a href="tel:${escape(opts.customerPhone)}" style="color:${INK};font-weight:700;text-decoration:none">${escape(opts.customerPhone)}</a>`
      )}
      ${opts.customerEmail ? detailRow(
        "Email",
        `<a href="mailto:${escape(opts.customerEmail)}" style="color:${INK};font-weight:700;text-decoration:none">${escape(opts.customerEmail)}</a>`
      ) : ""}
      ${opts.postcode ? detailRow("Postcode", escape(opts.postcode)) : ""}
      ${detailRow("Job", jobHtml)}
    </table>

    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:24px">
      <tr>
        <td style="padding-right:8px;padding-bottom:8px">
          <a href="tel:${escape(opts.customerPhone)}" style="display:inline-block;background:${BRAND};color:${INK};font-weight:800;text-decoration:none;padding:12px 18px;border:2px solid ${INK};border-radius:12px;box-shadow:0 4px 0 0 ${INK};font-size:14px">Call ${escape(opts.customerName.split(" ")[0])}</a>
        </td>
        <td style="padding-right:8px;padding-bottom:8px">
          <a href="https://wa.me/${cleanedPhone}" style="display:inline-block;background:#25D366;color:#FFFFFF;font-weight:800;text-decoration:none;padding:12px 18px;border:2px solid ${INK};border-radius:12px;box-shadow:0 4px 0 0 ${INK};font-size:14px">WhatsApp</a>
        </td>
        ${opts.customerEmail ? `
        <td style="padding-right:8px;padding-bottom:8px">
          <a href="mailto:${escape(opts.customerEmail)}" style="display:inline-block;background:#FFFFFF;color:${INK};font-weight:800;text-decoration:none;padding:12px 18px;border:2px solid ${INK};border-radius:12px;font-size:14px">Reply by email</a>
        </td>` : ""}
        <td style="padding-bottom:8px">
          <a href="${appUrl}/dashboard/quotes" style="display:inline-block;background:#FFFFFF;color:${INK};font-weight:800;text-decoration:none;padding:12px 18px;border:2px solid ${INK};border-radius:12px;font-size:14px">View in dashboard</a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `New quote request from ${opts.customerName}`,
    html: shell({
      previewText: `${opts.customerName}${opts.postcode ? ` in ${opts.postcode}` : ""} — ${opts.jobDescription.slice(0, 80)}`,
      bodyHtml: body,
    }),
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
