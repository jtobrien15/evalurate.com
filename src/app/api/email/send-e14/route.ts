import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStudentInfoRequestEmail } from "@/lib/email-triggers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId || typeof enrollmentId !== "string") {
      return NextResponse.json(
        { error: "enrollmentId is required" },
        { status: 400 }
      );
    }

    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        class: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    await sendStudentInfoRequestEmail(
      enrollment,
      enrollment.student,
      enrollment.class
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-e14] Error:", error);
    return NextResponse.json(
      { error: "Failed to send student info request email" },
      { status: 500 }
    );
  }
}
