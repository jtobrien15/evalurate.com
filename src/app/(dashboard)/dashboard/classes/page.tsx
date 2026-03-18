export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { COURSE_TYPE_LABELS, LOCATION_LABELS, CLASS_STATUS_COLORS } from "@/lib/constants";

interface ClassesPageProps {
  searchParams: Promise<{ location?: string }>;
}

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const params = await searchParams;
  const locationFilter = params.location;

  const classes = await db.class.findMany({
    where: locationFilter
      ? { location: locationFilter as "EMILSON" | "HALE" }
      : {},
    include: {
      enrollments: {
        where: {
          status: { notIn: ["CANCELLED", "NO_SHOW", "TRANSFERRED"] },
        },
      },
      instructorAssignments: {
        include: { instructor: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Link
          href="/dashboard/classes/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Class
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Course
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Dates
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Enrolled
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Instructors
              </th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No classes found{locationFilter ? ` for ${LOCATION_LABELS[locationFilter] || locationFilter}` : ""}. Create your first class to get started.
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/classes/${cls.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {COURSE_TYPE_LABELS[cls.courseType] || cls.courseType}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {cls.scheduleDetails}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(cls.startDate), "MMM d")} –{" "}
                    {format(new Date(cls.endDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {LOCATION_LABELS[cls.location] || cls.location}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        cls.enrollments.length >= cls.maxEnrollment
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {cls.enrollments.length}
                    </span>
                    <span className="text-muted-foreground">
                      /{cls.maxEnrollment}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${CLASS_STATUS_COLORS[cls.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {cls.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {cls.instructorAssignments.length > 0
                      ? cls.instructorAssignments
                          .map((a) => a.instructor.name)
                          .join(", ")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
