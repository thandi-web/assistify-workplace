import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: () => (
    <div className="grid h-full place-items-center p-8 text-center text-muted-foreground">
      <p>Loading conversation…</p>
    </div>
  ),
});