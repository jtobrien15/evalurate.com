/**
 * Email trigger functions for enrollment lifecycle transitions.
 * Each function renders a React Email template to HTML and sends it
 * via the sendEmail() helper. These are designed to be called
 * non-blocking (fire-and-forget with error logging).
 */

import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db";
import type { Enrollment, Student, Class } from "@/types";
import WelcomeEmail from "@/emails/welcome";
import PrereqFailedEmail from "@/emails/prereq-failed";
import TransferOptionsEmail from "@/emails/transfer-options";
import StudentInfoRequestEmail from "@/emails/student-info-request";
import { COURSE_TYPE_LABELS, LOCATION_LABELS } from "@/lib/constants";

// ─── DISPLAY HELPERS ─────────────────────────────────────────────────────────

function formatCourseType(courseType: string): string {
  return COURSE_TYPE_LABELS[courseType] ?? courseType;
}

function formatLocation(location: string): string {
  return LOCATION_LABELS[location] ?? location;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── E1: WELCOME EMAIL ──────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  enrollment: Enrollment,
  student: Student,
  classData: Class
): Promise<void> {
  const html = await render(
    WelcomeEmail({
      studentName: `${student.firstName} ${student.lastName}`,
      courseType: formatCourseType(classData.courseType),
      startDate: formatDate(classData.startDate),
      endDate: formatDate(classData.endDate),
      scheduleDetails: classData.scheduleDetails,
      location: formatLocation(classData.location),
    })
  );

  await sendEmail({
    to: student.email,
    subject: `Registration Confirmed: ${formatCourseType(classData.courseType)}`,
    html,
    templateId: "E1",
    enrollmentId: enrollment.id,
  });
}

// ─── E3: PREREQ FAILED EMAIL ────────────────────────────────────────────────

export async function sendPrereqFailedEmail(
  enrollment: Enrollment,
  student: Student,
  classData: Class,
  canRetry: boolean
): Promise<void> {
  const html = await render(
    PrereqFailedEmail({
      studentName: `${student.firstName} ${student.lastName}`,
      courseType: formatCourseType(classData.courseType),
      canRetry,
      transferInfo: canRetry
        ? undefined
        : "Our team will contact you with available transfer options.",
    })
  );

  await sendEmail({
    to: student.email,
    subject: `Prerequisite Swim Test Update: ${formatCourseType(classData.courseType)}`,
    html,
    templateId: "E3",
    enrollmentId: enrollment.id,
  });
}

// ─── E4: TRANSFER OPTIONS EMAIL ──────────────────────────────────────────────

export async function sendTransferOptionsEmail(
  enrollment: Enrollment,
  student: Student,
  classData: Class
): Promise<void> {
  // Query for upcoming classes of the same courseType that are not full
  const availableClasses = await db.class.findMany({
    where: {
      courseType: classData.courseType,
      startDate: { gt: new Date() },
      status: { in: ["SCHEDULED", "OPEN_FOR_REGISTRATION"] },
      id: { not: classData.id }, // Exclude the current class
    },
    orderBy: { startDate: "asc" },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  // Filter out classes that are at capacity
  const openClasses = availableClasses.filter(
    (cls) => cls._count.enrollments < cls.maxEnrollment
  );

  const html = await render(
    TransferOptionsEmail({
      studentName: `${student.firstName} ${student.lastName}`,
      originalCourseType: formatCourseType(classData.courseType),
      availableClasses: openClasses.map((cls) => ({
        id: cls.id,
        startDate: formatDate(cls.startDate),
        location: formatLocation(cls.location),
        scheduleDetails: cls.scheduleDetails,
      })),
    })
  );

  await sendEmail({
    to: student.email,
    subject: `Transfer Options: ${formatCourseType(classData.courseType)}`,
    html,
    templateId: "E4",
    enrollmentId: enrollment.id,
  });
}

// ─── E14: STUDENT INFO REQUEST (PARENT/CHILD MISMATCH) ─────────────────────

export async function sendStudentInfoRequestEmail(
  enrollment: Enrollment,
  student: Student,
  classData: Class
): Promise<void> {
  // Determine who to address — prefer sgaRegistrantName, fall back to parentName
  const parentName =
    student.sgaRegistrantName ?? student.parentName ?? `${student.firstName} ${student.lastName}`;

  const recipientEmail = student.parentEmail ?? student.email;

  const html = await render(
    StudentInfoRequestEmail({
      parentName,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      courseName: formatCourseType(classData.courseType),
      startDate: formatDate(classData.startDate),
      location: formatLocation(classData.location),
    })
  );

  await sendEmail({
    to: recipientEmail,
    subject: `Action Needed: Student Information for ${formatCourseType(classData.courseType)}`,
    html,
    templateId: "E14",
    enrollmentId: enrollment.id,
  });
}
