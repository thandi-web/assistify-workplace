import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/research")({
  component: () => (
    <ToolPage
      tool="research"
      title="AI Research Assistant"
      description="Get a structured briefing on any topic."
      defaultTitleFromField="topic"
      fields={[
        { name: "topic", label: "Topic", placeholder: "What do you want to learn about?", required: true },
        { name: "audience", label: "Audience", placeholder: "e.g. exec summary, technical team" },
        { name: "depth", label: "Depth", placeholder: "Concise overview / deep dive" },
        { name: "questions", label: "Specific questions", type: "textarea", rows: 4, placeholder: "Anything specific you want answered?" },
      ]}
    />
  ),
});