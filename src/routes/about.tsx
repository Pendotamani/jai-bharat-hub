import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { MapPin, Mail, GraduationCap } from "lucide-react";
import logo from "../assets/college-logo.jpeg.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jai Bharat Junior College" },
      { name: "description", content: "About Jai Bharat Junior College, Nakkalgutta, Hanamkonda — mission, location, and contact." },
      { property: "og:title", content: "About Jai Bharat Junior College" },
      { property: "og:description", content: "Located in Nakkalgutta, Hanamkonda, Telangana." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center">
          <img src={logo.url} alt="" className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-primary/20" />
          <h1 className="mt-4 text-3xl font-bold">About Us</h1>
          <p className="mt-2 text-muted-foreground">Jai Bharat Junior College</p>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <GraduationCap className="text-primary" size={26} />
            <h2 className="mt-2 font-semibold">Our Mission</h2>
            <p className="text-sm text-muted-foreground mt-1">
              To deliver high-quality intermediate education that prepares students for top universities and professional careers, in a supportive, modern learning environment.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <MapPin className="text-primary" size={26} />
            <h2 className="mt-2 font-semibold">Location</h2>
            <p className="text-sm text-muted-foreground mt-1">Nakkalgutta, Hanamkonda, Telangana</p>
            <a className="text-sm text-primary mt-2 inline-block hover:underline"
              href="https://www.google.com/maps/search/?api=1&query=Nakkalgutta+Hanamkonda+Telangana"
              target="_blank" rel="noopener noreferrer">Open in Google Maps →</a>
          </div>
        </div>
        <div className="mt-4 bg-card border border-border rounded-xl p-5">
          <Mail className="text-primary" size={26} />
          <h2 className="mt-2 font-semibold">Contact</h2>
          <a href="mailto:jaibharatappp@gmail.com" className="text-sm text-primary hover:underline">jaibharatappp@gmail.com</a>
        </div>
      </div>
    </Layout>
  );
}