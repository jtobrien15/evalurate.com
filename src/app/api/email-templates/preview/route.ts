import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_DATA } from "@/lib/email-template-defaults";

export async function POST(request: NextRequest) {
  try {
    const { templateId, subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    const sampleData = SAMPLE_DATA[templateId] ?? SAMPLE_DATA["E1"];

    // Replace {{variables}} with sample data
    let renderedSubject = subject;
    let renderedBody = body;

    for (const [key, value] of Object.entries(sampleData)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      renderedSubject = renderedSubject.replace(pattern, value);
      renderedBody = renderedBody.replace(pattern, value);
    }

    // Wrap body in a simple HTML email layout
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f6f9fc; margin: 0; padding: 20px; }
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
      <h1>${renderedSubject}</h1>
    </div>
    <div class="content">
      ${renderedBody.replace(/\n/g, "<br>")}
    </div>
    <div class="footer">
      This is a preview with sample data.
    </div>
  </div>
</body>
</html>`;

    return NextResponse.json({
      subject: renderedSubject,
      html,
    });
  } catch (error) {
    console.error("Failed to preview template:", error);
    return NextResponse.json(
      { error: "Failed to preview template" },
      { status: 500 }
    );
  }
}
