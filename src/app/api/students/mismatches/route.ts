import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Courses where registrants are commonly parents registering children
const YOUTH_COURSE_TYPES = [
  "LIFEGUARDING",
  "BABYSITTER_TRAINING",
];

// Age threshold — if registrant is over 25, likely a parent
const PARENT_AGE_THRESHOLD = 25;

function normalizeNameForComparison(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

export async function GET() {
  try {
    // Fetch students who have active enrollments (not cancelled/completed)
    const students = await db.student.findMany({
      where: {
        enrollments: {
          some: {
            status: {
              notIn: ["CANCELLED", "NO_SHOW", "CERTIFIED", "COMPLETED"],
            },
          },
        },
      },
      include: {
        enrollments: {
          where: {
            status: {
              notIn: ["CANCELLED", "NO_SHOW", "CERTIFIED", "COMPLETED"],
            },
          },
          include: {
            class: true,
          },
        },
      },
    });

    const mismatches: Array<{
      student: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        parentName: string | null;
        parentEmail: string | null;
        sgaRegistrantName: string | null;
        dateOfBirth: Date | null;
      };
      enrollment: {
        id: string;
        status: string;
        classId: string;
        courseName: string;
        startDate: Date;
        location: string;
      };
      mismatchReason: string;
      suggested: boolean;
    }> = [];

    for (const student of students) {
      for (const enrollment of student.enrollments) {
        const reasons: string[] = [];

        const studentFullName = normalizeNameForComparison(
          `${student.firstName} ${student.lastName}`
        );

        // Check 1: sgaRegistrantName differs from student name
        if (student.sgaRegistrantName) {
          const registrantName = normalizeNameForComparison(
            student.sgaRegistrantName
          );
          if (registrantName !== studentFullName) {
            reasons.push(
              `SGA registrant "${student.sgaRegistrantName}" differs from student name "${student.firstName} ${student.lastName}"`
            );
          }
        }

        // Check 2: Age over threshold for youth-oriented courses
        if (
          student.dateOfBirth &&
          YOUTH_COURSE_TYPES.includes(enrollment.class.courseType)
        ) {
          const age = calculateAge(student.dateOfBirth);
          if (age > PARENT_AGE_THRESHOLD) {
            reasons.push(
              `Registrant is ${age} years old — may be a parent registering for ${enrollment.class.courseType}`
            );
          }
        }

        // Check 3: parentEmail is null but sgaRegistrantName suggests a parent
        if (
          !student.parentEmail &&
          student.sgaRegistrantName &&
          normalizeNameForComparison(student.sgaRegistrantName) !==
            studentFullName
        ) {
          // Only add if not already flagged by check 1
          if (
            !reasons.some((r) => r.startsWith("SGA registrant"))
          ) {
            reasons.push(
              "Parent email missing but registration name suggests a different person"
            );
          }
        }

        if (reasons.length > 0) {
          mismatches.push({
            student: {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              parentName: student.parentName,
              parentEmail: student.parentEmail,
              sgaRegistrantName: student.sgaRegistrantName,
              dateOfBirth: student.dateOfBirth,
            },
            enrollment: {
              id: enrollment.id,
              status: enrollment.status,
              classId: enrollment.classId,
              courseName: enrollment.class.courseType,
              startDate: enrollment.class.startDate,
              location: enrollment.class.location,
            },
            mismatchReason: reasons.join("; "),
            suggested: true,
          });
        }
      }
    }

    return NextResponse.json(mismatches);
  } catch (error) {
    console.error("[mismatches] Error detecting mismatches:", error);
    return NextResponse.json(
      { error: "Failed to detect mismatches" },
      { status: 500 }
    );
  }
}
