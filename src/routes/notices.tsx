import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Bell, Loader2 } from "lucide-react";

export const Route = createFileRoute("/notices")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notices — Jai Bharat Junior College" },
      {
        name: "description",
        content:
          "Latest announcements and notices from Jai Bharat Junior College.",
      },
    ],
  }),
  component: NoticesPage,
});

type Notice = {
  id: string;
  title: string;
  description: string;
  createdAt: number;
};

function NoticesPage() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const { getFirebase } = await import("../lib/firebase");
        const { collection, query, orderBy, onSnapshot } = await import(
          "firebase/firestore"
        );

        const { db } = getFirebase();

        const q = query(
          collection(db, "notices"),
          orderBy("createdAt", "desc")
        );

        unsub = onSnapshot(
          q,
          (snapshot) => {
            setNotices(
              snapshot.docs.map((doc) => {
                const data = doc.data() as any;

                const createdAt =
                  typeof data.createdAt === "number"
                    ? data.createdAt
                    : data.createdAt?.toMillis?.() ?? Date.now();

                return {
                  id: doc.id,
                  title: data.title ?? "",
                  description: data.description ?? data.body ?? "",
                  createdAt,
                };
              })
            );
          },
          (err) => setError(err.message)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => unsub?.();
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-primary" size={28} />
          <h1 className="text-3xl font-bold">Notices</h1>
        </div>

        {error && (
          <div className="rounded-md bg-red-100 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}

        {notices === null && !error && (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Loading notices...
          </div>
        )}

        {notices && notices.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No notices available.
          </div>
        )}

        <div className="space-y-4">
          {notices?.map((notice) => (
            <article
              key={notice.id}
              className="border rounded-xl p-5 shadow-sm bg-card"
            >
              <h2 className="text-xl font-bold text-primary">
                {notice.title}
              </h2>

              <p className="mt-3 text-sm whitespace-pre-wrap text-foreground">
                {notice.description}
              </p>

              <div className="mt-4 text-xs text-muted-foreground">
                {new Date(notice.createdAt).toLocaleString()}
              </div>
            </article>
          ))}
        </div>

      </div>
    </Layout>
  );
}
