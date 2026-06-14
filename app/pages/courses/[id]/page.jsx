"use client";

import { use, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiAward,
  FiClock,
  FiPlayCircle,
  FiBookOpen,
  FiGlobe,
  FiBarChart2,
  FiUsers,
  FiCalendar,
  FiCheck,
  FiLock,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";
import Footer from "../../../components/footer/page.jsx";
import Navbar from "@/app/components/navbar/page.jsx";
import useCourse from "@/hooks/course/singleCourseHook";
import useCourses from "@/hooks/course/courseHook";

const FALLBACK_IMG = "/image1.jpg";
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);
const easeOut = [0.22, 1, 0.36, 1];

const DAY_LABELS = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

/* ------------------------------------------------------------------ */
/*  Map a raw API course doc to the shape this page renders            */
/* ------------------------------------------------------------------ */

function normalizeCourse(c) {
  let lessons = 0;
  let minutes = 0;
  for (const section of c.curriculum || []) {
    for (const lesson of section.lessons || []) {
      lessons += 1;
      minutes += lesson.duration || 0;
    }
  }
  const hours = Math.round(minutes / 60);

  let price = c.price || 0;
  let oldPrice = null;
  let isFree = false;
  if (c.priceTier === "free") {
    isFree = true;
    price = 0;
  } else if (c.priceTier === "discounted" && c.discountPrice) {
    price = c.discountPrice;
    oldPrice = c.price || null;
  }

  let badge = null;
  if (c.isBestseller) badge = "Bestseller";
  else if (c.isFeatured) badge = "Featured";

  return {
    id: c._id,
    title: c.title,
    description: c.description,
    category: c.category,
    level: cap(c.level || "beginner"),
    language: c.language,
    tags: c.tags || [],
    teachers: c.teachers || [],
    curriculum: c.curriculum || [],
    schedule: c.schedule || [],
    currentBatch: c.currentBatch || null,
    studentsCount: (c.studentsEnrolled || []).length,
    lessons,
    minutes,
    hours,
    price,
    oldPrice,
    isFree,
    badge,
    img: c.thumbnail || FALLBACK_IMG,
  };
}

/* ------------------------------------------------------------------ */
/*  Shared design helpers                                             */
/* ------------------------------------------------------------------ */

