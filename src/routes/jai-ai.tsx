import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Layout } from "../components/Layout";
import {
  Sparkles,
  Send,
  Loader2,
  Menu,
  Trash2,
  History,
  X,
} from "lucide-react";
import { chatWithJaiAi } from "../lib/jai-ai.functions";

export const Route = createFileRoute("/jai-ai")({
  head: () => ({
    meta: [
      { title: "Jai.AI — Jai Bharat Junior College" },
      { name: "description", content: "Ask Jai.AI — the college AI assistant. Coming soon." },
      { property: "og:title", content: "Jai.AI Assistant" },
      { property: "og:description", content: "Modern AI chat assistant for Jai Bharat Junior College." },
    ],
  }),
  component: JaiAI,
});

type Msg = { role: "user" | "assistant"; text: string };

function JaiAI() {
  const defaultMessages: Msg[] = [
    {
      role: "assistant",
      text: "Hi! I'm jai.ai 👋 — your college assistant. Ask me anything about studies, exams, or campus life.",
    },
  ];

  const [messages, setMessages] = useState<Msg[]>(defaultMessages);

const [messages, setMessages] = useState<Msg[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
const [history, setHistory] = useState<Msg[][]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  const saved = localStorage.getItem("jai-ai-chat");
  if (saved) {
    try {
      setMessages(JSON.parse(saved));
    } catch {
      setMessages(defaultMessages);
    }
  }
}, []);

useEffect(() => {
  localStorage.setItem("jai-ai-chat", JSON.stringify(messages));

  const chats = JSON.parse(
    localStorage.getItem("jai-ai-history") || "[]"
  );

  if (
    messages.length > 1 &&
    JSON.stringify(chats[chats.length - 1]) !== JSON.stringify(messages)
  ) {
    chats.push(messages);
    localStorage.setItem(
      "jai-ai-history",
      JSON.stringify(chats)
    );
  }

  setHistory(chats);

  endRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

  function clearChat() {
  localStorage.removeItem("jai-ai-chat");

  setMessages([
    {
      role: "assistant",
      text: "Hi! I'm jai.ai 👋 — your college assistant.",
    },
  ]);

  setMenuOpen(false);
}
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", text }];
    setMessages(next);
    setLoading(true);
    try {
      const history = next
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.text }));
      const result = await chatWithJaiAi({ data: { messages: history } });
      if (result.ok) {
        setMessages((m) => [...m, { role: "assistant", text: result.reply }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: `⚠️ ${result.error}` }]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Something went wrong. Please try again." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-120px)]">
        <div className="relative">
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="p-2 rounded-lg hover:bg-secondary"
  >
    {menuOpen ? <X size={22} /> : <Menu size={22} />}
  </button>

  {menuOpen && (
    <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-xl shadow-lg z-50">

      <button
        onClick={clearChat}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-secondary"
      >
        <Trash2 size={18}/>
        Clear Chat
      </button>

      <div className="border-t my-1"></div>

      <div className="px-4 py-2 text-xs text-muted-foreground">
        Chat History
      </div>

      {history.length === 0 ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No saved chats
        </div>
      ) : (
        history
          .slice()
          .reverse()
          .map((chat, index) => (
            <button
              key={index}
              onClick={() => loadHistory(chat)}
              className="w-full text-left px-4 py-3 hover:bg-secondary flex items-center gap-2"
            >
              <History size={16}/>
              Chat {history.length - index}
            </button>
          ))
      )}
    </div>
  )}
</div>
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Jai.AI</h1>
            <div className="text-xs text-muted-foreground">Your college assistant · preview</div>
          </div>
        </div>
        <div className="h-[60vh] overflow-y-auto bg-secondary/40 rounded-xl p-3 space-y-3 border border-border">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                <span className="whitespace-pre-wrap">{m.text}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-muted-foreground inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask jai.ai…"
            disabled={loading}
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          <button type="submit" disabled={loading || !input.trim()} className="bg-primary text-primary-foreground rounded-full px-4 py-2.5 font-medium flex items-center gap-1 hover:opacity-90 disabled:opacity-60">
            <Send size={16} />
          </button>
        </form>
      </div>
    </Layout>
  );
}
