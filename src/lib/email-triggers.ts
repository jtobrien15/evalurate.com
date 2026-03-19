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
import { renderCustomTemplate } from "@/lib/email-template-renderer";

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
  const variables = {
    studentName: `${student.firstName} ${student.lastName}`,
    courseType: formatCourseType(classData.courseType),
    startDate: formatDate(classData.startDate),
    endDate: formatDate(classData.endDate),
    scheduleDetails: classData.scheduleDetails,
    location: formatLocation(classData.location),
  };

  // Check for custom template first
  const custom = await renderCustomTemplate("E1", variables);

  const subject = custom?.subject ?? `Registration Confirmed: ${formatCourseType(classData.courseType)}`;
  const html = custom?.html ?? await render(WelcomeEmail(variables));

  await sendEmail({
    to: student.email,
    subject,
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
  const variables = {
    studentName: `${student.firstName} ${student.lastName}`,
    courseType: formatCourseType(classData.courseType),
    canRetry: String(canRetry),
  };

  const custom = await renderCustomTemplate("E3", variables);

  const subject = custom?.subject ?? `Prerequisite Swim Test Update: ${formatCourseType(classData.courseType)}`;
  const html = custom?.html ?? await render(
    PrereqFailedEmail({
      studentName: variables.studentName,
      courseType: variables.courseType,
      canRetry,
      transferInfo: canRetry
        ? undefined
        : "Our team will contact you with available transfer options.",
    })
  );

  await sendEmail({
    to: student.email,
    subject,
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
      id: { not: classData.id },
    },
    orderBy: { startDate: "asc" },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  const openClasses = availableClasses.filter(
    (cls) => cls._count.enrollments < cls.maxEnrollment
  );

  const classesText = openClasses
    .map((cls) => `• ${formatDate(cls.startDate)} at ${formatLocation(cls.location)} (${cls.maxEnrollment - cls._count.enrollments} spots)`)
    .join("\n");

  const variables = {
    studentName: `${student.firstName} ${student.lastName}`,
    courseType: formatCourseType(classData.courseType),
    availableClasses: classesText || "No classes currently available — we will notify you when new dates are added.",
  };

  const custom = await renderCustomTemplate("E4", variables);

  const subject = custom?.subject ?? `Transfer Options: ${formatCourseType(classData.courseType)}`;
  const html = custom?.html ?? await render(
    TransferOptionsEmail({
      studentName: variables.studentName,
      originalCourseType: variables.courseType,
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
    subject,
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
  const parentName =
    student.sgaRegistrantName ?? student.parentName ?? `${student.firstName} ${student.lastName}`;

  const recipientEmail = student.parentEmail ?? student.email;

  const variables = {
    studentName: `${student.firstName} ${student.lastName}`,
    parentName,
    courseType: formatCourseType(classData.courseType),
  };

  const custom = await renderCustomTemplate("E14", variables);

  const subject = custom?.subject ?? `Action Needed: Student Information for ${formatCourseType(classData.courseType)}`;
  const html = custom?.html ?? await render(
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
    subject,
    html,
    templateId: "E14",
    enrollmentId: enrollment.id,
  });
}
