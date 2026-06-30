import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import {
  loadThread,
  saveThreadMessages,
  renameThreadFromFirstMessage,
} from "@/lib/chat-storage";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThreadPage,
});

function messageText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function ChatThreadPage() {
  const { threadId } = useParams({ from: "/_authenticated/chat/$threadId" });
  const initial = loadThread(threadId)?.messages ?? [];
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // When thread changes, reload its messages
  useEffect(() => {
    const t = loadThread(threadId);
    setMessages(t?.messages ?? []);
  }, [threadId, setMessages]);

  // Persist messages on every change (when not actively streaming)
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    saveThreadMessages(threadId, messages);
    const firstUser = messages.find((m) => m.role === "user");
    if (firstUser) renameThreadFromFirstMessage(threadId, messageText(firstUser));
  }, [messages, status, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const onSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b bg-background px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">AI Chat</h1>
        <p className="text-xs text-muted-foreground">
          Threaded conversations saved in this browser.
        </p>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-primary mb-2" />
              <h2 className="font-medium">Ask Workly anything</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Draft messages, brainstorm, get quick answers.
              </p>
            </div>
          )}
          {messages.map((m) => {
            const text = messageText(m);
            const isUser = m.role === "user";
            return (
              <div key={m.id} className="flex gap-3">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                    isUser ? "bg-muted" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {isUser ? "You" : "Workly"}
                  </div>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                    {text || (status === "streaming" && !isUser ? "…" : "")}
                  </div>
                </div>
              </div>
            );
          })}
          {status === "submitted" && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="text-sm text-muted-foreground pt-1">Thinking…</div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={onSend} className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            className="resize-none"
          />
          <Button
            type="submit"
            disabled={!input.trim() || status === "streaming" || status === "submitted"}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mx-auto max-w-3xl mt-2 text-[11px] text-muted-foreground text-center">
          AI can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}