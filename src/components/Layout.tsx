import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, MapPin, Mail, Home, Bell, BookOpen, Sparkles } from "lucide-react";
import logo from "../assets/college-logo.jpeg.asset.json";
import { COLLEGE_ADDRESS, COLLEGE_EMAIL, COLLEGE_NAME } from "../lib/constants";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/notices", label: "Notices" },
  { to: "/resources", label: "Resources" },
  { to: "/jai-ai", label: "Jai.AI" },
  { to: "/about", label: "About" },
] as const;

const BOTTOM_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/notices", label: "Notices", icon: Bell },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/jai-ai", label: "jai.ai", icon: Sparkles },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur text-primary-foreground shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logo.url} alt={COLLEGE_NAME} className="h-10 w-10 rounded-full bg-white object-cover shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-sm sm:text-base leading-tight truncate">{COLLEGE_NAME}</div>
              <div className="text-[10px] sm:text-xs opacity-80 leading-tight truncate">Hanamkonda, Telangana</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition"
                activeProps={{ className: "bg-white/15 px-3 py-2 rounded-md text-sm font-medium" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-white/10 px-4 py-2 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
                activeProps={{ className: "bg-white/15 px-3 py-2 rounded-md text-sm font-medium" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav – Home, Notices, Resources, jai.ai only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border grid grid-cols-4">
        {BOTTOM_NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex flex-col items-center justify-center py-2 text-[11px] text-muted-foreground hover:text-primary transition"
            activeProps={{ className: "flex flex-col items-center justify-center py-2 text-[11px] text-primary font-semibold" }}
            activeOptions={{ exact: n.to === "/" }}
          >
            <n.icon size={20} />
            <span className="mt-0.5">{n.label}</span>
          </Link>
        ))}
      </nav>

      <footer className="bg-primary text-primary-foreground mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={logo.url} alt="" className="h-8 w-8 rounded-full bg-white object-cover" />
              <div className="font-bold">Jai Bharat Junior College</div>
            </div>
            <p className="opacity-80">Empowering students with quality intermediate education.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Address</div>
            <div className="flex items-start gap-2 opacity-90">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>{COLLEGE_ADDRESS}</span>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <a href={`mailto:${COLLEGE_EMAIL}`} className="flex items-center gap-2 opacity-90 hover:opacity-100">
              <Mail size={16} /> {COLLEGE_EMAIL}
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-3 text-center text-xs opacity-75">
          © {new Date().getFullYear()} {COLLEGE_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}