"use client";

import { useEffect, useState } from "react";
import { COURSE_TYPE_LABELS, LOCATION_LABELS } from "@/lib/constants";

interface MismatchItem {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    parentName: string | null;
    parentEmail: string | null;
    sgaRegistrantName: string | null;
    dateOfBirth: string | null;
  };
  enrollment: {
    id: string;
    status: string;
    classId: string;
    courseName: string;
    startDate: string;
    location: string;
  };
  mismatchReason: string;
  suggested: boolean;
}

export function MismatchAlert() {
  const [mismatches, setMismatches] = useState<MismatchItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMismatches() {
      try {
        const res = await fetch("/api/students/mismatches");
        if (!res.ok) throw new Error("Failed to fetch mismatches");
        const data = await res.json();
        setMismatches(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load mismatches"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchMismatches();
  }, []);

  async function handleSendE14(enrollmentId: string) {
    setSending((prev) => new Set(prev).add(enrollmentId));
    try {
      const res = await fetch("/api/email/send-e14", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }
      // Move to dismissed after sending
      setDismissed((prev) => new Set(prev).add(enrollmentId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send info request"
      );
    } finally {
      setSending((prev) => {
        const next = new Set(prev);
        next.delete(enrollmentId);
        return next;
      });
    }
  }

  function handleDismiss(enrollmentId: string) {
    setDismissed((prev) => new Set(prev).add(enrollmentId));
  }

  function handleMarkCorrect(enrollmentId: string) {
    setConfirmed((prev) => new Set(prev).add(enrollmentId));
  }

  const visibleMismatches = mismatches.filter(
    (m) => !dismissed.has(m.enrollment.id) && !confirmed.has(m.enrollment.id)
  );

  if (loading) return null;
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }
  if (visibleMismatches.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3 mb-3">
        <svg
          className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-amber-800">
            Parent/Student Mismatch Detected
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            {visibleMismatches.length} registration
            {visibleMismatches.length === 1 ? "" : "s"} may have parent
            information instead of student information.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleMismatches.map((mismatch) => {
          const isSending = sending.has(mismatch.enrollment.id);
          return (
            <div
              key={mismatch.enrollment.id}
              className="rounded-md border border-amber-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {mismatch.student.firstName} {mismatch.student.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {COURSE_TYPE_LABELS[mismatch.enrollment.courseName] ??
                      mismatch.enrollment.courseName}{" "}
                    &mdash;{" "}
                    {LOCATION_LABELS[mismatch.enrollment.location] ??
                      mismatch.enrollment.location}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {mismatch.mismatchReason}
                  </p>
                  {mismatch.student.sgaRegistrantName && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      SGA Registrant: {mismatch.student.sgaRegistrantName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSendE14(mismatch.enrollment.id)}
                    disabled={isSending}
                    className="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? "Sending..." : "Send Info Request (E14)"}
                  </button>
                  <button
                    onClick={() => handleMarkCorrect(mismatch.enrollment.id)}
                    className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 hover:bg-green-100"
                  >
                    Mark as Correct
                  </button>
                  <button
                    onClick={() => handleDismiss(mismatch.enrollment.id)}
                    className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
