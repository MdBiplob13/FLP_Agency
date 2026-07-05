"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  animate,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  FiSearch,
  FiStar,
  FiArrowRight,
  FiSliders,
  FiX,
  FiPlay,
  FiAward,
  FiCheck,
  FiHeart,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Footer from "../../components/footer/page.jsx";
import Navbar from "@/app/components/navbar/page.jsx";
import CourseCountdown from "@/app/components/course/CourseCountdown.jsx";
import useCourses from "@/hooks/course/courseHook";
import useMyCourses from "@/hooks/course/myCoursesHook";
import useWishlist from "@/hooks/course/wishlistHook";
import { getCourseTiming } from "@/lib/courseTiming";
import { authHeaders } from "@/lib/clientAuth";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

const FALLBACK_IMG = "/image1.jpg";

/* ------------------------------------------------------------------ */
/*  Map a raw API course doc to the shape this page renders            */
/* ------------------------------------------------------------------ */

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

function normalizeCourse(c) {
  // Lessons + total minutes come from the nested curriculum
  let lessons = 0;
  let minutes = 0;
  for (const section of c.curriculum || []) {
    for (const lesson of section.lessons || []) {
      lessons += 1;
      minutes += lesson.duration || 0;
    }
  }
  const hours = Math.round(minutes / 60);

  // Resolve the price the student actually pays vs. the struck-through original
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

  // Badge priority: Bestseller > Featured (homepage)
  let badge = null;
  if (c.isBestseller) badge = "Bestseller";
  else if (c.isFeatured) badge = "Featured";

  return {
    id: c._id,
    slug: c.slug || "",
    title: c.title,
    description: c.description,
    category: c.category,
    level: cap(c.level || "beginner"),
    language: c.language,
    lessons,
    hours,
    price,
    oldPrice,
    isFree,
    badge,
    img: c.thumbnail || FALLBACK_IMG,
    enrollStartDate: c.enrollStartDate || null,
    enrollEndDate: c.enrollEndDate || null,
    courseStartDate: c.courseStartDate || null,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers (shared design language)                                  */
/* ------------------------------------------------------------------ */

const easeOut = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, y = 36, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = "", duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref}>
      {Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

function SpotlightCard({
  children,
  className = "",
  glow = "rgba(99,102,241,0.18)",
}) {
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

function MagneticButton({ children, className = "", as = "a", ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  const reduce = useReducedMotion();
  const Comp = motion[as];

  function handleMove(e) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <Comp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

function Tilt3D({ children, className = "", max = 14 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  function handleMove(e) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max);
    rx.set(py * -max);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className={`[transform-style:preserve-3d] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Stars({ n = 5 }) {
  return (
    <div
      className="flex items-center gap-0.5 text-amber-400"
      aria-label={`${n} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`h-4 w-4 ${i < n ? "fill-amber-400" : "opacity-30"}`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CoursesPage() {
  const reduce = useReducedMotion();
  const router = useRouter();

  /* ---- Hero spotlight + parallax ---- */
  const heroRef = useRef(null);
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const sSpotX = useSpring(spotX, { stiffness: 120, damping: 25 });
  const sSpotY = useSpring(spotY, { stiffness: 120, damping: 25 });
  const offX = useMotionValue(0);
  const offY = useMotionValue(0);
  const sOffX = useSpring(offX, { stiffness: 80, damping: 20 });
  const sOffY = useSpring(offY, { stiffness: 80, damping: 20 });
  const orb1X = useTransform(sOffX, (v) => v * 40);
  const orb1Y = useTransform(sOffY, (v) => v * 40);
  const orb2X = useTransform(sOffX, (v) => v * -34);
  const orb2Y = useTransform(sOffY, (v) => v * -34);

  function handleHeroMove(e) {
    if (reduce || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
    offX.set((e.clientX - r.left) / r.width - 0.5);
    offY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleHeroLeave() {
    offX.set(0);
    offY.set(0);
  }
  const heroSpotlight = useMotionTemplate`radial-gradient(550px circle at ${sSpotX}px ${sSpotY}px, rgba(99,102,241,0.16), transparent 65%)`;

  /* ---- Real course data (published only, via hook) ---- */
  const {
    courses: rawCourses,
    coursesLoading,
    coursesError,
  } = useCourses({ limit: 50 });

  // Normalize the API docs into the shape the cards expect
  const courses = useMemo(
    () => (rawCourses || []).map(normalizeCourse),
    [rawCourses],
  );

  // Courses the logged-in user has already bought, so cards can swap the
  // "Enrol now" CTA for an "Already bought" badge. Empty when logged out.
  const { courses: myCourses } = useMyCourses();
  const enrolledIds = useMemo(
    () => new Set((myCourses || []).map((c) => String(c._id))),
    [myCourses],
  );

  // Courses the user has wishlisted, so the heart on each card renders filled.
  // `toggle` flips a course in/out and refetches; empty when logged out.
  const { courses: wishlistCourses, toggle: toggleWishlist } = useWishlist();
  const wishlistedIds = useMemo(
    () => new Set((wishlistCourses || []).map((c) => String(c._id))),
    [wishlistCourses],
  );
  // The course id whose heart is mid-request, so we can show a pending state.
  const [wishlistBusyId, setWishlistBusyId] = useState(null);

  async function handleToggleWishlist(courseId) {
    // Wishlisting requires a login — bounce to login (and back) if there's no token.
    const hasToken = Boolean(authHeaders().Authorization);
    if (!hasToken) {
      router.push(
        `/pages/auth/login?redirect=${encodeURIComponent("/pages/courses")}`,
      );
      return;
    }
    setWishlistBusyId(courseId);
    const result = await toggleWishlist(courseId);
    setWishlistBusyId(null);
    if (result === true) toast.success("Added to wishlist.");
    else if (result === false) toast.success("Removed from wishlist.");
    else toast.error("Could not update your wishlist.");
  }

  // Build the category list dynamically from whatever courses exist
  const categories = useMemo(() => {
    const seen = new Set();
    for (const c of courses) {
      if (c.category) seen.add(c.category);
    }
    return ["All", ...Array.from(seen).sort()];
  }, [courses]);

  // Tick once a second so cards hide/show the "Enrol now" button in lockstep
  // with the countdown. `now` starts null so SSR and the first client render
  // agree (both treat courses as enrollable) — avoids a hydration mismatch.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---- Filtering ---- */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // If the chosen category vanishes after data loads (e.g. it was unpublished),
  // treat the selection as "All" without forcing an extra render.
  const activeCategory = categories.includes(selectedCategory)
    ? selectedCategory
    : "All";

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesCategory =
          activeCategory === "All" || course.category === activeCategory;
        const matchesLevel =
          selectedLevel === "All" || course.level === selectedLevel;
        const matchesSearch =
          `${course.title} ${course.description} ${course.category}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesCategory && matchesLevel && matchesSearch;
      }),
    [courses, activeCategory, selectedLevel, searchTerm],
  );

  const hasFilters =
    searchTerm || activeCategory !== "All" || selectedLevel !== "All";
  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLevel("All");
  }

  // First bestseller in the catalogue — drives the hero preview card.
  // If several courses are flagged bestseller, only the first is shown.
  const bestseller = useMemo(
    () => courses.find((c) => c.badge === "Bestseller") || null,
    [courses],
  );

  /* ---- Live stats derived from the catalogue ---- */
  const stats = useMemo(() => {
    const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);
    const totalHours = courses.reduce((sum, c) => sum + c.hours, 0);
    const categoryCount = Math.max(0, categories.length - 1); // minus "All"
    return [
      { to: courses.length, suffix: "", label: "Live courses" },
      { to: categoryCount, suffix: "", label: "Skill tracks" },
      { to: totalLessons, suffix: "", label: "Total lessons" },
      { to: totalHours, suffix: "h", label: "Hours of content" },
    ];
  }, [courses, categories]);

  return (
    <div className="bg-background font-sans text-text antialiased">
      <Navbar />

      {/* ============================ HERO ============================ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.22),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.18),transparent_42%)]" />
        <div className="absolute inset-0 dark:bg-linear-to-b dark:from-[#020205]/0 dark:via-[#020205]/40 dark:to-[#020205]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[56px_56px]" />
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ background: heroSpotlight }}
            className="pointer-events-none absolute inset-0"
          />
        )}
        <motion.div
          aria-hidden
          style={{ x: orb1X, y: orb1Y }}
          className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
        />
        <motion.div
          aria-hidden
          style={{ x: orb2X, y: orb2Y }}
          className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-[110px]"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="space-y-8"
          >
            <span className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-blue-200/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              24+ expert-led courses
            </span>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl md:text-6xl xl:text-7xl">
              Find the course that{" "}
              <span className="bg-linear-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                launches your career.
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-text-muted">
              Browse project-based courses across development, design, and
              marketing. Filter by topic and level to find your perfect match.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticButton
                href="#catalogue"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25"
              >
                Explore catalogue
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <span className="flex items-center gap-2 text-sm text-text-muted">
                <Stars n={5} />{" "}
                <span className="font-semibold text-text">4.9/5</span> from
                18k+ graduates
              </span>
            </div>
          </motion.div>

          {/* hero 3D course preview — the catalogue's first bestseller */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}
          >
            <Tilt3D>
              <SpotlightCard className="rounded-4xl border border-border bg-surface-elevated p-4 shadow-2xl shadow-black/50 backdrop-blur-xl cursor-pointer">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-border">
                  <img
                    src={bestseller?.img || FALLBACK_IMG}
                    alt={
                      bestseller ? bestseller.title : "Featured course preview"
                    }
                    className="h-56 w-full object-cover sm:h-64"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

                  {bestseller && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">
                      <FiAward className="h-3 w-3" /> Bestseller
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2 pt-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary">
                    {bestseller ? bestseller.category : "Featured course"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-text">
                    {bestseller
                      ? bestseller.title
                      : "Discover your next course"}
                  </h2>
                  <div className="mt-3 flex items-center justify-end">
                    <div className="flex items-baseline gap-2">
                      {bestseller ? (
                        bestseller.isFree ? (
                          <span className="text-2xl font-bold text-success">
                            Free
                          </span>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-text">
                              ৳{bestseller.price}
                            </span>
                            {bestseller.oldPrice ? (
                              <span className="text-sm text-text-subtle line-through">
                                ৳{bestseller.oldPrice}
                              </span>
                            ) : null}
                          </>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ============================ CATALOGUE ============================ */}
      <section id="catalogue" className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
            {/* sidebar filters */}
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <Reveal>
                <SpotlightCard className="space-y-8 rounded-3xl border border-border bg-surface p-8">
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-primary">
                    <FiSliders className="h-4 w-4" /> Refine
                  </div>

                  {/* search */}
                  <label className="relative block">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search courses…"
                      className="w-full rounded-full border border-border bg-surface-elevated/80 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>

                  {/* categories — full-width list so long labels breathe */}
                  <div className="border-t border-border pt-7">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-text-subtle">
                      Category
                    </p>
                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const active = activeCategory === cat;
                        const count =
                          cat === "All"
                            ? courses.length
                            : courses.filter((c) => c.category === cat).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                              active
                                ? "bg-linear-to-r from-primary to-accent text-white shadow-lg shadow-primary/20"
                                : "border border-border bg-surface-muted text-text-muted hover:border-primary/30 hover:text-primary"
                            }`}
                          >
                            <span>{cat}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-surface-muted text-text-muted"}`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* levels */}
                  <div className="border-t border-border pt-7">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-text-subtle">
                      Level
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {levels.map((lvl) => {
                        const active = selectedLevel === lvl;
                        return (
                          <button
                            key={lvl}
                            onClick={() => setSelectedLevel(lvl)}
                            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? "bg-primary text-primary-fg ring-1 ring-primary/30"
                                : "border border-border bg-surface-muted text-text-muted hover:bg-surface-muted"
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {hasFilters && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={resetFilters}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary"
                      >
                        <FiX className="h-4 w-4" /> Clear all filters
                      </motion.button>
                    )}
                  </AnimatePresence>
                </SpotlightCard>
              </Reveal>
            </aside>

            {/* course grid */}
            <div>
              <Reveal className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-primary">
                    Course catalogue
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Choose your best match
                  </h2>
                </div>
                <span className="flex-none rounded-full border border-border bg-surface-muted px-4 py-2 text-sm text-text-muted">
                  {filteredCourses.length} of {courses.length}
                </span>
              </Reveal>

              {/* Loading skeleton */}
              {coursesLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[22rem] animate-pulse rounded-3xl border border-border bg-surface"
                    >
                      <div className="h-40 rounded-t-3xl bg-surface-muted" />
                      <div className="space-y-3 p-6">
                        <div className="h-3 w-1/3 rounded bg-surface-muted" />
                        <div className="h-4 w-2/3 rounded bg-surface-muted" />
                        <div className="h-3 w-full rounded bg-surface-muted" />
                        <div className="h-3 w-4/5 rounded bg-surface-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : coursesError ? (
                <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-12 text-center">
                  <FiX className="mx-auto h-10 w-10 text-danger" />
                  <p className="mt-4 text-lg font-semibold text-white">
                    Couldn’t load courses
                  </p>
                  <p className="mt-1 text-text-muted">{coursesError}</p>
                </div>
              ) : (
                <>
                  <motion.div layout className="grid gap-6 md:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                      {filteredCourses.map((course, idx) => (
                        <motion.div
                          key={course.id}
                          layout
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            duration: 0.4,
                            delay: reduce ? 0 : idx * 0.04,
                            ease: easeOut,
                          }}
                        >
                          <motion.div
                            whileHover={reduce ? undefined : { y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                          >
                            <SpotlightCard className="flex h-full flex-col rounded-3xl border border-border bg-surface shadow-xl shadow-black/20">
                              {/* Large image */}
                              <div className="relative overflow-hidden rounded-t-3xl">
                                <img
                                  src={course.img}
                                  alt={course.title}
                                  className="h-60 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-64"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                                <CourseCountdown
                                  course={course}
                                  variant="compact"
                                  className="absolute bottom-3 left-3"
                                />
                                {/* Wishlist toggle */}
                                <button
                                  onClick={() => handleToggleWishlist(course.id)}
                                  disabled={wishlistBusyId === course.id}
                                  aria-label={
                                    wishlistedIds.has(course.id)
                                      ? "Remove from wishlist"
                                      : "Add to wishlist"
                                  }
                                  aria-pressed={wishlistedIds.has(course.id)}
                                  className={`absolute right-3 top-3 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur transition-colors disabled:opacity-50 ${
                                    wishlistedIds.has(course.id)
                                      ? "border-rose-400/40 bg-rose-500/20 text-danger hover:bg-rose-500/30"
                                      : "border-border-strong bg-black/40 text-white hover:bg-black/60"
                                  }`}
                                >
                                  <FiHeart
                                    className={`h-4.5 w-4.5 ${wishlistedIds.has(course.id) ? "fill-rose-400" : ""}`}
                                  />
                                </button>
                              </div>

                              {/* Title + price + actions only */}
                              <div className="flex flex-1 flex-col p-6">
                                <h3 className="text-lg font-semibold leading-snug text-white">
                                  {course.title}
                                </h3>

                                <div className="mt-3 flex items-baseline gap-2">
                                  {course.isFree ? (
                                    <span className="text-2xl font-bold text-success">
                                      Free
                                    </span>
                                  ) : (
                                    <>
                                      <span className="text-2xl font-bold text-white">
                                        ৳{course.price}
                                      </span>
                                      {course.oldPrice ? (
                                        <span className="text-sm text-text-subtle line-through">
                                          ৳{course.oldPrice}
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </div>

                                <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row">
                                  <Link
                                    href={`/pages/courses/${course.slug || course.id}`}
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-muted px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-blue-500/30 transition-colors hover:bg-surface-muted hover:text-white"
                                  >
                                    View course
                                  </Link>
                                  {enrolledIds.has(course.id) ? (
                                    /* Already purchased — show status, not a buy CTA */
                                    <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-success/25">
                                      <FiCheck className="h-4 w-4" />
                                      Already bought
                                    </span>
                                  ) : (
                                    /* Only offer "Enrol now" while enrollment is actually open */
                                    (now === null || getCourseTiming(course, now).canEnroll) && (
                                      <Link
                                        href={`/pages/courses/${course.slug || course.id}`}
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
                                      >
                                        Enrol now{" "}
                                        <FiArrowRight className="h-4 w-4" />
                                      </Link>
                                    )
                                  )}
                                </div>
                              </div>
                            </SpotlightCard>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {filteredCourses.length === 0 && (
                    <div className="rounded-3xl border border-border bg-surface p-12 text-center">
                      <FiSearch className="mx-auto h-10 w-10 text-text-subtle" />
                      <p className="mt-4 text-lg font-semibold text-white">
                        No courses found
                      </p>
                      <p className="mt-1 text-text-muted">
                        {courses.length === 0
                          ? "No courses have been published yet. Check back soon."
                          : "Try another category, level, or search term."}
                      </p>
                      {hasFilters && (
                        <button
                          onClick={resetFilters}
                          className="mt-6 rounded-full border border-border-strong bg-surface-muted px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          Reset filters
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <SpotlightCard className="rounded-3xl border border-border bg-surface p-8 text-center">
                  <p className="bg-linear-to-r from-primary to-accent bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                    {s.display ? s.display : <CountUp to={s.to} />}
                    {s.suffix}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-text-muted">
                    {s.label}
                  </p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SpotlightCard
              glow="rgba(99,102,241,0.25)"
              className="relative rounded-[2.5rem] border border-border bg-linear-to-br from-primary/10 via-surface-elevated to-accent/10 p-10 text-center shadow-elevated dark:from-blue-600/15 dark:via-slate-950/70 dark:to-purple-600/15 dark:shadow-2xl dark:shadow-black/40 sm:p-16"
            >
              <div className="pointer-events-none absolute inset-0 hidden opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px] dark:block" />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl">
                  Choose a course and start your next project
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-muted">
                  Learn at your own pace, build real work, and join a supportive
                  community of learners.
                </p>
                <div className="mt-10 flex justify-center">
                  <MagneticButton
                    href="#catalogue"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-10 py-4 text-base font-semibold text-white shadow-xl shadow-primary/30"
                  >
                    Start learning
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
