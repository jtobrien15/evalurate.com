import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeFilter = searchParams.get("active");

    const where = activeFilter === "true" ? { active: true } : {};

    const instructors = await db.instructor.findMany({
      where,
      include: {
        assignments: {
          include: {
            class: {
              select: {
                id: true,
                courseType: true,
                location: true,
                startDate: true,
                endDate: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(instructors);
  } catch (error) {
    console.error("Failed to list instructors:", error);
    return NextResponse.json(
      { error: "Failed to list instructors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, certifications, locations } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const existing = await db.instructor.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An instructor with this email already exists" },
        { status: 409 }
      );
    }

    const instructor = await db.instructor.create({
      data: {
        name,
        email,
        phone: phone || null,
        certifications: certifications || [],
        locations: locations || [],
      },
    });

    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    console.error("Failed to create instructor:", error);
    return NextResponse.json(
      { error: "Failed to create instructor" },
      { status: 500 }
    );
  }
}