function SpotlightCard({ children, className = "", glow = "rgba(99,102,241,0.18)" }) {
  const ref = useRef(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();

  function handleMove(e) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  const background = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${glow}, transparent 60%)`;

  return (
    <div
      ref={ref}
      onMouseMove={reduce ? undefined : handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ background }}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute inset-0"
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function Stars({ n = 5 }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`h-4 w-4 ${i < n ? "fill-amber-400" : "opacity-30"}`} />
      ))}
    </div>
  );
}

function Price({ course, size = "lg" }) {
  if (course.isFree) {
    return (
      <span className={`font-bold text-emerald-300 ${size === "lg" ? "text-4xl" : "text-xl"}`}>
        Free
      </span>
    );
  }
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-white ${size === "lg" ? "text-4xl" : "text-xl"}`}>
        ৳{course.price}
      </span>
      {course.oldPrice ? (
        <span className={`text-slate-500 line-through ${size === "lg" ? "text-lg" : "text-sm"}`}>
          ৳{course.oldPrice}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar course card (bestseller / featured rail)                  */
/* ------------------------------------------------------------------ */

function RailCard({ course }) {
  return (
    <Link href={`/pages/courses/${course.id}`} className="group block">
      <SpotlightCard className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-3 transition-colors hover:border-blue-500/30">
        <div className="relative h-20 w-24 flex-none overflow-hidden rounded-xl">
          <img
            src={course.img}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-between py-0.5">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-blue-200">
            {course.title}
          </h4>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">{course.category}</span>
            {course.isFree ? (
              <span className="text-sm font-bold text-emerald-300">Free</span>
            ) : (
              <span className="text-sm font-bold text-white">৳{course.price}</span>
            )}
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const { course: raw, courseLoading, courseError } = useCourse(id);
  const course = useMemo(() => (raw ? normalizeCourse(raw) : null), [raw]);

  // Catalogue feed that powers the right-hand bestseller / featured rail
  const { courses: rawCatalogue } = useCourses({ limit: 50 });
  const catalogue = useMemo(
    () => (rawCatalogue || []).map(normalizeCourse),
    [rawCatalogue],
  );

  const bestsellers = useMemo(
    () => catalogue.filter((c) => c.badge === "Bestseller" && c.id !== id).slice(0, 3),
    [catalogue, id],
  );
  const featured = useMemo(
    () => catalogue.filter((c) => c.badge === "Featured" && c.id !== id).slice(0, 3),
    [catalogue, id],
  );

  /* ---- Buy / enrol flow ---- */
  const [buying, setBuying] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", text }

  async function handleBuy() {
    if (buying) return;

    const token =
      Cookies.get("flp_token") ||
      (typeof window !== "undefined" ? localStorage.getItem("flp_token") : null);

    // Not logged in → send to login, then bounce back to this course
    if (!token) {
      router.push(
        `/pages/auth/login?redirect=${encodeURIComponent(`/pages/courses/${id}`)}`,
      );
      return;
    }

    setBuying(true);
    setToast(null);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ type: "success", text: "You're enrolled! Check your dashboard." });
      } else {
        setToast({ type: "error", text: data.message || "Could not complete enrolment." });
      }
    } catch (err) {
      console.error("Enrol error:", err);
      setToast({ type: "error", text: "Network error. Please try again." });
    } finally {
      setBuying(false);
    }
  }

  const totalLessons = course?.lessons ?? 0;

  return (
    <div className="min-h-screen bg-[#020205] font-sans text-slate-100 antialiased">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(79,70,229,0.18),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.14),transparent_42%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20 lg:pt-32">
        {/* Top bar: back + (mobile) breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/pages/courses")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white cursor-pointer"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to courses
          </button>
        </div>

        {/* ---- Loading ---- */}
        {courseLoading ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60 sm:h-96" />
              <div className="space-y-3">
                <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
              </div>
            </div>
            <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60" />
          </div>
        ) : courseError || !course ? (
          /* ---- Error / not found ---- */
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-12 text-center">
            <FiX className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-white">
              {courseError || "Course not found"}
            </p>
            <p className="mt-1 text-slate-400">
              The course you’re looking for may have been moved or unpublished.
            </p>
            <Link
              href="/pages/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Browse all courses <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* ---- Course detail ---- */
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* ============ LEFT: details ============ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="space-y-10"
            >
              {/* Hero media */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
                <img
                  src={course.img}
                  alt={course.title}
                  className="h-72 w-full object-cover sm:h-[26rem]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                {course.badge && (
                  <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    <FiAward className="h-3.5 w-3.5" /> {course.badge}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                    {course.category}
                  </p>
                  <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                    {course.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Stars n={5} />
                      <span className="font-semibold text-white">4.9</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiUsers className="h-4 w-4 text-blue-300" />
                      {course.studentsCount.toLocaleString()} enrolled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiBarChart2 className="h-4 w-4 text-blue-300" />
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: FiPlayCircle, label: "Lessons", value: totalLessons },
                  { icon: FiClock, label: "Duration", value: `${course.hours}h` },
                  { icon: FiBarChart2, label: "Level", value: course.level },
                  { icon: FiGlobe, label: "Language", value: course.language || "—" },
                ].map((f) => (
                  <SpotlightCard
                    key={f.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center"
                  >
                    <f.icon className="mx-auto h-5 w-5 text-blue-300" />
                    <p className="mt-2 text-lg font-bold text-white">{f.value}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {f.label}
                    </p>
                  </SpotlightCard>
                ))}
              </div>

              {/* About */}
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <FiBookOpen className="h-5 w-5 text-blue-300" /> About this course
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-300">
                  {course.description}
                </p>
                {course.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {course.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Curriculum */}
              {course.curriculum.length > 0 && (
                <section>
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl font-bold text-white">Curriculum</h2>
                    <span className="text-sm text-slate-400">
                      {course.curriculum.length} sections · {totalLessons} lessons
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {course.curriculum.map((section, si) => (
                      <div
                        key={section._id || si}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60"
                      >
                        <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/5 px-5 py-4">
                          <h3 className="font-semibold text-white">
                            <span className="text-blue-300">
                              {String(si + 1).padStart(2, "0")}.
                            </span>{" "}
                            {section.title}
                          </h3>
                          <span className="flex-none text-xs text-slate-400">
                            {(section.lessons || []).length} lessons
                          </span>
                        </div>
                        <ul className="divide-y divide-white/5">
                          {(section.lessons || []).map((lesson, li) => (
                            <li
                              key={lesson._id || li}
                              className="flex items-center justify-between gap-3 px-5 py-3.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {lesson.isPreview ? (
                                  <FiPlayCircle className="h-4 w-4 flex-none text-emerald-300" />
                                ) : (
                                  <FiLock className="h-4 w-4 flex-none text-slate-500" />
                                )}
                                <span className="truncate text-sm text-slate-300">
                                  {lesson.title}
                                </span>
                                {lesson.isPreview && (
                                  <span className="flex-none rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                                    Preview
                                  </span>
                                )}
                              </div>
                              {lesson.duration ? (
                                <span className="flex-none text-xs text-slate-500">
                                  {lesson.duration} min
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Schedule */}
              {course.schedule.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <FiCalendar className="h-5 w-5 text-blue-300" /> Class schedule
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {course.schedule.map((slot, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4"
                      >
                        <span className="font-semibold text-white">
                          {DAY_LABELS[slot.day] || cap(slot.day)}
                        </span>
                        <span className="text-sm text-slate-300">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Instructors */}
              {course.teachers.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-white">Your instructor{course.teachers.length > 1 ? "s" : ""}</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {course.teachers.map((t) => (
                      <div
                        key={t._id}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                      >
                        <img
                          src={t.photo || FALLBACK_IMG}
                          alt={t.name}
                          className="h-14 w-14 flex-none rounded-full object-cover ring-2 ring-blue-500/30"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{t.name}</p>
                          <p className="text-sm capitalize text-slate-400">{t.role || "Instructor"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>

            {/* ============ RIGHT: sticky buy card + rails ============ */}
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
              className="lg:sticky lg:top-28 lg:h-fit lg:self-start"
            >
              <div className="space-y-6">
                {/* Buy card */}
                <SpotlightCard
                  glow="rgba(99,102,241,0.25)"
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                  <div className="flex items-end justify-between gap-3">
                    <Price course={course} size="lg" />
                    {course.oldPrice && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {Math.round((1 - course.price / course.oldPrice) * 100)}% off
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {buying ? (
                      "Processing…"
                    ) : (
                      <>
                        <FiShoppingCart className="h-5 w-5" />
                        {course.isFree ? "Enrol for free" : "Buy this course"}
                      </>
                    )}
                  </button>

                  <Link
                    href="/pages/courses"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white cursor-pointer"
                  >
                    <FiArrowLeft className="h-4 w-4" /> Back to courses
                  </Link>

                  {toast && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                        toast.type === "success"
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                          : "border-rose-400/20 bg-rose-500/10 text-rose-200"
                      }`}
                    >
                      {toast.type === "success" ? (
                        <FiCheck className="mt-0.5 h-4 w-4 flex-none" />
                      ) : (
                        <FiX className="mt-0.5 h-4 w-4 flex-none" />
                      )}
                      <span>{toast.text}</span>
                    </motion.div>
                  )}

                  {/* This course includes */}
                  <ul className="mt-6 space-y-3 border-t border-white/5 pt-6 text-sm text-slate-300">
                    {[
                      `${totalLessons} on-demand lessons`,
                      `${course.hours} hours of content`,
                      `${course.level} level`,
                      "Certificate of completion",
                      "Lifetime access",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <FiCheck className="h-4 w-4 flex-none text-emerald-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>

                {/* Bestseller rail */}
                {bestsellers.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                      <FiAward className="h-4 w-4" /> Bestsellers
                    </h3>
                    <div className="space-y-3">
                      {bestsellers.map((c) => (
                        <RailCard key={c.id} course={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured rail */}
                {featured.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
                      <FiStar className="h-4 w-4" /> Featured courses
                    </h3>
                    <div className="space-y-3">
                      {featured.map((c) => (
                        <RailCard key={c.id} course={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
