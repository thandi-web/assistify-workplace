import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  ClipboardList,
  ListChecks,
  BookOpen,
  MessageSquare,
  LogOut,
  Sparkles,
  Menu,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  to: "/" | "/email" | "/meetings" | "/planner" | "/research" | "/chat";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Notes", icon: ClipboardList },
  { to: "/planner", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research", icon: BookOpen },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const SidebarInner = (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5 border-b">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight text-gradient-brand">Workly</div>
          <div className="text-xs text-muted-foreground">AI productivity</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                active
                  ? "bg-gradient-brand text-white font-medium shadow-glow"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 space-y-2">
        <div className="px-2 py-1 text-xs text-muted-foreground truncate" title={email}>
          {email || "Signed in"}
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-gradient-soft">
      <aside className="hidden md:block sticky top-0 h-screen">{SidebarInner}</aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 h-full">{SidebarInner}</div>
        </div>
      )}
      <div className="flex flex-1 min-w-0 flex-col">
        <header className="md:hidden flex items-center justify-between border-b bg-background px-4 py-3">
          <button
            className="inline-flex items-center justify-center rounded-md border p-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-gradient-brand">Workly</span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 min-w-0">{children}</main>
        <footer className="border-t bg-background px-6 py-3 text-xs text-muted-foreground">
          AI outputs may be inaccurate or biased. Review before sending, sharing, or acting on
          generated content. Do not include confidential or regulated data unless permitted by your
          organization.
        </footer>
      </div>
    </div>
  );
}