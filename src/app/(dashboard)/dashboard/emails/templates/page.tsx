"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TEMPLATE_VARIABLES } from "@/lib/email-template-defaults";
import { Save, Eye, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface EmailTemplate {
  id: string | null;
  templateId: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
  updatedAt: string | null;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/email-templates");
      const data = await res.json();
      setTemplates(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load templates" });
    } finally {
      setLoading(false);
    }
  }

  async function seedTemplates() {
    setSeeding(true);
    try {
      const res = await fetch("/api/email-templates/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Seeded ${data.created} templates (${data.skipped} already existed)`,
        });
        await fetchTemplates();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to seed templates" });
    } finally {
      setSeeding(false);
    }
  }

  function handleExpand(template: EmailTemplate) {
    if (expandedId === template.templateId) {
      setExpandedId(null);
      setPreviewHtml(null);
      return;
    }
    setExpandedId(template.templateId);
    setEditSubject(template.subject);
    setEditBody(template.body);
    setPreviewHtml(null);
    setMessage(null);
  }

  async function handleSave(templateId: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/email-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Template saved successfully" });
        await fetchTemplates();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save template" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview(templateId: string) {
    try {
      const res = await fetch("/api/email-templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          subject: editSubject,
          body: editBody,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewHtml(data.html);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to generate preview" });
    }
  }

  function handleReset(template: EmailTemplate) {
    setEditSubject(template.subject);
    setEditBody(template.body);
    setPreviewHtml(null);
    setMessage(null);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Email Templates</h1>
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  const hasNoSavedTemplates = templates.every((t) => t.id === null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize email content sent to students. Use {"{{variableName}}"}{" "}
            for dynamic values.
          </p>
        </div>
        {hasNoSavedTemplates && (
          <Button onClick={seedTemplates} disabled={seeding}>
            {seeding ? "Seeding..." : "Initialize Default Templates"}
          </Button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {templates.map((template) => {
          const isExpanded = expandedId === template.templateId;
          const variables = TEMPLATE_VARIABLES[template.templateId] ?? [];

          return (
            <Card key={template.templateId}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => handleExpand(template)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{template.templateId}</Badge>
                    <CardTitle className="text-base">
                      {template.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    {template.updatedAt && (
                      <span className="text-xs text-muted-foreground">
                        Updated{" "}
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                    <Badge
                      variant={template.active ? "default" : "secondary"}
                    >
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                {!isExpanded && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    Subject: {template.subject}
                  </p>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 border-t pt-4">
                  {/* Available Variables */}
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Available Variables
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {variables.map((v) => (
                        <Badge
                          key={v}
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Subject Editor */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Subject Line
                    </label>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Body Editor */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Email Body
                    </label>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={18}
                      className="font-mono text-sm leading-relaxed"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleSave(template.templateId)}
                      disabled={saving}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template.templateId)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReset(template)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1.5" />
                      Reset
                    </Button>
                  </div>

                  {/* Preview */}
                  {previewHtml && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Preview</p>
                      <div className="border rounded-md overflow-hidden">
                        <iframe
                          srcDoc={previewHtml}
                          className="w-full h-[500px]"
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
