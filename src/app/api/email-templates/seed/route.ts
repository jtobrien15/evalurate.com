import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_TEMPLATES } from "@/lib/email-template-defaults";

export async function POST() {
  try {
    let created = 0;
    let skipped = 0;

    for (const template of DEFAULT_TEMPLATES) {
      const existing = await db.emailTemplate.findUnique({
        where: { templateId: template.templateId },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await db.emailTemplate.create({
        data: {
          templateId: template.templateId,
          name: template.name,
          subject: template.subject,
          body: template.body,
          active: true,
        },
      });
      created++;
    }

    return NextResponse.json({ created, skipped });
  } catch (error) {
    console.error("Failed to seed templates:", error);
    return NextResponse.json(
      { error: "Failed to seed templates" },
      { status: 500 }
    );
  }
}
