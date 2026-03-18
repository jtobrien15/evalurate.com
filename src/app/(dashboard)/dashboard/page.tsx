export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { format, differenceInDays, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { COURSE_TYPE_LABELS, LOCATION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TERMINAL_STATUSES = [
  "TRANSFERRED",
  "CERTIFIED",
  "CANCELLED",
  "NO_SHOW",
  "DID_NOT_COMPLETE",
] as const;

interface DashboardPageProps {
  searchParams: Promise<{ location?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const locationFilter = params.location;
  const locationWhere = locationFilter
    ? { location: locationFilter as "EMILSON" | "HALE" }
    : {};
  const classLocationWhere = locationFilter
    ? { class: { location: locationFilter as "EMILSON" | "HALE" } }
    : {};

  const now = new Date();

  // ── Quick Stats ──────────────────────────────────────────────────
  const [activeClassCount, totalStudents, pendingCerts, waitlistedCount] =
    await Promise.all([
      db.class.count({
        where: {
          status: { in: ["IN_PROGRESS", "CONFIRMED"] },
          ...locationWhere,
        },
      }),
      db.enrollment.count({
        where: {
          status: { notIn: [...TERMINAL_STATUSES] },
          ...(locationFilter
            ? { class: { location: locationFilter as "EMILSON" | "HALE" } }
            : {}),
        },
      }),
      db.enrollment.count({
        where: {
          status: "COMPLETED",
          ...(locationFilter
            ? { class: { location: locationFilter as "EMILSON" | "HALE" } }
            : {}),
        },
      }),
      db.waitlistEntry.count({
        where: locationFilter
          ? { class: { location: locationFilter as "EMILSON" | "HALE" } }
          : {},
      }),
    ]);

  const stats = [
    { title: "Active Classes", value: activeClassCount },
    { title: "Total Students", value: totalStudents },
    { title: "Pending Certs", value: pendingCerts },
    { title: "Waitlisted", value: waitlistedCount },
  ];

  // ── Action Items ─────────────────────────────────────────────────

  // 1. Prereq overdue: REGISTERED 7+ days, no prereqScheduledDate
  const sevenDaysAgo = addDays(now, -7);
  const prereqOverdueCount = await db.enrollment.count({
    where: {
      status: "REGISTERED",
      prereqScheduledDate: null,
      registrationDate: { lte: sevenDaysAgo },
      ...classLocationWhere,
    },
  });

  // 2. Under-enrolled classes starting within 14 days
  const fourteenDaysOut = addDays(now, 14);
  const underEnrolledClasses = await db.class.findMany({
    where: {
      status: { in: ["SCHEDULED", "OPEN_FOR_REGISTRATION"] },
      startDate: { lte: fourteenDaysOut, gte: now },
      ...locationWhere,
    },
    include: {
      enrollments: {
        where: { status: { notIn: [...TERMINAL_STATUSES] } },
      },
    },
  });
  const underEnrolled = underEnrolledClasses
    .filter((cls) => cls.enrollments.length < cls.minEnrollment)
    .map((cls) => ({
      id: cls.id,
      name: COURSE_TYPE_LABELS[cls.courseType] || cls.courseType,
      enrolled: cls.enrollments.length,
      min: cls.minEnrollment,
      startDate: cls.startDate,
    }));

  // 3. Pending transfers
  const pendingTransferCount = await db.enrollment.count({
    where: {
      status: "TRANSFER_PENDING",
      ...classLocationWhere,
    },
  });

  // 4. Certification deadlines: classes ended 7+ days ago with COMPLETED enrollments
  const sevenDaysAgoDate = addDays(now, -7);
  const certDeadlineClasses = await db.class.findMany({
    where: {
      status: { in: ["COMPLETED", "IN_PROGRESS"] },
      endDate: { lte: sevenDaysAgoDate },
      ...locationWhere,
      enrollments: {
        some: { status: "COMPLETED" },
      },
    },
    include: {
      _count: {
        select: {
          enrollments: { where: { status: "COMPLETED" } },
        },
      },
    },
  });
  const certDeadlines = certDeadlineClasses.map((cls) => ({
    id: cls.id,
    name: COURSE_TYPE_LABELS[cls.courseType] || cls.courseType,
    daysOverdue: differenceInDays(now, cls.endDate),
    uncertifiedCount: cls._count.enrollments,
  }));

  // 5. Instructor checklists overdue: COMPLETED classes with PENDING courseResult
  const checklistOverdueClasses = await db.class.findMany({
    where: {
      status: "COMPLETED",
      ...locationWhere,
      enrollments: {
        some: { courseResult: "PENDING" },
      },
    },
    select: {
      id: true,
      courseType: true,
    },
  });
  const checklistOverdue = checklistOverdueClasses.map((cls) => ({
    id: cls.id,
    name: COURSE_TYPE_LABELS[cls.courseType] || cls.courseType,
  }));

  // ── Upcoming Classes ─────────────────────────────────────────────
  const upcomingClasses = await db.class.findMany({
    where: {
      startDate: { gte: now, lte: fourteenDaysOut },
      status: { notIn: ["CANCELLED", "COMPLETED"] },
      ...locationWhere,
    },
    include: {
      enrollments: {
        where: { status: { notIn: [...TERMINAL_STATUSES] } },
      },
      instructorAssignments: {
        include: { instructor: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Items */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Action Items</h2>
        <div className="space-y-3">
          {certDeadlines.length > 0 &&
            certDeadlines.map((item) => (
              <ActionItem
                key={`cert-${item.id}`}
                color="red"
                label="Certification Overdue"
              >
                <Link
                  href={`/dashboard/classes/${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <span className="text-muted-foreground">
                  {" "}&mdash; {item.daysOverdue} days since class ended, {item.uncertifiedCount} uncertified
                  {item.daysOverdue > 10 && (
                    <span className="text-red-600 font-semibold"> (past 10-day deadline)</span>
                  )}
                </span>
              </ActionItem>
            ))}

          {prereqOverdueCount > 0 && (
            <ActionItem color="red" label="Prereq Overdue">
              <Link href="/dashboard/students" className="font-medium hover:underline">
                {prereqOverdueCount} student{prereqOverdueCount !== 1 ? "s" : ""} registered 7+ days with no prereq scheduled
              </Link>
            </ActionItem>
          )}

          {checklistOverdue.length > 0 &&
            checklistOverdue.map((item) => (
              <ActionItem
                key={`checklist-${item.id}`}
                color="amber"
                label="Checklist Overdue"
              >
                <Link
                  href={`/dashboard/classes/${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <span className="text-muted-foreground">
                  {" "}&mdash; instructor checklist incomplete (courseResult still pending)
                </span>
              </ActionItem>
            ))}

          {underEnrolled.length > 0 &&
            underEnrolled.map((item) => (
              <ActionItem
                key={`under-${item.id}`}
                color="amber"
                label="Under-enrolled"
              >
                <Link
                  href={`/dashboard/classes/${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <span className="text-muted-foreground">
                  {" "}&mdash; {item.enrolled}/{item.min} enrolled (starts{" "}
                  {format(item.startDate, "MMM d")})
                </span>
              </ActionItem>
            ))}

          {pendingTransferCount > 0 && (
            <ActionItem color="blue" label="Pending Transfers">
              <Link href="/dashboard/transfers" className="font-medium hover:underline">
                {pendingTransferCount} transfer{pendingTransferCount !== 1 ? "s" : ""} awaiting action
              </Link>
            </ActionItem>
          )}

          {certDeadlines.length === 0 &&
            prereqOverdueCount === 0 &&
            checklistOverdue.length === 0 &&
            underEnrolled.length === 0 &&
            pendingTransferCount === 0 && (
              <p className="text-muted-foreground text-sm py-4">
                No action items right now. Everything is on track.
              </p>
            )}
        </div>
      </div>

      {/* Upcoming Classes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Classes (Next 14 Days)</h2>
        {upcomingClasses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No classes starting in the next 14 days.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingClasses.map((cls) => {
              const enrolled = cls.enrollments.length;
              const pct = cls.maxEnrollment > 0 ? (enrolled / cls.maxEnrollment) * 100 : 0;
              const barColor =
                enrolled < cls.minEnrollment
                  ? "bg-red-500"
                  : enrolled === cls.minEnrollment
                    ? "bg-yellow-500"
                    : "bg-green-500";
              const instructors = cls.instructorAssignments
                .map((a) => a.instructor.name)
                .join(", ");

              return (
                <Link
                  key={cls.id}
                  href={`/dashboard/classes/${cls.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">
                            {COURSE_TYPE_LABELS[cls.courseType] || cls.courseType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(cls.startDate, "MMM d")} &ndash;{" "}
                            {format(cls.endDate, "MMM d, yyyy")}
                          </p>
                        </div>
                        <span className="text-xs rounded-full bg-muted px-2 py-1">
                          {LOCATION_LABELS[cls.location] || cls.location}
                        </span>
                      </div>

                      {/* Enrollment Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Enrolled</span>
                          <span>
                            {enrolled}/{cls.maxEnrollment}
                            {enrolled < cls.minEnrollment && (
                              <span className="text-red-500 ml-1">(min {cls.minEnrollment})</span>
                            )}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", barColor)}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {instructors && (
                        <p className="text-sm text-muted-foreground">
                          {instructors}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Action Item Component ─────────────────────────────────────────
function ActionItem({
  color,
  label,
  children,
}: {
  color: "red" | "amber" | "blue";
  label: string;
  children: React.ReactNode;
}) {
  const borderColor = {
    red: "border-l-red-500",
    amber: "border-l-amber-500",
    blue: "border-l-blue-500",
  }[color];

  const badgeColor = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  }[color];

  return (
    <div
      className={cn(
        "border-l-4 rounded-r-md bg-card border border-l-0 p-4 flex items-start gap-3",
        borderColor
      )}
    >
      <span
        className={cn(
          "text-xs font-medium rounded-full px-2 py-0.5 whitespace-nowrap",
          badgeColor
        )}
      >
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
