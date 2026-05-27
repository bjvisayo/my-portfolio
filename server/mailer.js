import { config } from "./config.js";

export async function sendLeadNotifications(lead) {
  if (!config.isMailConfigured) {
    return { sent: false, reason: "Mail is not configured", diagnostics: config.mailDiagnostics, results: [] };
  }

  const jobs = [];

  if (config.leadNotificationTo) {
    jobs.push(sendLeadNotificationEmail(lead));
  }

  if (config.sendLeadAutoreply) {
    jobs.push(sendLeadAutoreplyEmail(lead));
  }

  if (jobs.length === 0) {
    return { sent: false, reason: "No email jobs were created", results: [] };
  }

  const results = await Promise.allSettled(jobs);
  const summary = results.map((result) => {
    if (result.status === "rejected") {
      console.error("Lead email failed:", result.reason);
      return { status: "rejected", reason: result.reason?.message || String(result.reason) };
    }
    return { status: "fulfilled", id: result.value?.id || null };
  });

  return {
    sent: summary.some((result) => result.status === "fulfilled"),
    results: summary,
  };
}

export async function sendAdminTestEmail() {
  if (!config.isMailConfigured) {
    return { statusCode: 400, payload: { error: "Mail is not configured", diagnostics: config.mailDiagnostics } };
  }

  if (!config.leadNotificationTo) {
    return { statusCode: 400, payload: { error: "LEAD_NOTIFICATION_TO is missing", diagnostics: config.mailDiagnostics } };
  }

  try {
    const result = await sendEmail({
      to: config.leadNotificationTo,
      subject: "Xander Kreativ mail test",
      html: `
        <h2>Xander Kreativ mail test</h2>
        <p>Your Resend configuration is working.</p>
        <p>Sent at ${new Date().toISOString()}</p>
      `,
    });
    return { statusCode: 200, payload: { ok: true, result } };
  } catch (error) {
    return { statusCode: 502, payload: { error: error.message, diagnostics: config.mailDiagnostics } };
  }
}

async function sendLeadNotificationEmail(lead) {
  return sendEmail({
    to: config.leadNotificationTo,
    subject: `New website lead: ${lead.firstName} ${lead.lastName}`,
    html: `
      <h2>New Xander Kreativ lead</h2>
      <p><strong>Name:</strong> ${escapeHtml(lead.firstName)} ${escapeHtml(lead.lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(lead.phone || "Not provided")}</p>
      <p><strong>Service:</strong> ${escapeHtml(lead.service)}</p>
      <p><strong>Details:</strong></p>
      <p>${escapeHtml(lead.details).replaceAll("\n", "<br>")}</p>
    `,
  });
}

async function sendLeadAutoreplyEmail(lead) {
  return sendEmail({
    to: lead.email,
    subject: "We received your project request",
    html: `
      <h2>Thanks for reaching out to Xander Kreativ.</h2>
      <p>Hi ${escapeHtml(lead.firstName)},</p>
      <p>We received your request for <strong>${escapeHtml(lead.service)}</strong>. We will review your details and get back to you within 24 hours.</p>
      <p>Regards,<br>Xander Kreativ</p>
    `,
  });
}

async function sendEmail({ to, subject, html }) {
  if (config.mailProvider === "resend") {
    return sendWithResend({ to, subject, html });
  }

  throw new Error(`Unsupported mail provider: ${config.mailProvider}`);
}

async function sendWithResend({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.mailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${text}`);
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
