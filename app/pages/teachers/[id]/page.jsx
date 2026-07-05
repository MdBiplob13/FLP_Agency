"use client";

import { use, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiCheck,
  FiX,
  FiLinkedin,
  FiFacebook,
  FiInstagram,
} from "react-icons/fi";
import Navbar from "@/app/components/navbar/page.jsx";
import Footer from "@/app/components/footer/page.jsx";
import useTeacher from "@/hooks/teacher/singleTeacherHook";

const FALLBACK_IMG = "/image1.jpg";
const easeOut = [0.22, 1, 0.36, 1];

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return "—";
  }
}

/** Resolve a course doc into a display price ({ isFree, price, oldPrice }). */
function coursePrice(c) {
  if (c.priceTier === "free") return { isFree: true, price: 0, oldPrice: null };
  if (c.priceTier === "discounted" && c.discountPrice) {
    return { isFree: false, price: c.discountPrice, oldPrice: c.price || null };
  }
  return { isFree: false, price: c.price || 0, oldPrice: null };
}

/* ------------------------------------------------------------------ */
/*  Shared design helpers (same language as the teachers list page)   */
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

function Tilt3D({ children, className = "", max = 12 }) {
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
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`h-4 w-4 ${i < n ? "fill-amber-400" : "opacity-30"}`} />
      ))}
    </div>
  );
}

function Socials({ links, className = "text-text-muted" }) {
  const items = [
    { href: links?.linkedin, Icon: FiLinkedin },
    { href: links?.facebook, Icon: FiFacebook },
    { href: links?.instagram, Icon: FiInstagram },
  ].filter((s) => s.href);

  if (!items.length) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map(({ href, Icon }, i) => (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Social profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted ring-1 ring-border transition-colors hover:bg-blue-600 hover:text-white"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course card for the "Courses by …" rail                           */
/* ------------------------------------------------------------------ */

function CourseCard({ course }) {
  const p = coursePrice(course);
  return (
    <Link href={`/pages/courses/${course.slug || course._id}`} className="group block h-full">
      <SpotlightCard className="flex h-full flex-col rounded-3xl border border-border bg-surface shadow-xl shadow-black/20 transition-colors hover:border-primary/30">
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={course.thumbnail || FALLBACK_IMG}
            alt={course.title}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
          {course.category && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">
              {course.category}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 flex-1 text-lg font-semibold leading-snug text-white group-hover:text-primary">
            {course.title}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <FiUsers className="h-3.5 w-3.5 text-primary" />
              {(course.studentsEnrolled || []).length.toLocaleString()} enrolled
            </span>
            {p.isFree ? (
              <span className="text-base font-bold text-success">Free</span>
            ) : (
              <span className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white">৳{p.price}</span>
                {p.oldPrice ? (
                  <span className="text-xs text-text-subtle line-through">৳{p.oldPrice}</span>
                ) : null}
              </span>
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

export default function TeacherDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const reduce = useReducedMotion();

  const { teacher, teacherCourses, teacherLoading, teacherError } = useTeacher(id);

  const studentsReached = useMemo(
    () =>
      (teacherCourses || []).reduce(
        (sum, c) => sum + (c.studentsEnrolled || []).length,
        0,
      ),
    [teacherCourses],
  );

  const firstName = teacher?.name?.split(" ")[0] || "this mentor";

  const stats = [
    { icon: FiBookOpen, label: "Courses", value: (teacherCourses || []).length },
    { icon: FiUsers, label: "Students reached", value: studentsReached.toLocaleString() },
    { icon: FiCalendar, label: "Member since", value: formatDate(teacher?.createdAt) },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-text antialiased">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(79,70,229,0.18),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.14),transparent_42%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20 lg:pt-32">
        {/* Back */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/pages/teachers")}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to teachers
          </button>
        </div>

        {/* ---- Loading ---- */}
        {teacherLoading ? (
          <div className="grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-[2rem] border border-border bg-surface" />
            <div className="space-y-6">
              <div className="h-10 w-2/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
                <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
                <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
              </div>
            </div>
          </div>
        ) : teacherError || !teacher ? (
          /* ---- Error / not found ---- */
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-12 text-center">
            <FiX className="mx-auto h-10 w-10 text-danger" />
            <p className="mt-4 text-lg font-semibold text-white">
              {teacherError || "Teacher not found"}
            </p>
            <p className="mt-1 text-text-muted">
              The mentor you’re looking for may no longer be available.
            </p>
            <Link
              href="/pages/teachers"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white"
            >
              Meet all teachers <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* ---- Teacher detail ---- */
          <>
            <div className="grid items-start gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
              {/* ===== LEFT: profile card ===== */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOut }}
                className="lg:sticky lg:top-28"
              >
                <Tilt3D>
                  <SpotlightCard className="rounded-[2rem] border border-border bg-surface-elevated p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="relative overflow-hidden rounded-[1.4rem] border border-border">
                      <img
                        src={teacher.photo || FALLBACK_IMG}
                        alt={teacher.name}
                        className="h-80 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                      {teacher.isFeatured && (
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white">
                          <FiStar className="h-3 w-3 fill-white" /> Featured mentor
                        </span>
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-2xl font-semibold text-white">{teacher.name}</h1>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                          <FiMapPin className="h-3.5 w-3.5 text-primary" />
                          {teacher.address || "Location not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
                      <div className="flex items-center gap-2">
                        <Stars n={5} />
                        <span className="text-sm text-text-muted">4.9</span>
                      </div>
                      <Socials links={teacher.socialLinks} />
                    </div>
                  </SpotlightCard>
                </Tilt3D>
              </motion.div>

              {/* ===== RIGHT: bio, stats, CTA ===== */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
                className="space-y-10"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-primary">Instructor</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Learn directly from {teacher.name}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
                    {firstName} mentors students with hands-on, industry-tested guidance —
                    reviewing real work, sharing career-ready advice, and helping you build
                    skills and a portfolio that stand out.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {stats.map((s) => (
                    <SpotlightCard
                      key={s.label}
                      className="rounded-2xl border border-border bg-surface p-5 text-center"
                    >
                      <s.icon className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-text-subtle">{s.label}</p>
                    </SpotlightCard>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/pages/courses"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
                  >
                    Explore courses
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/pages/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-muted px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Talk to a mentor
                  </Link>
                </div>

                {/* Trust strip */}
                <ul className="grid gap-3 border-t border-border pt-6 text-sm text-text-muted sm:grid-cols-2">
                  {[
                    "Live feedback on real projects",
                    "Career-ready guidance",
                    "Industry experience",
                    "Small, focused cohorts",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <FiCheck className="h-4 w-4 flex-none text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* ===== Courses by this teacher ===== */}
            <section className="mt-20">
              <div className="flex items-end justify-between gap-4">
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
                  <FiAward className="h-5 w-5 text-primary" /> Courses by {firstName}
                </h2>
                {teacherCourses.length > 0 && (
                  <span className="text-sm text-text-muted">
                    {teacherCourses.length} course{teacherCourses.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {teacherCourses.length > 0 ? (
                <div className="mt-7 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                  {teacherCourses.map((course, i) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.06, ease: easeOut }}
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-3xl border border-border bg-surface p-12 text-center">
                  <FiBookOpen className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-4 text-lg font-semibold text-white">No published courses yet</p>
                  <p className="mt-2 text-sm text-text-muted">
                    {firstName} hasn’t published a course yet. Browse the full catalogue in the meantime.
                  </p>
                  <Link
                    href="/pages/courses"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white"
                  >
                    Browse all courses <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
