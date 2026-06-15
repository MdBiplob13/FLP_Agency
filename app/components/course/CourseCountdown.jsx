"use client";

import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { getCourseTiming, formatRemaining } from "@/lib/courseTiming";

// Visual accent per phase so the urgency reads at a glance.
const ACCENTS = {
  "before-enroll": {
    text: "text-blue-200",
    box: "border-blue-400/20 bg-blue-500/10 text-blue-100",
    dot: "text-blue-300",
  },
  "enroll-open": {
    text: "text-emerald-200",
    box: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    dot: "text-emerald-300",
  },
  "enroll-closed": {
    text: "text-amber-200",
    box: "border-amber-400/20 bg-amber-500/10 text-amber-100",
    dot: "text-amber-300",
  },
};

const pad = (n) => String(n).padStart(2, "0");

/**
 * Live, ticking countdown for a course's enrollment / start window.
 *
 * `variant="full"`    — labeled card with Days/Hours/Min/Sec boxes (detail page)
 * `variant="compact"` — small inline badge (catalogue cards)
 *
 * Renders nothing once the course has started or when no dates are set, and
 * stays hydration-safe by only computing the time after mount.
 */
export default function CourseCountdown({ course, variant = "full", className = "" }) {
  // null until mounted → server and first client render both produce nothing,
  // so there's no hydration mismatch from the live clock.
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  const timing = getCourseTiming(course, now);
  if (!timing.target) return null; // started / open → no countdown needed

  const { days, hours, minutes, seconds } = formatRemaining(timing.target - now);
  const accent = ACCENTS[timing.phase] || ACCENTS["before-enroll"];

  if (variant === "compact") {
    const span =
      days > 0
        ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
        : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${accent.box} ${className}`}
      >
        <FiClock className={`h-3.5 w-3.5 ${accent.dot}`} />
        <span className="opacity-80">{timing.label}</span>
        <span className="tabular-nums">{span}</span>
      </span>
    );
  }

  // Full variant
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/50 p-4 ${className}`}
    >
      <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${accent.text}`}>
        <FiClock className={`h-4 w-4 ${accent.dot}`} /> {timing.label}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div
            key={u.label}
            className={`flex flex-col items-center rounded-xl border py-2.5 ${accent.box}`}
          >
            <span className="text-2xl font-bold tabular-nums leading-none">
              {pad(u.value)}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.15em] opacity-70">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
