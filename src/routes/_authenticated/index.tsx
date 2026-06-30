import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ClipboardList, ListChecks, BookOpen, MessageSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

const TOOLS = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft polished emails in seconds from a few prompts." },
  { to: "/meetings", icon: ClipboardList, title: "Meeting Notes Summarizer", desc: "Turn raw notes into decisions, action items, and follow-ups." },
  { to: "/planner", icon: ListChecks, title: "AI Task Planner", desc: "Break goals into prioritized, time-bounded plans." },
  { to: "/research", icon: BookOpen, title: "AI Research Assistant", desc: "Get structured briefings on any topic." },
  { to: "/chat", icon: MessageSquare, title: "AI Chatbot", desc: "Ask anything — threaded conversations saved in this browser." },
] as const;

function Dashboard() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Workly</h1>
        <p className="text-muted-foreground mt-2">Automate the busywork. Pick a tool to get started.</p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <CardTitle className="mt-3 text-base">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Responsible AI:</strong> Workly uses AI models that can make mistakes. Always review generated content before sending, sharing, or acting on it. Avoid entering confidential or regulated data unless permitted by your organization.
      </div>
    </div>
  );
}