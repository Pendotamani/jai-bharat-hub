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

type Subject = { name: string; pdfUrl: string };
type Year = { title: string; subjects: Subject[] };

const firstYearSubjects: Subject[] = [
  { name: "Mathematics A", pdfUrl: "https://drive.google.com/file/d/12zytDND1P9ueO30c-LVBMU2uGUcUTGjW/view?usp=drive_link" },
  { name: "Mathematics B", pdfUrl: "https://drive.google.com/file/d/1e8RUb1wiEfInm9i5JgXDnhtXqghug4KG/view?usp=drive_link" },
  { name: "Economics", pdfUrl: "https://drive.google.com/file/d/1E4zsWfNrdy9zFWwG3LhuCx6T1dLo6E5T/view?usp=drive_link" },
  { name: "Political Science", pdfUrl: "https://drive.google.com/file/d/1B_h-N2UQ1wiFlHZO1jMIZUhQuNNPXiY-/view?usp=drive_link" },
  {
  name: "Commerce and Accountancy",
  pdfUrl: "https://drive.google.com/file/d/1ilJnI3cU4TB6CCAi2tgvXKBGQt0uBqJo/view?usp=drivesdk",
},
  { name: "Arabic", pdfUrl: "https://drive.google.com/file/d/1oWyMhvuwsHjSbpKDtD1HpECodfl6IB1n/view?usp=drive_link" },
  { name: "Urdu", pdfUrl: "https://drive.google.com/file/d/1yFybrIsvhQKn5aMmJTB7FBLhj6K3ZGWH/view?usp=drive_link" },
  { name: "English", pdfUrl: "https://drive.google.com/file/d/1NSz33W3RR9IArUFLJj4DEyxuUQOQfC1i/view?usp=drive_link" },
  { name: "Hindi", pdfUrl: "https://drive.google.com/file/d/11q2XkPiuptYLTZjaAt52Sl8c00715IPF/view?usp=drive_link" },
  { name: "Telugu", pdfUrl: "https://drive.google.com/file/d/1RuuOsc-RSa-Lxa9R1Ea_GiVtzmxRVS1q/view?usp=drive_link" },
];

const secondYearSubjects: Subject[] = [
  { name: "Mathematics A", pdfUrl: "https://drive.google.com/drive/folders/1sMPVi2rX-u6uh1PNcu5o6P68pqzvU4Kl?usp=drive_link" },
  { name: "Mathematics B", pdfUrl: "https://drive.google.com/drive/folders/13GYOZZbuhz-b7Ukqe8USP0dpOrj64LCF?usp=drive_link" },
  { name: "Economics", pdfUrl: "" },
  { name: "Political Science", pdfUrl: "https://drive.google.com/drive/folders/1bH52asZtt6oFVflEJbI2lJzgglOw_GN4?usp=drive_link" },
  { name: "Commerce", pdfUrl: "https://drive.google.com/drive/folders/14p5dKLN2DgL538WXigmIeLB8FMtdupCm?usp=drive_link" },
  { name: "Accountancy", pdfUrl: "https://drive.google.com/drive/folders/1nodoYchWQgjI_z6JbALFh_rEDivnL6M8?usp=drive_link" },
  { name: "Arabic", pdfUrl: "" },
  { name: "Urdu", pdfUrl: "https://drive.google.com/drive/folders/1FDiZpRqvcLoTWppP9X29cAdnJV7CsAp9?usp=drive_link" },
  { name: "English", pdfUrl: "https://drive.google.com/drive/folders/18FAl836QHzElYDxoxEoDTJZpVvMCT93Q?usp=drive_link" },
  { name: "Hindi", pdfUrl: "https://drive.google.com/drive/folders/1XoYi-1gsx9HLdqwFHyH2mzp1fGBREr2Z?usp=drive_link" },
  { name: "Telugu", pdfUrl: "" },
  { name: "Sanskrit", pdfUrl: "https://drive.google.com/drive/folders/1QgJZQG6D92xUrdRISOa_UT-81ZaN7UMW?usp=drive_link" },
];

const YEARS: Year[] = [
  { title: "First Year", subjects: firstYearSubjects },
  { title: "Second Year", subjects: secondYearSubjects },
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
                const active = s.pdfUrl.trim() !== "";
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
                  <a
                    key={s.name}
                    href={s.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition"
                  >
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
