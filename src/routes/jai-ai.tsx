import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Layout } from "../components/Layout";
import { Sparkles, Send } from "lucide-react";

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
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm Jai.AI 👋 — AI chat is coming soon. You can type a question below to preview the interface." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: "🚧 AI integration is coming soon. Your message has been received." }]);
    setInput("");
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Jai.AI</h1>
            <div className="text-xs text-muted-foreground">Your college assistant · preview</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-secondary/40 rounded-xl p-3 space-y-3 border border-border">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Jai.AI…"
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="bg-primary text-primary-foreground rounded-full px-4 py-2.5 font-medium flex items-center gap-1 hover:opacity-90">
            <Send size={16} />
          </button>
        </form>
      </div>
    </Layout>
  );
}