"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Plus } from "lucide-react";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import { cn } from "lib/utils";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";

type Msg = {
  id: string;
  author: "customer" | "support";
  body: string;
  authorLabel?: string;
  createdAt: string;
};

type ConversationListItem = {
  id: string;
  subject: string | null;
  status: string;
  lastActivityAt: string;
  messageCount: number;
  lastPreview: string | null;
};

type FullConv = {
  id: string;
  subject: string | null;
  status: string;
  lastActivityAt: string;
  messages: Msg[];
};

async function errorTextFromResponse(res: Response, fallback: string): Promise<string> {
  const raw = (await res.json().catch(() => ({}))) as { error?: unknown };
  return typeof raw.error === "string" && raw.error.trim() ? raw.error : fallback;
}

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

const COMPOSE_SUBJECT_MAX = 300;
const COMPOSE_BODY_MAX = 8000;

export default function AccountSupportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillFromQueryApplied = useRef(false);
  const [list, setList] = useState<ConversationListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<FullConv | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [newDrawerOpen, setNewDrawerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const convPag = useAdminTablePagination(list, [list.length]);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/account/support/conversations", { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401) setError("Please sign in to use support.");
      else setError(await errorTextFromResponse(res, "Could not load conversations."));
      return;
    }
    const data = (await res.json()) as { conversations: ConversationListItem[] };
    setList(data.conversations || []);
    setError(null);
  }, []);

  const loadThread = useCallback(async (id: string) => {
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/account/support/conversations/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setError("Could not load this conversation.");
        setThread(null);
        return;
      }
      const data = (await res.json()) as { conversation: FullConv };
      setThread(data.conversation);
      setError(null);
    } finally {
      setLoadingThread(false);
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
    if (prefillFromQueryApplied.current) return;
    const subjectRaw = searchParams.get("subject");
    const bodyRaw = searchParams.get("body") ?? searchParams.get("message");
    if (!subjectRaw && !bodyRaw) return;
    prefillFromQueryApplied.current = true;
    if (subjectRaw) {
      setComposeSubject(subjectRaw.slice(0, COMPOSE_SUBJECT_MAX));
    }
    if (bodyRaw) {
      setComposeBody(bodyRaw.slice(0, COMPOSE_BODY_MAX));
    }
    setNewDrawerOpen(true);
    setSelectedId(null);
    setThread(null);
    router.replace("/account/support", { scroll: false });
  }, [searchParams, router]);

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

  async function createConversation(e: React.FormEvent) {
    e.preventDefault();
    const initialMessage = composeBody.trim();
    if (!initialMessage) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/account/support/conversations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: composeSubject.trim() || undefined,
          initialMessage,
        }),
      });
      const raw = (await res.json().catch(() => ({}))) as { conversation?: FullConv; error?: string };
      if (!res.ok) {
        setError(raw.error?.trim() || "Could not start the conversation.");
        return;
      }
      const data = raw as { conversation: FullConv };
      setComposeSubject("");
      setComposeBody("");
      setNewDrawerOpen(false);
      setSelectedId(data.conversation.id);
      setThread(data.conversation);
      await refreshList();
    } finally {
      setSending(false);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !replyBody.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/support/conversations/${selectedId}/messages`, {
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

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="w-full min-w-0 space-y-4">
      <AdminRightDrawer
        open={newDrawerOpen}
        onOpenChange={setNewDrawerOpen}
        title="New conversation"
        description="Ask our support team a question. Open the conversation from the list to read the full thread."
      >
        <form onSubmit={createConversation} className="flex flex-col gap-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Subject (optional)</span>
            <input
              className={inputClass}
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              maxLength={300}
              placeholder="e.g. Order delivery question"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Message</span>
            <textarea
              className={cn(inputClass, "min-h-[140px] resize-y")}
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              required
              placeholder="Describe your question…"
            />
          </label>
          <button
            type="submit"
            disabled={sending || !composeBody.trim()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Start conversation"}
          </button>
        </form>
      </AdminRightDrawer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <aside className="w-full min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setNewDrawerOpen(true);
                setSelectedId(null);
                setThread(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New conversation
            </button>
            <Link
              href="/account"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              Back
            </Link>
          </div>
          <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
              <MessageCircle className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900">Conversations</h2>
              <span className="text-xs text-zinc-500">{convPag.totalCount} total</span>
            </div>
            <div className="max-h-[min(420px,50vh)] overflow-y-auto">
              {loadingList ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-500">Loading…</p>
              ) : list.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-600">No conversations yet.</p>
              ) : (
                <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-[1] border-b border-zinc-100 bg-zinc-50/95 backdrop-blur-sm">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-2.5" scope="col">
                        Subject
                      </th>
                      <th className="hidden sm:table-cell px-4 py-2.5" scope="col">
                        Updated
                      </th>
                      <th className="px-4 py-2.5 text-right" scope="col">
                        #
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {convPag.pageItems.map((c) => (
                      <tr
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setNewDrawerOpen(false);
                          setSelectedId(c.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setNewDrawerOpen(false);
                            setSelectedId(c.id);
                          }
                        }}
                        className={cn(
                          "cursor-pointer border-b border-zinc-50 transition-colors hover:bg-zinc-50/80",
                          selectedId === c.id && "bg-emerald-50/90"
                        )}
                      >
                        <td className="max-w-[200px] px-4 py-3">
                          <p className="truncate font-medium text-zinc-900">
                            {c.subject || "Support conversation"}
                          </p>
                          <p className="mt-0.5 text-[11px] capitalize text-zinc-400">{c.status}</p>
                          {c.lastPreview ? (
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-500 sm:hidden">
                              {c.lastPreview}
                            </p>
                          ) : null}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-zinc-500 sm:table-cell">
                          {formatTime(c.lastActivityAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs tabular-nums text-zinc-600">
                          {c.messageCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!loadingList && convPag.totalCount > 0 ? (
              <AdminTablePagination
                totalCount={convPag.totalCount}
                page={convPag.page}
                totalPages={convPag.totalPages}
                pageSize={convPag.pageSize}
                rangeFrom={convPag.rangeFrom}
                rangeTo={convPag.rangeTo}
                onPageChange={convPag.setPage}
                onPageSizeChange={convPag.setPageSize}
              />
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-[420px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {error ? (
          <p className="border-b border-zinc-100 p-4 text-sm text-red-600">{error}</p>
        ) : null}

        {selectedId && loadingThread ? (
          <div className="p-8 text-center text-gray-500 text-sm flex-1 flex items-center justify-center">
            Loading conversation…
          </div>
        ) : selectedId && thread ? (
          <>
            <div className="p-4 border-b flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {thread.subject || "Support conversation"}
                </h2>
                <p className="text-xs text-gray-500 capitalize">{thread.status}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[min(60vh,480px)]">
              {thread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.author === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      m.author === "customer"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    {m.author === "support" && m.authorLabel ? (
                      <p className="text-[11px] font-semibold opacity-80 mb-0.5">{m.authorLabel}</p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        m.author === "customer" ? "text-emerald-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            {thread.status === "closed" ? (
              <p className="px-4 text-sm text-amber-800 bg-amber-50 border-t py-2">
                This conversation is closed. Send a message to reopen it.
              </p>
            ) : null}
            <form onSubmit={sendReply} className="p-4 border-t flex flex-col gap-2">
              <label className="sr-only" htmlFor="reply">
                Your message
              </label>
              <textarea
                id="reply"
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[88px]"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your message…"
              />
              <button
                type="submit"
                disabled={sending || !replyBody.trim()}
                className="self-end rounded-lg bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </form>
          </>
        ) : selectedId ? (
          <div className="p-8 text-center text-gray-600 text-sm flex-1 flex items-center justify-center">
            Could not load this conversation.
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-zinc-600">
            {newDrawerOpen ? (
              <p>Use the panel on the right to send your first message.</p>
            ) : (
              <p>Select a conversation from the list or start a new one.</p>
            )}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
