import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/meetings")({
  component: () => (
    <ToolPage
      tool="meeting"
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript to extract decisions and actions."
      defaultTitleFromField="notes"
      fields={[
        { name: "notes", label: "Meeting notes / transcript", type: "textarea", rows: 12, placeholder: "Paste the meeting notes or transcript here…", required: true },
      ]}
    />
  ),
});