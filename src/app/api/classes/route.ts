import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    const classes = await db.class.findMany({
      where: location
        ? { location: location as "EMILSON" | "HALE" }
        : {},
      include: {
        _count: {
          select: { enrollments: true },
        },
        instructorAssignments: {
          include: { instructor: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Failed to list classes:", error);
    return NextResponse.json(
      { error: "Failed to list classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      courseType,
      location,
      startDate,
      endDate,
      scheduleDetails,
      durationDays,
      minEnrollment,
      maxEnrollment,
      requiresPrereq,
      requiresOnline,
      notes,
    } = body;

    if (!courseType || !location || !startDate || !endDate || !scheduleDetails || durationDays == null) {
      return NextResponse.json(
        { error: "Missing required fields: courseType, location, startDate, endDate, scheduleDetails, durationDays" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const prereqDeadline = new Date(start);
    prereqDeadline.setDate(prereqDeadline.getDate() - 3);

    const instructorToken = crypto.randomUUID();

    const newClass = await db.class.create({
      data: {
        courseType,
        location,
        startDate: start,
        endDate: new Date(endDate),
        scheduleDetails,
        durationDays,
        minEnrollment: minEnrollment ?? 5,
        maxEnrollment: maxEnrollment ?? 10,
        requiresPrereq: requiresPrereq ?? true,
        requiresOnline: requiresOnline ?? true,
        prereqDeadline,
        instructorToken,
        notes: notes ?? null,
      },
      include: {
        instructorAssignments: {
          include: { instructor: true },
        },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Failed to create class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
