import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ClipboardList, ListChecks, BookOpen, MessageSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

const TOOLS = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft polished emails in seconds from a few prompts.", tone: "tool-email" },
  { to: "/meetings", icon: ClipboardList, title: "Meeting Notes Summarizer", desc: "Turn raw notes into decisions, action items, and follow-ups.", tone: "tool-meeting" },
  { to: "/planner", icon: ListChecks, title: "AI Task Planner", desc: "Break goals into prioritized, time-bounded plans.", tone: "tool-planner" },
  { to: "/research", icon: BookOpen, title: "AI Research Assistant", desc: "Get structured briefings on any topic.", tone: "tool-research" },
  { to: "/chat", icon: MessageSquare, title: "AI Chatbot", desc: "Ask anything — threaded conversations saved in this browser.", tone: "tool-chat" },
] as const;

function Dashboard() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <header className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-brand p-8 lg:p-10 text-white shadow-elegant">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Powered by Lovable AI
          </span>
          <h1 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight">Welcome to Workly</h1>
          <p className="mt-3 max-w-xl text-white/85">
            Your AI workplace co‑pilot. Draft, summarize, plan, and research — pick a tool below to get started.
          </p>
        </div>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="h-full relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-elegant hover:border-primary/40">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `var(--color-${t.tone})` }}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl shadow-sm"
                    style={{
                      background: `color-mix(in oklab, var(--color-${t.tone}) 15%, transparent)`,
                      color: `var(--color-${t.tone})`,
                    }}
                  >
                    <t.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <CardTitle className="mt-4 text-base">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-accent bg-accent/40 p-4 text-sm text-accent-foreground/90">
        <strong className="text-foreground">Responsible AI:</strong> Workly uses AI models that can make mistakes. Always review generated content before sending, sharing, or acting on it. Avoid entering confidential or regulated data unless permitted by your organization.
      </div>
    </div>
  );
}