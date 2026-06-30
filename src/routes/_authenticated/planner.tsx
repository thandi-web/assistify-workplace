import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/_authenticated/planner")({
  component: () => (
    <ToolPage
      tool="planner"
      title="AI Task Planner"
      description="Turn a goal into a prioritized, time-bounded plan."
      defaultTitleFromField="goal"
      fields={[
        { name: "goal", label: "Goal", type: "textarea", rows: 3, placeholder: "What outcome do you want to achieve?", required: true },
        { name: "deadline", label: "Deadline", placeholder: "e.g. End of Q3" },
        { name: "constraints", label: "Constraints / context", type: "textarea", rows: 3, placeholder: "Team size, budget, dependencies…" },
      ]}
    />
  ),
});