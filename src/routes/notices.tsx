import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Bell, Loader2 } from "lucide-react";

export const Route = createFileRoute("/notices")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notices — Jai Bharat Junior College" },
      { name: "description", content: "Latest announcements and notices from Jai Bharat Junior College, posted in real time." },
      { property: "og:title", content: "Notices — Jai Bharat Junior College" },
      { property: "og:description", content: "Real-time notices and announcements." },
    ],
  }),
  component: NoticesPage,
});

type Notice = { id: string; title: string; body: string; createdAt: number };

function NoticesPage() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const { getFirebase } = await import("../lib/firebase");
        const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
        const { db } = getFirebase();
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(
          q,
          (snap) => {
            setNotices(
              snap.docs.map((d) => {
                const data = d.data() as { title?: string; body?: string; createdAt?: { toMillis?: () => number } | number };
                const ts = data.createdAt;
                const createdAt = typeof ts === "number" ? ts : ts?.toMillis?.() ?? Date.now();
                return { id: d.id, title: data.title ?? "", body: data.body ?? "", createdAt };
              }),
            );
          },
          (err) => setError(err.message),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => unsub?.();
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-3xl font-bold">Notices</h1>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3 mb-4">
            Could not load notices: {error}
          </div>
        )}
        {notices === null && !error && (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Loading notices…</div>
        )}
        {notices && notices.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-secondary rounded-xl">
            <Bell className="mx-auto mb-2 opacity-50" size={32} />
            No notices yet. Check back soon.
          </div>
        )}
        <div className="space-y-3">
          {notices?.map((n) => (
            <article key={n.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <h2 className="font-semibold text-lg text-primary">{n.title}</h2>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{n.body}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}