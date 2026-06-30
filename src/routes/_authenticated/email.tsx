import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/email")({
  component: () => (
    <ToolPage
      tool="email"
      title="Smart Email Generator"
      description="Draft professional emails from a short brief."
      defaultTitleFromField="purpose"
      fields={[
        { name: "recipient", label: "Recipient", placeholder: "e.g. Sarah, the marketing team" },
        { name: "tone", label: "Tone", placeholder: "Professional, friendly, direct…" },
        { name: "purpose", label: "Purpose / key points", type: "textarea", rows: 4, placeholder: "What should this email accomplish?", required: true },
        { name: "context", label: "Additional context", type: "textarea", rows: 3, placeholder: "Background, prior conversations, deadlines…" },
      ]}
    />
  ),
});