"use client";

import { useEffect, useState, useCallback } from "react";
import { UserCheck, Plus, Pencil, X, Check, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COURSE_TYPE_LABELS, LOCATION_LABELS } from "@/lib/constants";

const COURSE_TYPES = [
  "LIFEGUARDING",
  "CPR_AED_PRO",
  "FIRST_AID_CPR_AED",
  "BLS",
  "LIFEGUARD_INSTRUCTOR",
  "FA_CPR_AED_INSTRUCTOR",
  "BLS_INSTRUCTOR",
  "BABYSITTER_TRAINING",
  "WSI",
  "LGI_IT_RECERT",
] as const;

const LOCATIONS = ["EMILSON", "HALE"] as const;

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  certifications: string[];
  locations: string[];
  active: boolean;
  assignments: { id: string; classId: string; role: string }[];
}

interface InstructorForm {
  name: string;
  email: string;
  phone: string;
  certifications: string[];
  locations: string[];
}

const emptyForm: InstructorForm = {
  name: "",
  email: "",
  phone: "",
  certifications: [],
  locations: [],
};

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<InstructorForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InstructorForm>({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchInstructors = useCallback(async () => {
    try {
      const url = showInactive
        ? "/api/instructors"
        : "/api/instructors?active=true";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInstructors(data);
    } catch {
      setError("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    setLoading(true);
    fetchInstructors();
  }, [fetchInstructors]);

  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      setError("Name and email are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          email: addForm.email.trim(),
          phone: addForm.phone.trim() || null,
          certifications: addForm.certifications,
          locations: addForm.locations,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }
      setAddForm({ ...emptyForm });
      setShowAddForm(false);
      await fetchInstructors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create instructor");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingId(instructor.id);
    setEditForm({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone || "",
      certifications: [...instructor.certifications],
      locations: [...instructor.locations],
    });
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Name and email are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/instructors/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || null,
          certifications: editForm.certifications,
          locations: editForm.locations,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setEditingId(null);
      await fetchInstructors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update instructor");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/instructors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to deactivate");
      }
      await fetchInstructors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate instructor");
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/instructors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reactivate");
      }
      await fetchInstructors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reactivate instructor");
    } finally {
      setSaving(false);
    }
  };

  const toggleCertification = (
    form: InstructorForm,
    setForm: (f: InstructorForm) => void,
    cert: string
  ) => {
    const certs = form.certifications.includes(cert)
      ? form.certifications.filter((c) => c !== cert)
      : [...form.certifications, cert];
    setForm({ ...form, certifications: certs });
  };

  const toggleLocation = (
    form: InstructorForm,
    setForm: (f: InstructorForm) => void,
    loc: string
  ) => {
    const locs = form.locations.includes(loc)
      ? form.locations.filter((l) => l !== loc)
      : [...form.locations, loc];
    setForm({ ...form, locations: locs });
  };

  const CertLocationCheckboxes = ({
    form,
    setForm,
  }: {
    form: InstructorForm;
    setForm: (f: InstructorForm) => void;
  }) => (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-1.5">Certifications</p>
        <div className="flex flex-wrap gap-2">
          {COURSE_TYPES.map((ct) => (
            <label
              key={ct}
              className="flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.certifications.includes(ct)}
                onChange={() => toggleCertification(form, setForm, ct)}
                className="rounded border-gray-300"
              />
              {COURSE_TYPE_LABELS[ct] || ct}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-1.5">Locations</p>
        <div className="flex flex-wrap gap-4">
          {LOCATIONS.map((loc) => (
            <label
              key={loc}
              className="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.locations.includes(loc)}
                onChange={() => toggleLocation(form, setForm, loc)}
                className="rounded border-gray-300"
              />
              {LOCATION_LABELS[loc] || loc}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Instructors</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show inactive
          </label>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Instructor Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add New Instructor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm({ ...addForm, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm({ ...addForm, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <CertLocationCheckboxes form={addForm} setForm={setAddForm} />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saving}>
                {saving ? "Saving..." : "Save Instructor"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm({ ...emptyForm });
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructors Table */}
      {loading ? (
        <div className="text-sm text-muted-foreground">
          Loading instructors...
        </div>
      ) : instructors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No instructors found.</p>
          <p className="text-sm mt-1">
            Click &quot;Add Instructor&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) =>
                editingId === instructor.id ? (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell colSpan={3}>
                      <CertLocationCheckboxes
                        form={editForm}
                        setForm={setEditForm}
                      />
                    </TableCell>
                    <TableCell />
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={saving}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setError(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow
                    key={instructor.id}
                    className={!instructor.active ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      {instructor.name}
                    </TableCell>
                    <TableCell>{instructor.email}</TableCell>
                    <TableCell>{instructor.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {instructor.certifications.map((cert) => (
                          <Badge
                            key={cert}
                            variant="secondary"
                            className="text-xs"
                          >
                            {COURSE_TYPE_LABELS[cert] || cert}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {instructor.locations.map((loc) => (
                          <Badge key={loc} variant="outline" className="text-xs">
                            {LOCATION_LABELS[loc] || loc}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={instructor.active ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {instructor.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{instructor.assignments.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(instructor)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {instructor.active ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeactivate(instructor.id)}
                            disabled={saving}
                            title="Deactivate"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReactivate(instructor.id)}
                            disabled={saving}
                            title="Reactivate"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
