import { useEffect, useState } from "react";
import logo from "../assets/college-logo.jpeg.asset.json";
import { COLLEGE_NAME } from "../lib/constants";

export function Splash({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1400);
    const t2 = setTimeout(onDone, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
      style={{ background: "linear-gradient(135deg, oklch(0.4 0.22 258), oklch(0.6 0.2 245))" }}
    >
      <img
        src={logo.url}
        alt={COLLEGE_NAME}
        className="h-28 w-28 rounded-full bg-white object-cover shadow-2xl animate-pulse"
      />
      <h1 className="mt-6 text-white text-2xl font-bold text-center px-4">{COLLEGE_NAME}</h1>
      <p className="mt-2 text-white/80 text-sm">Excellence in Education</p>
    </div>
  );
}