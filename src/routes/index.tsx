import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Splash } from "../components/Splash";
import { Bell, BookOpen, Sparkles, MapPin, GraduationCap, Users, Award } from "lucide-react";
import { COLLEGE_ADDRESS } from "../lib/constants";
import { requestFcmToken } from "../lib/fcm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jai Bharat Junior College — Hanamkonda" },
      { name: "description", content: "Welcome to Jai Bharat Junior College. 19 years of excellence with 26+ experienced faculty. Live notices, study resources & more." },
      { property: "og:title", content: "Jai Bharat Junior College" },
      { property: "og:description", content: "19 years of excellence. 26+ experienced faculty." },
    ],
  }),
  component: Index,
});

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("jb_splash_seen")) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem("jb_splash_seen", "1");
    }
    // Init FCM in background (no-op if VAPID not set)
    requestFcmToken();
  }, []);

  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <Layout>
        <section className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">Welcome to Jai Bharat Junior College</h1>
            <p className="mt-4 text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
              Empowering students for 19 years with quality intermediate education.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/notices" className="bg-white text-primary px-5 py-2.5 rounded-md font-semibold hover:bg-white/90 transition">View Notices</Link>
              <Link to="/resources" className="bg-white/15 border border-white/40 px-5 py-2.5 rounded-md font-semibold hover:bg-white/25 transition">Study Resources</Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Bell, title: "Live Notices", desc: "Real-time updates from the admin." , to: "/notices" },
            { icon: BookOpen, title: "Resources", desc: "First & Second Year study material.", to: "/resources" },
            { icon: Sparkles, title: "Jai.AI", desc: "Ask our AI assistant anything.", to: "/jai-ai" },
            { icon: MapPin, title: "About", desc: "Visit & contact information.", to: "/about" },
          ].map((c) => (
            <Link to={c.to} key={c.title} className="group rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition">
              <c.icon className="text-primary" size={28} />
              <div className="mt-3 font-semibold">{c.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.desc}</div>
            </Link>
          ))}
        </section>

        <section className="bg-secondary">
          <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: GraduationCap, n: "1000+", l: "Students" },
              { icon: Users, n: "26+", l: "Experienced Faculty" },
              { icon: Award, n: "19", l: "Years of Excellence" },
            ].map((s) => (
              <div key={s.l} className="bg-card p-6 rounded-xl shadow-sm">
                <s.icon className="mx-auto text-primary" size={32} />
                <div className="mt-2 text-2xl font-bold text-primary">{s.n}</div>
                <div className="text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="rounded-2xl bg-card/70 backdrop-blur border border-border p-6 flex items-start gap-3">
            <MapPin className="text-primary shrink-0" size={22} />
            <div>
              <div className="font-semibold">Visit Us</div>
              <p className="text-sm text-muted-foreground mt-1">{COLLEGE_ADDRESS}</p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
