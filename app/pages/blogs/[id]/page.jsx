"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiCalendar,
  FiUser,
  FiEye,
  FiTag,
  FiBookOpen,
  FiX,
} from "react-icons/fi";
import Navbar from "@/app/components/navbar/page.jsx";
import Footer from "@/app/components/footer/page.jsx";
import useBlog from "@/hooks/blog/singleBlogHook";

const FALLBACK_IMG = "/image1.jpg";
const easeOut = [0.22, 1, 0.36, 1];

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
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

// Initials fallback when an author has no photo
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function AuthorBadge({ author, date, readTime }) {
  return (
    <div className="flex items-center gap-3">
      {author?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.photo}
          alt={author.name}
          className="h-11 w-11 flex-none rounded-full object-cover ring-2 ring-blue-500/30"
        />
      ) : (
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
          {initials(author?.name) || "F"}
        </span>
      )}
      <div className="text-sm">
        <p className="font-semibold text-white">{author?.name || "FLP Agency"}</p>
        <p className="flex items-center gap-2 text-slate-400">
          {date}
          <span className="text-slate-600">·</span>
          <span className="inline-flex items-center gap-1">
            <FiClock className="h-3.5 w-3.5" /> {readTime || 1} min read
          </span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Related post card                                                 */
/* ------------------------------------------------------------------ */

function RelatedCard({ blog }) {
  return (
    <Link href={`/pages/blogs/${blog._id}`} className="group block">
      <SpotlightCard className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-3 transition-colors hover:border-blue-500/30">
        <div className="relative h-20 w-24 flex-none overflow-hidden rounded-xl">
          <img
            src={blog.coverImage || FALLBACK_IMG}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-between py-0.5">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-blue-200">
            {blog.title}
          </h4>
          <span className="text-xs text-slate-400">{blog.category}</span>
        </div>
      </SpotlightCard>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function BlogDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const { blog, relatedBlogs, blogLoading, blogError } = useBlog(id);

  return (
    <div className="min-h-screen bg-[#020205] font-sans text-slate-100 antialiased">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(79,70,229,0.18),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.14),transparent_42%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-20 lg:pt-32">
        {/* Back */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/pages/blogs")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to blog
          </button>
        </div>

        {/* ---- Loading ---- */}
        {blogLoading ? (
          <div className="space-y-6">
            <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60 sm:h-96" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ) : blogError || !blog ? (
          /* ---- Error / not found ---- */
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-12 text-center">
            <FiX className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-white">
              {blogError || "Post not found"}
            </p>
            <p className="mt-1 text-slate-400">
              The article you’re looking for may have been moved or unpublished.
            </p>
            <Link
              href="/pages/blogs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Browse all posts <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* ---- Article ---- */
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">
                  <FiTag className="h-3 w-3" /> {blog.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <FiCalendar className="h-4 w-4 text-blue-300" /> {formatDate(blog.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <FiEye className="h-4 w-4 text-blue-300" /> {(blog.views || 0).toLocaleString()} views
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="mt-5 text-lg leading-8 text-slate-300">{blog.excerpt}</p>
              )}

              <div className="mt-6 flex items-center gap-3 border-y border-white/5 py-5">
                {blog.author?.photo ? (
                  <img
                    src={blog.author.photo}
                    alt={blog.author.name}
                    className="h-11 w-11 flex-none rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                ) : (
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                    {initials(blog.author?.name) || "F"}
                  </span>
                )}
                <div className="text-sm">
                  <p className="flex items-center gap-1.5 font-semibold text-white">
                    <FiUser className="h-3.5 w-3.5 text-blue-300" /> {blog.author?.name || "FLP Agency"}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-400">
                    <FiClock className="h-3.5 w-3.5" /> {blog.readTime || 1} min read
                  </p>
                </div>
              </div>
            </header>

            {/* Cover */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <img
                src={blog.coverImage || FALLBACK_IMG}
                alt={blog.title}
                className="h-72 w-full object-cover sm:h-[26rem]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            </div>

            {/* Body */}
            <div className="mt-10 whitespace-pre-line text-lg leading-8 text-slate-300">
              {blog.content}
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {blog.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Author footer */}
            <div className="mt-12 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <AuthorBadge author={blog.author} date={formatDate(blog.createdAt)} readTime={blog.readTime} />
            </div>

            {/* Related */}
            {relatedBlogs.length > 0 && (
              <section className="mt-16">
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
                  <FiBookOpen className="h-5 w-5 text-blue-300" /> Related reads
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedBlogs.map((r) => (
                    <RelatedCard key={r._id} blog={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Back to all */}
            <div className="mt-14 flex justify-center">
              <Link
                href="/pages/blogs"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
              >
                Read more articles <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
}
