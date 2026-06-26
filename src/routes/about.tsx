import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import { MapPin, Mail, GraduationCap, Users, Award } from "lucide-react";
import logo from "../assets/output-smallpngtools.png";
import { COLLEGE_ADDRESS, COLLEGE_EMAIL, COLLEGE_NAME } from "../lib/constants";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jai Bharat Junior College" },
      { name: "description", content: "About Jai Bharat Junior College — 19 years of educational excellence with 26+ experienced faculty." },
      { property: "og:title", content: "About Jai Bharat Junior College" },
      { property: "og:description", content: "19 years of excellence. 26+ experienced faculty members." },
    ],
  }),
  component: AboutPage,
});

function useCounter(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function StatCard({ icon: Icon, value, suffix, label }: { icon: typeof GraduationCap; value: number; suffix?: string; label: string }) {
  const v = useCounter(value);
  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition">
      <Icon className="mx-auto text-primary" size={32} />
      <div className="mt-3 text-3xl font-bold text-primary tabular-nums">
        {v}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <img src={logo.url} alt="" className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-primary/20" />
          <h1 className="mt-4 text-3xl font-bold">About Us</h1>
          <p className="mt-2 text-muted-foreground">{COLLEGE_NAME}</p>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <StatCard icon={Users} value={26} suffix="+" label="Experienced Faculty Members" />
          <StatCard icon={Award} value={19} label="Years of Educational Excellence" />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <GraduationCap className="text-primary" size={26} />
            <h2 className="mt-2 font-semibold">Our Mission</h2>
            <p className="text-sm text-muted-foreground mt-1">
              To deliver high-quality intermediate education that prepares students for top universities and professional careers, in a supportive, modern learning environment.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <MapPin className="text-primary" size={26} />
            <h2 className="mt-2 font-semibold">Address</h2>
            <p className="text-sm text-muted-foreground mt-1">{COLLEGE_ADDRESS}</p>
          </div>
        </div>

        <div className="mt-4 bg-card border border-border rounded-xl p-5">
          <Mail className="text-primary" size={26} />
          <h2 className="mt-2 font-semibold">Contact</h2>
          <a href={`mailto:${COLLEGE_EMAIL}`} className="text-sm text-primary hover:underline">{COLLEGE_EMAIL}</a>
        </div>
      </div>
    </Layout>
  );
}
