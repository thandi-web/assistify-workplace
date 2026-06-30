import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
};

const INDEX_KEY = "workly.chat.index";
const THREAD_KEY = (id: string) => `workly.chat.thread.${id}`;

type IndexEntry = { id: string; title: string; createdAt: number; updatedAt: number };

function readIndex(): IndexEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as IndexEntry[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(list: IndexEntry[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export function loadThreads(): ChatThread[] {
  return readIndex()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((e) => ({ ...e, messages: [] }));
}

export function loadThread(id: string): ChatThread | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THREAD_KEY(id));
    return raw ? (JSON.parse(raw) as ChatThread) : null;
  } catch {
    return null;
  }
}

export function createThread(): ChatThread {
  const id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string;
  const now = Date.now();
  const thread: ChatThread = {
    id,
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  localStorage.setItem(THREAD_KEY(id), JSON.stringify(thread));
  const idx = readIndex();
  idx.unshift({ id, title: thread.title, createdAt: now, updatedAt: now });
  writeIndex(idx);
  return thread;
}

export function saveThreadMessages(id: string, messages: UIMessage[]) {
  const existing = loadThread(id);
  if (!existing) return;
  const updated: ChatThread = { ...existing, messages, updatedAt: Date.now() };
  localStorage.setItem(THREAD_KEY(id), JSON.stringify(updated));
  const idx = readIndex();
  const i = idx.findIndex((e) => e.id === id);
  if (i >= 0) {
    idx[i] = { ...idx[i], updatedAt: updated.updatedAt };
    writeIndex(idx);
  }
}

export function renameThreadFromFirstMessage(id: string, text: string) {
  const existing = loadThread(id);
  if (!existing) return;
  if (existing.title && existing.title !== "New chat") return;
  const title = text.replace(/\s+/g, " ").trim().slice(0, 60) || "New chat";
  const updated = { ...existing, title };
  localStorage.setItem(THREAD_KEY(id), JSON.stringify(updated));
  const idx = readIndex();
  const i = idx.findIndex((e) => e.id === id);
  if (i >= 0) {
    idx[i] = { ...idx[i], title };
    writeIndex(idx);
  }
}

export function deleteThread(id: string) {
  localStorage.removeItem(THREAD_KEY(id));
  writeIndex(readIndex().filter((e) => e.id !== id));
}