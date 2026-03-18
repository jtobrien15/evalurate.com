import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const body = await request.json();
    const { instructorId, role } = body;

    if (!instructorId || !role) {
      return NextResponse.json(
        { error: "instructorId and role are required" },
        { status: 400 }
      );
    }

    if (!["LEAD", "SUPPORT"].includes(role)) {
      return NextResponse.json(
        { error: "role must be LEAD or SUPPORT" },
        { status: 400 }
      );
    }

    // Get the class
    const cls = await db.class.findUnique({
      where: { id: classId },
      select: { courseType: true, location: true },
    });
    if (!cls) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Get the instructor
    const instructor = await db.instructor.findUnique({
      where: { id: instructorId },
      select: { certifications: true, locations: true, active: true },
    });
    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    if (!instructor.active) {
      return NextResponse.json(
        { error: "Cannot assign an inactive instructor" },
        { status: 400 }
      );
    }

    // Validate certification
    if (!instructor.certifications.includes(cls.courseType)) {
      return NextResponse.json(
        {
          error: `Instructor is not certified for ${cls.courseType}`,
        },
        { status: 400 }
      );
    }

    // Check if already assigned
    const existingAssignment =
      await db.classInstructorAssignment.findUnique({
        where: {
          classId_instructorId: { classId, instructorId },
        },
      });
    if (existingAssignment) {
      return NextResponse.json(
        { error: "Instructor is already assigned to this class" },
        { status: 409 }
      );
    }

    const assignment = await db.classInstructorAssignment.create({
      data: {
        classId,
        instructorId,
        role,
      },
      include: {
        instructor: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Failed to assign instructor:", error);
    return NextResponse.json(
      { error: "Failed to assign instructor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const body = await request.json();
    const { instructorId } = body;

    if (!instructorId) {
      return NextResponse.json(
        { error: "instructorId is required" },
        { status: 400 }
      );
    }

    const assignment = await db.classInstructorAssignment.findUnique({
      where: {
        classId_instructorId: { classId, instructorId },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    await db.classInstructorAssignment.delete({
      where: { id: assignment.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove instructor assignment:", error);
    return NextResponse.json(
      { error: "Failed to remove instructor assignment" },
      { status: 500 }
    );
  }
}
