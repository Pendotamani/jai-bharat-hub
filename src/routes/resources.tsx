import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { BookOpen, ExternalLink, Clock } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Jai Bharat Junior College" },
      { name: "description", content: "Study materials for First and Second Year intermediate students." },
      { property: "og:title", content: "Resources — Jai Bharat Junior College" },
      { property: "og:description", content: "First and Second Year subject resources via Google Drive." },
    ],
  }),
  component: ResourcesPage,
});

type Subject = { name: string; link?: string };
type Year = { title: string; subjects: Subject[] };

// Paste Google Drive folder/file URLs into `link` to activate a subject.
// Leave `link` undefined to show a "Coming Soon" badge.
const YEARS: Year[] = [
  {
    title: "First Year",
    subjects: [
      { name: "English" },
      { name: "Sanskrit / Telugu" },
      { name: "Mathematics IA" },
      { name: "Mathematics IB" },
      { name: "Physics" },
      { name: "Chemistry" },
      { name: "Botany" },
      { name: "Zoology" },
      { name: "Commerce" },
      { name: "Economics" },
      { name: "Civics" },
    ],
  },
  {
    title: "Second Year",
    subjects: [
      { name: "English" },
      { name: "Sanskrit / Telugu" },
      { name: "Mathematics IIA" },
      { name: "Mathematics IIB" },
      { name: "Physics" },
      { name: "Chemistry" },
      { name: "Botany" },
      { name: "Zoology" },
      { name: "Commerce" },
      { name: "Economics" },
      { name: "Civics" },
    ],
  },
];

function ResourcesPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-3xl font-bold">Study Resources</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-sm">
          Tap a subject to open its Google Drive folder. Materials marked "Coming Soon" will be added shortly.
        </p>
        {YEARS.map((y) => (
          <section key={y.title} className="mb-10">
            <h2 className="text-xl font-semibold text-primary mb-4 border-b border-border pb-2">{y.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {y.subjects.map((s) => {
                const active = !!s.link;
                const inner = (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    {active ? (
                      <ExternalLink size={16} className="text-primary opacity-60 group-hover:opacity-100" />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        <Clock size={10} /> Coming Soon
                      </span>
                    )}
                  </div>
                );
                return active ? (
                  <a key={s.name} href={s.link} target="_blank" rel="noopener noreferrer"
                    className="group bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition">
                    {inner}
                  </a>
                ) : (
                  <div key={s.name} className="bg-muted/40 border border-border rounded-lg p-4 cursor-not-allowed">
                    {inner}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}