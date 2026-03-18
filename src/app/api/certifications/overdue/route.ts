import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";

export async function GET() {
  try {
    const now = new Date();

    const classes = await db.class.findMany({
      where: {
        endDate: { lt: now },
        enrollments: {
          some: {
            status: "COMPLETED",
          },
        },
      },
      include: {
        enrollments: {
          where: { status: "COMPLETED" },
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        instructorAssignments: {
          include: { instructor: { select: { name: true } } },
        },
      },
      orderBy: { endDate: "asc" },
    });

    const results = classes.map((cls) => {
      const daysSinceEnd = differenceInDays(now, cls.endDate);
      let deadlineStatus: "warning" | "overdue";
      if (daysSinceEnd > 10) {
        deadlineStatus = "overdue";
      } else {
        deadlineStatus = "warning";
      }

      return {
        classId: cls.id,
        courseType: cls.courseType,
        location: cls.location,
        startDate: cls.startDate,
        endDate: cls.endDate,
        status: cls.status,
        daysSinceEnd,
        deadlineStatus,
        uncertifiedCount: cls.enrollments.length,
        instructors: cls.instructorAssignments.map((a) => a.instructor.name),
        enrollments: cls.enrollments.map((e) => ({
          enrollmentId: e.id,
          studentId: e.student.id,
          studentName: `${e.student.firstName} ${e.student.lastName}`,
          studentEmail: e.student.email,
          courseResult: e.courseResult,
        })),
      };
    });

    return NextResponse.json({
      total: results.length,
      overdue: results.filter((r) => r.deadlineStatus === "overdue").length,
      warning: results.filter((r) => r.deadlineStatus === "warning").length,
      classes: results,
    });
  } catch (error) {
    console.error("Failed to fetch overdue certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue certifications" },
      { status: 500 }
    );
  }
}
