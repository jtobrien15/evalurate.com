"use client";

import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (classId) formData.append("classId", classId);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Import from SGA</h1>

      <div className="max-w-xl">
        <div className="rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-2">Supported Formats</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Export your roster from SGA Software and upload it here. Supported
            formats: <strong>CSV</strong>, <strong>Excel (.xlsx/.xls)</strong>,
            and <strong>PDF</strong>. The file should include these columns:
          </p>
          <div className="rounded-md bg-muted p-3 text-xs font-mono">
            First Name, Last Name, Email, Phone, DOB, Parent Name, Parent
            Email, SGA Registration ID
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Note:</strong> PDF import is best-effort. PDFs with
            non-standard layouts may produce incomplete data and require manual
            review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Class ID (optional)
            </label>
            <input
              type="text"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Paste class ID to auto-enroll students"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If provided, imported students will be enrolled in this class.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Roster File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import Students"}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-6 rounded-lg border p-4">
            <p className="font-medium text-green-700">
              Successfully imported {result.imported} student
              {result.imported !== 1 ? "s" : ""}.
            </p>
            {result.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-700 mb-1">
                  Errors ({result.errors.length}):
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>Row {i + 1}: {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
