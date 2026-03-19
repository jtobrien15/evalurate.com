import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TEMPLATE_VARIABLES } from "@/lib/email-template-defaults";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const template = await db.emailTemplate.findUnique({
      where: { templateId: id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { subject, body: emailBody, active } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    // Validate required variables are present
    const requiredVars = TEMPLATE_VARIABLES[id] ?? [];
    const missingVars: string[] = [];
    for (const v of requiredVars) {
      if (!subject.includes(`{{${v}}}`) && !emailBody.includes(`{{${v}}}`)) {
        // Only warn for critical variables (studentName, courseType)
        if (v === "studentName" || v === "courseType") {
          missingVars.push(v);
        }
      }
    }

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          error: `Missing recommended variables: ${missingVars.map((v) => `{{${v}}}`).join(", ")}`,
          warning: true,
        },
        { status: 400 }
      );
    }

    const template = await db.emailTemplate.upsert({
      where: { templateId: id },
      update: {
        subject,
        body: emailBody,
        active: active ?? true,
      },
      create: {
        templateId: id,
        name: getTemplateName(id),
        subject,
        body: emailBody,
        active: active ?? true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

function getTemplateName(templateId: string): string {
  const names: Record<string, string> = {
    E1: "Welcome / Registration Confirmed",
    E2: "Prereq Reminder",
    E3: "Prereq Failed",
    E4: "Transfer Options",
    E7: "Class Reminder",
    E14: "Student Info Request",
  };
  return names[templateId] ?? templateId;
}
