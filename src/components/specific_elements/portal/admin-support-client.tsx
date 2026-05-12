"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  author: "customer" | "support";
  body: string;
  authorLabel?: string;
  createdAt: string;
};

type ConversationRow = {
  id: string;
  subject: string | null;
  status: string;
  lastActivityAt: string;
  messageCount: number;
  lastPreview: string | null;
  userEmail: string;
  strapiUserId: number;
  needsReply: boolean;
};

type FullConv = {
  id: string;
  subject: string | null;
  status: string;
  lastActivityAt: string;
  messages: Msg[];
  userEmail: string;
  strapiUserId: number;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminSupportClient() {
  const [list, setList] = useState<ConversationRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<FullConv | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [patching, setPatching] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/admin/support/conversations", { credentials: "include" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error || "Could not load inbox.");
      return;
    }
    const data = (await res.json()) as { conversations: ConversationRow[] };
    setList(data.conversations || []);
    setError(null);
  }, []);

  const loadThread = useCallback(async (id: string) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/admin/support/conversations/${id}`, { credentials: "include" });
      if (!res.ok) {
        setThread(null);
        return;
      }
      const data = (await res.json()) as { conversation: FullConv };
      setThread(data.conversation);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingList(true);
      await refreshList();
      setLoadingList(false);
    })();
  }, [refreshList]);

  useEffect(() => {
    if (!selectedId) {
      setThread(null);
      return;
    }
    setThread(null);
    void loadThread(selectedId);
  }, [selectedId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/conversations/${selectedId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim() }),
      });
      const raw = (await res.json().catch(() => ({}))) as { conversation?: FullConv; error?: string };
      if (!res.ok) {
        setError(raw.error?.trim() || "Message could not be sent.");
        return;
      }
      const data = raw as { conversation: FullConv };
      setReplyBody("");
      setThread(data.conversation);
      await refreshList();
    } finally {
      setSending(false);
    }
  }

  async function setStatus(next: "open" | "closed") {
    if (!selectedId) return;
    setPatching(true);
    try {
      const res = await fetch(`/api/admin/support/conversations/${selectedId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { conversation: FullConv };
      setThread(data.conversation);
      await refreshList();
    } finally {
      setPatching(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Support inbox</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Reply to customers — open a ticket to load messages; the inbox list updates when you send a reply
          or change status.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-4 min-h-[520px]">
        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Conversations
            </p>
          </div>
          <div className="overflow-y-auto max-h-[min(70vh,560px)]">
            {loadingList ? (
              <p className="p-4 text-sm text-zinc-500">Loading…</p>
            ) : list.length === 0 ? (
              <p className="p-4 text-sm text-zinc-600">No messages yet.</p>
            ) : (
              list.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-100/90 hover:bg-emerald-50/50 transition-colors ${
                    selectedId === c.id ? "bg-emerald-50/80" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-zinc-900 truncate">
                      {c.subject || "Support"}
                    </p>
                    {c.needsReply ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5" title={c.userEmail}>
                    {c.userEmail}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">{formatTime(c.lastActivityAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm flex flex-col min-h-[480px]">
          {selectedId && threadLoading ? (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-zinc-500">
              Loading conversation…
            </div>
          ) : selectedId && thread ? (
            <>
              <div className="px-5 py-4 border-b border-zinc-100 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {thread.subject || "Support conversation"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{thread.userEmail}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">User ID: {thread.strapiUserId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={patching || thread.status === "closed"}
                    onClick={() => setStatus("closed")}
                    className="text-xs font-semibold rounded-lg border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={patching || thread.status === "open"}
                    onClick={() => setStatus("open")}
                    className="text-xs font-semibold rounded-lg border border-emerald-200 text-emerald-800 px-3 py-1.5 hover:bg-emerald-50 disabled:opacity-40"
                  >
                    Reopen
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 max-h-[min(50vh,420px)]">
                {thread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.author === "support" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.author === "support"
                          ? "bg-emerald-600 text-white rounded-br-md"
                          : "bg-zinc-100 text-zinc-900 rounded-bl-md"
                      }`}
                    >
                      {m.author === "support" && m.authorLabel ? (
                        <p className="text-[11px] font-semibold opacity-90 mb-0.5">{m.authorLabel}</p>
                      ) : null}
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.author === "support" ? "text-emerald-100" : "text-zinc-500"
                        }`}
                      >
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendReply} className="p-4 border-t border-zinc-100 space-y-2">
                <textarea
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm min-h-[96px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply…"
                />
                <button
                  type="submit"
                  disabled={sending || !replyBody.trim()}
                  className="rounded-xl bg-zinc-900 text-white text-sm font-semibold px-4 py-2 hover:bg-zinc-800 disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send reply"}
                </button>
              </form>
            </>
          ) : selectedId ? (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-zinc-500">
              Could not load this conversation.
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-zinc-500">
              Select a conversation from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
