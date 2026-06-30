import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadThreads,
  createThread,
  deleteThread,
  type ChatThread,
} from "@/lib/chat-storage";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const [threads, setThreads] = useState<ChatThread[]>([]);

  const refresh = () => setThreads(loadThreads());

  useEffect(() => {
    const list = loadThreads();
    setThreads(list);
    if (!params.threadId) {
      if (list[0]) {
        navigate({ to: "/chat/$threadId", params: { threadId: list[0].id }, replace: true });
      } else {
        const t = createThread();
        setThreads(loadThreads());
        navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
      }
    }
  }, [params.threadId, navigate]);

  const onNew = () => {
    const t = createThread();
    refresh();
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const onDelete = (id: string) => {
    deleteThread(id);
    const list = loadThreads();
    setThreads(list);
    if (params.threadId === id) {
      if (list[0]) navigate({ to: "/chat/$threadId", params: { threadId: list[0].id }, replace: true });
      else {
        const t = createThread();
        setThreads(loadThreads());
        navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-3 border-b">
          <Button size="sm" className="w-full" onClick={onNew}>
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground">No conversations yet.</p>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer",
                params.threadId === t.id ? "bg-accent" : "hover:bg-accent/50",
              )}
              onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: t.id } })}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{t.title || "New chat"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                aria-label="Delete thread"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}