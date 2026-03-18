"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COURSE_TYPE_LABELS } from "@/lib/constants";

interface InstructorAssignment {
  id: string;
  classId: string;
  instructorId: string;
  role: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

interface AvailableInstructor {
  id: string;
  name: string;
  email: string;
  certifications: string[];
  locations: string[];
}

interface ClassInstructorSectionProps {
  classId: string;
  courseType: string;
  location: string;
  initialAssignments: InstructorAssignment[];
}

export function ClassInstructorSection({
  classId,
  courseType,
  location,
  initialAssignments,
}: ClassInstructorSectionProps) {
  const [assignments, setAssignments] =
    useState<InstructorAssignment[]>(initialAssignments);
  const [availableInstructors, setAvailableInstructors] = useState<
    AvailableInstructor[]
  >([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"LEAD" | "SUPPORT">("LEAD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableInstructors = useCallback(async () => {
    try {
      const res = await fetch("/api/instructors?active=true");
      if (!res.ok) return;
      const data: AvailableInstructor[] = await res.json();
      // Filter to instructors who have the right certification and are not already assigned
      const assignedIds = new Set(assignments.map((a) => a.instructorId));
      const filtered = data.filter(
        (i) =>
          !assignedIds.has(i.id) &&
          i.certifications.includes(courseType) &&
          i.locations.includes(location)
      );
      setAvailableInstructors(filtered);
    } catch {
      // Silently fail — the dropdown will just be empty
    }
  }, [assignments, courseType, location]);

  useEffect(() => {
    fetchAvailableInstructors();
  }, [fetchAvailableInstructors]);

  const handleAssign = async () => {
    if (!selectedInstructorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: selectedInstructorId,
          role: selectedRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to assign instructor");
      }
      const assignment = await res.json();
      setAssignments((prev) => [...prev, assignment]);
      setSelectedInstructorId("");
      setSelectedRole("LEAD");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to assign instructor"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (instructorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/instructors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove instructor");
      }
      setAssignments((prev) =>
        prev.filter((a) => a.instructorId !== instructorId)
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to remove instructor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Instructors ({assignments.length})
      </h2>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current assignments */}
      {assignments.length > 0 ? (
        <div className="rounded-md border mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Instructor
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">
                    {a.instructor.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {a.instructor.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={a.role === "LEAD" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {a.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(a.instructorId)}
                      disabled={loading}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          No instructors assigned to this class.
        </p>
      )}

      {/* Assign instructor controls */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">
            Assign Instructor
          </label>
          <select
            value={selectedInstructorId}
            onChange={(e) => setSelectedInstructorId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">
              {availableInstructors.length === 0
                ? `No available instructors for ${COURSE_TYPE_LABELS[courseType] || courseType}`
                : "Select an instructor..."}
            </option>
            {availableInstructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Role</label>
          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as "LEAD" | "SUPPORT")
            }
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="LEAD">Lead</option>
            <option value="SUPPORT">Support</option>
          </select>
        </div>
        <Button
          onClick={handleAssign}
          disabled={!selectedInstructorId || loading}
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </div>
    </div>
  );
}
