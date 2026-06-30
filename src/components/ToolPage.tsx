import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  generateToolOutput,
  saveOutput,
  listOutputs,
  deleteOutput,
} from "@/lib/ai-tools.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, Sparkles, Copy, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

type ToolKey = "email" | "meeting" | "planner" | "research";

export type FieldDef = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "input" | "textarea";
  rows?: number;
  required?: boolean;
};

export function ToolPage({
  tool,
  title,
  description,
  fields,
  defaultTitleFromField,
}: {
  tool: ToolKey;
  title: string;
  description: string;
  fields: FieldDef[];
  defaultTitleFromField: string;
}) {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [savedId, setSavedId] = useState<string | undefined>();

  const generate = useServerFn(generateToolOutput);
  const save = useServerFn(saveOutput);
  const del = useServerFn(deleteOutput);
  const list = useServerFn(listOutputs);

  const history = useQuery({
    queryKey: ["outputs", tool],
    queryFn: () => list({ data: { tool } }),
  });

  const genMut = useMutation({
    mutationFn: () => generate({ data: { tool, fields: values } }),
    onSuccess: (r) => {
      setOutput(r.content);
      setSavedId(undefined);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const saveMut = useMutation({
    mutationFn: () =>
      save({
        data: {
          tool,
          title: (values[defaultTitleFromField] || "Untitled").slice(0, 120),
          prompt: values,
          content: output,
          id: savedId,
        },
      }),
    onSuccess: (row) => {
      setSavedId(row.id);
      qc.invalidateQueries({ queryKey: ["outputs", tool] });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outputs", tool] });
      toast.success("Deleted");
    },
  });

  const loadEntry = (e: { id: string; content: string; prompt: unknown }) => {
    setOutput(e.content);
    setSavedId(e.id);
    if (e.prompt && typeof e.prompt === "object") {
      setValues(e.prompt as Record<string, string>);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inputs</CardTitle>
              <CardDescription>Fill in the structured prompt below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <Label htmlFor={f.name}>
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      id={f.name}
                      rows={f.rows ?? 4}
                      placeholder={f.placeholder}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={f.name}
                      placeholder={f.placeholder}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <Button
                onClick={() => genMut.mutate()}
                disabled={
                  genMut.isPending ||
                  fields.some((f) => f.required && !(values[f.name] ?? "").trim())
                }
              >
                {genMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Output</CardTitle>
                <CardDescription>Editable — refine before using.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!output}
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button
                  size="sm"
                  disabled={!output || saveMut.isPending}
                  onClick={() => saveMut.mutate()}
                >
                  {saveMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {savedId ? "Update" : "Save"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={18}
                value={output}
                placeholder="Your AI-generated output will appear here. You can edit it freely."
                onChange={(e) => setOutput(e.target.value)}
                className="font-mono text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Saved</h2>
            <span className="text-xs text-muted-foreground">{history.data?.length ?? 0}</span>
          </div>
          <div className="space-y-2">
            {history.data?.length === 0 && (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                <FileText className="mx-auto h-5 w-5 mb-2 opacity-60" />
                Nothing saved yet.
              </div>
            )}
            {history.data?.map((row) => (
              <div
                key={row.id}
                className={`group rounded-md border bg-card p-3 transition-colors ${
                  savedId === row.id ? "ring-1 ring-primary" : "hover:bg-accent/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => loadEntry(row)}
                  className="block w-full text-left"
                >
                  <div className="text-sm font-medium truncate">{row.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(row.updated_at).toLocaleString()}
                  </div>
                </button>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => delMut.mutate(row.id)}
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}