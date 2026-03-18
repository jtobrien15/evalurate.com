import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const instructor = await db.instructor.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            class: {
              include: {
                _count: {
                  select: { enrollments: true },
                },
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instructor);
  } catch (error) {
    console.error("Failed to get instructor:", error);
    return NextResponse.json(
      { error: "Failed to get instructor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.instructor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    // If email is being changed, check for uniqueness
    if (body.email && body.email !== existing.email) {
      const emailTaken = await db.instructor.findUnique({
        where: { email: body.email },
      });
      if (emailTaken) {
        return NextResponse.json(
          { error: "An instructor with this email already exists" },
          { status: 409 }
        );
      }
    }

    const instructor = await db.instructor.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.certifications !== undefined && {
          certifications: body.certifications,
        }),
        ...(body.locations !== undefined && { locations: body.locations }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });

    return NextResponse.json(instructor);
  } catch (error) {
    console.error("Failed to update instructor:", error);
    return NextResponse.json(
      { error: "Failed to update instructor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const instructor = await db.instructor.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            class: {
              select: { startDate: true, status: true },
            },
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    // Check for future class assignments
    const now = new Date();
    const futureAssignments = instructor.assignments.filter(
      (a) =>
        new Date(a.class.startDate) > now &&
        !["COMPLETED", "CANCELLED"].includes(a.class.status)
    );

    if (futureAssignments.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot deactivate: instructor has ${futureAssignments.length} future class assignment(s). Remove them first.`,
        },
        { status: 400 }
      );
    }

    // Soft delete
    const updated = await db.instructor.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to deactivate instructor:", error);
    return NextResponse.json(
      { error: "Failed to deactivate instructor" },
      { status: 500 }
    );
  }
}
