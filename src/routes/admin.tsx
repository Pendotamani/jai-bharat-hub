import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Layout } from "../components/Layout";
import { Loader2, LogOut, Plus, Trash2, Shield } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Jai Bharat Junior College" },
      { name: "description", content: "Admin panel for managing notices." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Notice = { id: string; title: string; body: string; createdAt: number };

function AdminPage() {
  const [user, setUser] = useState<{ email: string | null } | null | undefined>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [crudError, setCrudError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubDocs: (() => void) | undefined;
    (async () => {
      const { getFirebase, ADMIN_EMAILS } = await import("../lib/firebase");
      const { onAuthStateChanged } = await import("firebase/auth");
      const { auth, db } = getFirebase();
      unsubAuth = onAuthStateChanged(auth, async (u) => {
        setUser(u ? { email: u.email } : null);
        const admin = !!u?.email && ADMIN_EMAILS.includes(u.email);
        setIsAdmin(admin);
        if (admin) {
          const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
          const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
          unsubDocs = onSnapshot(
            q,
            (snap) => setNotices(snap.docs.map((d) => {
              const data = d.data() as { title?: string; body?: string; createdAt?: { toMillis?: () => number } | number };
              const ts = data.createdAt;
              const createdAt = typeof ts === "number" ? ts : ts?.toMillis?.() ?? Date.now();
              return { id: d.id, title: data.title ?? "", body: data.body ?? "", createdAt };
            })),
            (err) => setCrudError(err.message),
          );
        } else {
          unsubDocs?.();
        }
      });
    })();
    return () => { unsubAuth?.(); unsubDocs?.(); };
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthError(null); setBusy(true);
    try {
      const { getFirebase } = await import("../lib/firebase");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(getFirebase().auth, email, password);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally { setBusy(false); }
  }

  async function handleLogout() {
    const { getFirebase } = await import("../lib/firebase");
    const { signOut } = await import("firebase/auth");
    await signOut(getFirebase().auth);
  }

  async function addNotice(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCrudError(null); setBusy(true);
    try {
      const { getFirebase } = await import("../lib/firebase");
      const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(getFirebase().db, "notices"), {
        title: title.trim(),
        body: body.trim(),
        createdAt: serverTimestamp(),
      });
      setTitle(""); setBody("");
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : "Failed to add notice");
    } finally { setBusy(false); }
  }

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return;
    try {
      const { getFirebase } = await import("../lib/firebase");
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(getFirebase().db, "notices", id));
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (user === undefined) {
    return <Layout><div className="p-10 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2" />Loading…</div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-sm mx-auto px-4 py-12">
          <div className="text-center mb-6">
            <Shield className="mx-auto text-primary" size={36} />
            <h1 className="text-2xl font-bold mt-2">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Authorized personnel only.</p>
          </div>
          <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            {authError && <div className="text-sm text-destructive">{authError}</div>}
            <button disabled={busy} className="w-full bg-primary text-primary-foreground rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-60">
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-10 text-center">
          <Shield className="mx-auto text-destructive" size={36} />
          <h2 className="font-bold mt-2">Not Authorized</h2>
          <p className="text-sm text-muted-foreground">{user.email} is not an admin account.</p>
          <button onClick={handleLogout} className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="text-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <form onSubmit={addNotice} className="bg-card border border-border rounded-xl p-5 space-y-3 mb-6">
          <h2 className="font-semibold flex items-center gap-2"><Plus size={18} /> New Notice</h2>
          <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          <textarea placeholder="Notice details…" value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          {crudError && <div className="text-sm text-destructive">{crudError}</div>}
          <button disabled={busy} className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
            {busy ? "Publishing…" : "Publish Notice"}
          </button>
        </form>
        <h2 className="font-semibold mb-3">Existing Notices ({notices.length})</h2>
        <div className="space-y-2">
          {notices.map((n) => (
            <div key={n.id} className="bg-card border border-border rounded-lg p-4 flex justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-primary truncate">{n.title}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">{n.body}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <button onClick={() => deleteNotice(n.id)} className="text-destructive shrink-0 p-2 hover:bg-destructive/10 rounded" aria-label="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {notices.length === 0 && <div className="text-sm text-muted-foreground">No notices yet.</div>}
        </div>
      </div>
    </Layout>
  );
}