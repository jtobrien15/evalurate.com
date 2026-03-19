import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_TEMPLATES } from "@/lib/email-template-defaults";

export async function GET() {
  try {
    let templates = await db.emailTemplate.findMany({
      orderBy: { templateId: "asc" },
    });

    // If no templates exist, return defaults (unsaved)
    if (templates.length === 0) {
      return NextResponse.json(
        DEFAULT_TEMPLATES.map((t) => ({
          id: null,
          ...t,
          active: true,
          createdAt: null,
          updatedAt: null,
        }))
      );
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to list email templates:", error);
    return NextResponse.json(
      { error: "Failed to list email templates" },
      { status: 500 }
    );
  }
}
