/**
 * Renders email templates from the database, replacing {{variables}} with values.
 * Falls back to null if no custom template exists (caller should use React Email).
 */

import { db } from "@/lib/db";

interface RenderedTemplate {
  subject: string;
  html: string;
}

/**
 * Try to render a custom template from the database.
 * Returns null if no custom template exists for this templateId.
 */
export async function renderCustomTemplate(
  templateId: string,
  variables: Record<string, string>
): Promise<RenderedTemplate | null> {
  try {
    const template = await db.emailTemplate.findUnique({
      where: { templateId },
    });

    if (!template || !template.active) {
      return null;
    }

    let subject = template.subject;
    let body = template.body;

    // Replace all {{variable}} placeholders
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      subject = subject.replace(pattern, value);
      body = body.replace(pattern, value);
    }

    // Wrap in HTML email layout
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f6f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #2563eb; padding: 32px 40px; }
    .header h1 { color: #fff; font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 32px 40px; color: #374151; font-size: 15px; line-height: 1.6; }
    .content p { margin: 0 0 16px 0; }
    .footer { padding: 20px 40px; color: #9ca3af; font-size: 13px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${subject}</h1>
    </div>
    <div class="content">
      ${body.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}
    </div>
    <div class="footer">
      YMCA Aquatics Department
    </div>
  </div>
</body>
</html>`;

    return { subject, html };
  } catch (error) {
    console.error(`[email-template] Failed to render custom template ${templateId}:`, error);
    return null;
  }
}
