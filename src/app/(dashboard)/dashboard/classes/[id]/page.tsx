export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { EnrollmentTable } from "@/components/enrollment-table";
import { COURSE_TYPE_LABELS, LOCATION_LABELS } from "@/lib/constants";
import { ClassInstructorSection } from "@/components/class-instructor-section";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cls = await db.class.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          student: true,
          emailLog: { orderBy: { sentAt: "desc" }, take: 5 },
        },
        orderBy: { registrationDate: "asc" },
      },
      waitlist: {
        include: { student: true },
        orderBy: { position: "asc" },
      },
      instructorAssignments: {
        include: { instructor: true },
      },
    },
  });

  if (!cls) notFound();

  const activeEnrollments = cls.enrollments.filter(
    (e) => !["CANCELLED", "NO_SHOW", "TRANSFERRED"].includes(e.status)
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/classes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Classes
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {COURSE_TYPE_LABELS[cls.courseType] || cls.courseType}
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(cls.startDate), "MMMM d")} –{" "}
            {format(new Date(cls.endDate), "MMMM d, yyyy")} &middot;{" "}
            {LOCATION_LABELS[cls.location] || cls.location}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            cls.status === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {cls.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Schedule</p>
          <p className="font-medium mt-1">{cls.scheduleDetails}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Enrollment</p>
          <p className="font-medium mt-1">
            {activeEnrollments.length} / {cls.maxEnrollment}
            {activeEnrollments.length < cls.minEnrollment && (
              <span className="text-yellow-600 text-sm ml-2">
                (min: {cls.minEnrollment})
              </span>
            )}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Prereq Deadline</p>
          <p className="font-medium mt-1">
            {cls.prereqDeadline
              ? format(new Date(cls.prereqDeadline), "MMM d, yyyy")
              : "N/A"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Instructors</p>
          <p className="font-medium mt-1">
            {cls.instructorAssignments.length > 0
              ? cls.instructorAssignments
                  .map((a) => `${a.instructor.name} (${a.role})`)
                  .join(", ")
              : "None assigned"}
          </p>
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Enrollments ({cls.enrollments.length})
        </h2>
        <EnrollmentTable
          enrollments={cls.enrollments}
          classId={cls.id}
        />
      </div>

      {/* Instructors */}
      <div className="mb-8">
        <ClassInstructorSection
          classId={cls.id}
          courseType={cls.courseType}
          location={cls.location}
          initialAssignments={cls.instructorAssignments.map((a) => ({
            id: a.id,
            classId: a.classId,
            instructorId: a.instructorId,
            role: a.role,
            instructor: {
              id: a.instructor.id,
              name: a.instructor.name,
              email: a.instructor.email,
            },
          }))}
        />
      </div>

      {/* Waitlist */}
      {cls.waitlist.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Waitlist ({cls.waitlist.length})
          </h2>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Prereq
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Added
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Notified
                  </th>
                </tr>
              </thead>
              <tbody>
                {cls.waitlist.map((entry) => (
                  <tr key={entry.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{entry.position}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {entry.student.firstName} {entry.student.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.prereqStatus === "PASSED"
                            ? "bg-green-100 text-green-700"
                            : entry.prereqStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {entry.prereqStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(entry.addedDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entry.notified ? (
                        <span className="text-green-600">
                          Yes
                          {entry.responseDeadline &&
                            ` (due ${format(new Date(entry.responseDeadline), "MMM d")})`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
