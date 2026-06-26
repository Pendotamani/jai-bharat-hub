import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { Layout } from "../components/Layout";
import { Sparkles, Send, Loader2, Menu, Trash2, History, X, Plus } from "lucide-react";
import { chatWithJaiAi } from "../lib/jai-ai.functions";

export const Route = createFileRoute("/jai-ai")({
  head: () => ({
    meta: [
      { title: "Jai.AI — Jai Bharat Junior College" },
      { name: "description", content: "Ask Jai.AI — the college AI assistant." },
      { property: "og:title", content: "Jai.AI Assistant" },
      { property: "og:description", content: "Modern AI chat assistant for Jai Bharat Junior College." },
    ],
  }),
  component: JaiAI,
});

// ─── Types ───────────────────────────────────────────────────────────────────

type Msg = {
  role: "user" | "assistant";
  text: string;
  ts: number; // timestamp ms
};

type SavedChat = {
  id: string;
  title: string;
  messages: Msg[];
  savedAt: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_CURRENT = "jai-ai-current-chat";
const STORAGE_HISTORY  = "jai-ai-history";

const WELCOME: Msg = {
  role: "assistant",
  text: "Hi! I'm jai.ai 👋 — your college assistant. Ask me anything about studies, exams, or campus life.",
  ts: Date.now(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ts: number) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function chatTitle(messages: Msg[]) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  return first.text.length > 40 ? first.text.slice(0, 40) + "…" : first.text;
}

function loadHistory(): SavedChat[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(chats: SavedChat[]) {
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(chats));
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-end gap-2 max-w-[85%]">
        <div className="h-7 w-7 rounded-full bg-indigo-600 text-white grid place-items-center flex-shrink-0 mb-1">
          <Sparkles size={14} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex gap-1 items-center h-4">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "160ms" }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "320ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="h-7 w-7 rounded-full bg-indigo-600 text-white grid place-items-center flex-shrink-0 mb-1">
            <Sparkles size={14} />
          </div>
        )}
        <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
              isUser
                ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm"
            }`}
          >
            {msg.text}
          </div>
          <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.ts)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── History Panel ───────────────────────────────────────────────────────────

function HistoryPanel({
  history,
  onOpen,
  onDelete,
  onClose,
}: {
  history: SavedChat[];
  onOpen: (chat: SavedChat) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="relative ml-auto w-[80vw] max-w-xs h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800 flex items-center gap-2">
            <History size={16} className="text-indigo-600" /> Chat History
          </span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <History size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No previous chats yet.</p>
              <p className="text-xs text-gray-300 mt-1">Start a conversation to see it here.</p>
            </div>
          ) : (
            [...history]
              .reverse()
              .map((chat) => (
                <div key={chat.id} className="relative group">
                  {confirmId === chat.id ? (
                    /* ── Confirm delete row ── */
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50">
                      <p className="text-xs text-red-600 flex-1">Delete this chat?</p>
                      <button
                        onClick={() => {
                          onDelete(chat.id);
                          setConfirmId(null);
                        }}
                        className="text-xs font-semibold text-white bg-red-500 rounded-lg px-3 py-1.5 hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs font-medium text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5 hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* ── Normal chat row ── */
                    <div className="flex items-center gap-1 px-3 py-3 hover:bg-indigo-50 transition-colors">
                      {/* Open chat button */}
                      <button
                        onClick={() => { onOpen(chat); onClose(); }}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate pr-1">{chat.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(chat.savedAt)}</p>
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmId(chat.id); }}
                        className="flex-shrink-0 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Delete chat"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────

function HamburgerMenu({
  onNewChat,
  onShowHistory,
  onClearChat,
  onClose,
}: {
  onNewChat: () => void;
  onShowHistory: () => void;
  onClearChat: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
        <button
          onClick={() => { onNewChat(); onClose(); }}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
        >
          <Plus size={16} className="text-indigo-600" />
          New Chat
        </button>
        <button
          onClick={() => { onShowHistory(); onClose(); }}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
        >
          <History size={16} className="text-indigo-600" />
          Chat History
        </button>
        <div className="my-1 border-t border-gray-100" />
        <button
          onClick={() => { onClearChat(); onClose(); }}
          className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
        >
          <Trash2 size={16} />
          Clear Current Chat
        </button>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function JaiAI() {
  const [messages, setMessages]       = useState<Msg[]>([WELCOME]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState<SavedChat[]>([]);
  const [currentId, setCurrentId]     = useState<string>(generateId);

  const endRef      = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // ── Boot: restore latest conversation ──────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_CURRENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { id: string; messages: Msg[] };
        if (parsed.messages?.length) {
          setMessages(parsed.messages);
          setCurrentId(parsed.id);
        }
      } catch { /* ignore */ }
    }
    setHistory(loadHistory());
  }, []);

  // ── Persist current conversation ──────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_CURRENT, JSON.stringify({ id: currentId, messages }));
  }, [messages, currentId]);

  // ── Smooth scroll to bottom (without moving viewport to top) ──────────────
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // ── Save chat to history ───────────────────────────────────────────────────
  const persistToHistory = useCallback((msgs: Msg[], id: string) => {
    if (msgs.length <= 1) return; // only welcome msg, skip
    const chats = loadHistory();
    const idx   = chats.findIndex((c) => c.id === id);
    const entry: SavedChat = {
      id,
      title: chatTitle(msgs),
      messages: msgs,
      savedAt: Date.now(),
    };
    if (idx >= 0) {
      chats[idx] = entry;
    } else {
      chats.push(entry);
    }
    saveHistory(chats);
    setHistory(chats);
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    inputRef.current?.style.setProperty("height", "auto");

    const userMsg: Msg    = { role: "user", text, ts: Date.now() };
    const next: Msg[]     = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const history = next.slice(-12).map((m) => ({ role: m.role, content: m.text }));
      const result  = await chatWithJaiAi({ data: { messages: history } });

      const reply: Msg = {
        role: "assistant",
        text: result.ok ? result.reply : `⚠️ ${result.error}`,
        ts: Date.now(),
      };
      const final = [...next, reply];
      setMessages(final);
      persistToHistory(final, currentId);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Something went wrong. Please try again.", ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ── Keyboard: Enter to send, Shift+Enter for newline ──────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  // ── New Chat ───────────────────────────────────────────────────────────────
  function newChat() {
    persistToHistory(messages, currentId);
    const id = generateId();
    setCurrentId(id);
    setMessages([{ ...WELCOME, ts: Date.now() }]);
    localStorage.removeItem(STORAGE_CURRENT);
  }

  // ── Clear current chat ─────────────────────────────────────────────────────
  function clearChat() {
    localStorage.removeItem(STORAGE_CURRENT);
    setMessages([{ ...WELCOME, ts: Date.now() }]);
  }

  // ── Reopen a history chat ─────────────────────────────────────────────────
  function openHistoryChat(chat: SavedChat) {
    persistToHistory(messages, currentId);
    setCurrentId(chat.id);
    setMessages(chat.messages);
  }

  // ── Delete a single history chat ──────────────────────────────────────────
  function deleteHistoryChat(id: string) {
    const updated = history.filter((c) => c.id !== id);
    saveHistory(updated);
    setHistory(updated);
    if (id === currentId) {
      const newId = generateId();
      setCurrentId(newId);
      setMessages([{ ...WELCOME, ts: Date.now() }]);
      localStorage.removeItem(STORAGE_CURRENT);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Layout>
      {/* Full-height container — no page jump, no outer scroll */}
      <div
        className="flex flex-col bg-gray-50"
        style={{ height: "calc(100dvh - 56px)" }} /* adjust 56px to your Layout header height */
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white grid place-items-center shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Jai.AI</h1>
              <p className="text-[11px] text-gray-400 leading-tight">College assistant · preview</p>
            </div>
          </div>

          {/* Hamburger */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <Menu size={22} className="text-gray-600" />
            </button>
            {menuOpen && (
              <HamburgerMenu
                onNewChat={newChat}
                onShowHistory={() => setShowHistory(true)}
                onClearChat={clearChat}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>

        {/* ── Messages area ── */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto px-3 py-4"
          style={{ overscrollBehavior: "contain" }}
        >
          {messages.map((m, i) => (
            <ChatBubble key={i} msg={m} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={endRef} className="h-2" />
        </div>

        {/* ── Input bar (fixed to bottom) ── */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask jai.ai…"
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-gray-400 outline-none leading-relaxed disabled:opacity-60 max-h-[120px] overflow-y-auto"
              style={{ height: "auto" }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-300 mt-2">
            Jai.AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>

      {/* ── History drawer ── */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onOpen={openHistoryChat}
          onDelete={deleteHistoryChat}
          onClose={() => setShowHistory(false)}
        />
      )}
    </Layout>
  );
}
