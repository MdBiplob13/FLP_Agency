'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiPlay,
  FiCheck,
  FiLayers,
} from 'react-icons/fi';

import Footer from '../../components/footer/page.jsx';
import CourseCountdown from '@/app/components/course/CourseCountdown.jsx';
import useCourses from '@/hooks/course/courseHook';
import useMyCourses from '@/hooks/course/myCoursesHook';
import { getCourseTiming } from '@/lib/courseTiming';

import PageHero from '@/app/components/ui/PageHero';
import Reveal from '@/app/components/motion/Reveal';
import SpotlightCard from '@/app/components/motion/SpotlightCard';
import MagneticButton from '@/app/components/motion/MagneticButton';
import Stars from '@/app/components/motion/Stars';

import CategoryGrid from '@/app/components/home/CategoryGrid';
import PlatformStats from '@/app/components/home/PlatformStats';
import LearningMethodology from '@/app/components/home/LearningMethodology';
import LearningRoadmap from '@/app/components/home/LearningRoadmap';
import FeaturedInstructors from '@/app/components/home/FeaturedInstructors';
import StudentProjects from '@/app/components/home/StudentProjects';
import SuccessStories from '@/app/components/home/SuccessStories';
import HiringPartners from '@/app/components/home/HiringPartners';
import CareerSupport from '@/app/components/home/CareerSupport';
import Certifications from '@/app/components/home/Certifications';
import CommunitySection from '@/app/components/home/CommunitySection';
import LearningOutcomes from '@/app/components/home/LearningOutcomes';
import TrustIndicators from '@/app/components/home/TrustIndicators';
import HomeFAQ from '@/app/components/home/HomeFAQ';
import InlineCTA from '@/app/components/home/InlineCTA';
import FinalCTA from '@/app/components/home/FinalCTA';
import { marquee } from '@/app/components/home/data';

const FALLBACK_IMG = '/hero-learning.svg';

function coursePrice(c) {
  if (c.priceTier === 'free') return { isFree: true, price: 0, oldPrice: null };
  if (c.priceTier === 'discounted' && c.discountPrice) {
    return { isFree: false, price: c.discountPrice, oldPrice: c.price || null };
  }
  return { isFree: false, price: c.price || 0, oldPrice: null };
}

/* -------------------------- Marquee -------------------------- */

function TrustMarquee() {
  const reduce = useReducedMotion();
  return (
    <section className="border-y border-border bg-surface py-6">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.35em] text-text-subtle">
        Skills our students master
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <motion.div
          className="flex w-max gap-4"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        >
          {[...marquee, ...marquee].map((m, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface-elevated px-5 py-2 text-sm text-text-muted"
            >
              <FiLayers className="h-4 w-4 text-primary" />
              {m}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------- Marketing hero body --------------------- */

const HERO_ROTATIONS = ['-rotate-6', 'rotate-0', 'rotate-6'];
const HERO_OFFSETS = ['-translate-y-4 lg:-translate-y-6', 'translate-y-0', '-translate-y-4 lg:-translate-y-6'];

function HeroCourseCard({ course, idx }) {
  const p = coursePrice(course);
  const badge = course.isBestseller
    ? 'Bestseller'
    : course.isFeatured
      ? 'Featured'
      : null;

  return (
    <div
      className={`relative ${HERO_ROTATIONS[idx]} ${HERO_OFFSETS[idx]} transition-transform duration-500 hover:rotate-0 hover:translate-y-0 hover:scale-[1.02]`}
    >
      <Link
        href={`/pages/courses/${course.slug || course._id}`}
        className="block cursor-pointer overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-elevated"
      >
        <div className="relative h-40 sm:h-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.thumbnail || FALLBACK_IMG}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
              {badge}
            </span>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="line-clamp-2 text-sm font-semibold text-white">
              {course.title}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Stars n={5} />
            <span className="text-xs text-text-muted">4.9</span>
          </div>
          <span className="text-base font-bold text-text">
            {p.isFree ? (
              <span className="text-success">Free</span>
            ) : (
              <>৳{p.price}</>
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}

function MarketingHeroBody({ heroCards }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Live indicator badge */}
      <Reveal duration={0.5}>
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/10 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          New cohorts open — high-income skills শিখুন
        </div>
      </Reveal>

      {/* Big headline */}
      <Reveal delay={0.1}>
        <h1 className="mt-8 max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight text-text sm:text-6xl md:text-7xl xl:text-[5.5rem]">
          Online Course Bangladesh —{' '}
          <span className="relative inline-block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            career বদলে দেওয়ার skills
            <svg
              className="absolute -bottom-1 left-0 h-3 w-full text-primary/40"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 6 Q 75 0 150 6 T 300 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.6, ease: 'easeInOut' }}
              />
            </svg>
          </span>
        </h1>
      </Reveal>

      {/* Sub */}
      <Reveal delay={0.2}>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-text-muted sm:text-xl">
          Web development, design, marketing — hands-on live classes, real mentor feedback আর industry-ready portfolio। Learn at your own pace, get hired faster।
        </p>
      </Reveal>

      {/* CTAs */}
      <Reveal delay={0.3}>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton
            href="#courses"
            as="a"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-accent/30"
          >
            Browse courses
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </MagneticButton>
          <MagneticButton
            href="#journey"
            as="a"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-8 py-4 text-base font-semibold text-text backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FiPlay className="h-4 w-4" /> How it works
          </MagneticButton>
        </div>
      </Reveal>

      {/* Social proof row */}
      <Reveal delay={0.4}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex -space-x-3">
            {['from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500', 'from-cyan-500 to-blue-500', 'from-amber-500 to-orange-500'].map(
              (g, i) => (
                <span
                  key={i}
                  className={`inline-block h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-background`}
                />
              ),
            )}
          </div>
          <div className="text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Stars n={5} />
              <span className="font-semibold text-text">4.9/5</span>
            </div>
            <span className="text-text-subtle">12,400+ happy students থেকে</span>
          </div>
        </div>
      </Reveal>

      {/* Course preview strip — 3 fanned cards */}
      {heroCards.length >= 3 && (
        <Reveal delay={0.5}>
          <div className="relative mt-16 w-full max-w-5xl">
            <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-2xl dark:from-primary/10" />
            <div className="relative grid gap-4 sm:grid-cols-3">
              {heroCards.slice(0, 3).map((c, i) => (
                <HeroCourseCard key={c._id} course={c} idx={i} />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border border-border bg-surface-elevated/70 px-4 py-1.5 text-xs font-semibold text-text-muted backdrop-blur">
                Live cohorts starting weekly
              </span>
              <span className="rounded-full border border-border bg-surface-elevated/70 px-4 py-1.5 text-xs font-semibold text-text-muted backdrop-blur">
                Verified certificates
              </span>
              <span className="rounded-full border border-border bg-surface-elevated/70 px-4 py-1.5 text-xs font-semibold text-text-muted backdrop-blur">
                Money-back guarantee
              </span>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------ Featured courses ------------------------ */

function FeaturedCourses({ courses, loading, enrolledIds, now }) {
  const reduce = useReducedMotion();

  return (
    <section id="courses" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Popular courses
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Students-এর প্রিয় courses
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Bestseller, featured আর community favourites — এক জায়গায়।
          </p>
        </Reveal>

        {loading && courses.length === 0 ? (
          <div className="grid gap-7 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
              >
                <div className="h-60 w-full animate-pulse bg-surface-muted sm:h-64" />
                <div className="space-y-4 p-7">
                  <div className="mx-auto h-5 w-2/3 animate-pulse rounded bg-surface-muted" />
                  <div className="mx-auto h-6 w-24 animate-pulse rounded bg-surface-muted" />
                  <div className="mx-auto h-10 w-48 animate-pulse rounded-full bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface p-12 text-center text-text-muted shadow-card">
            এখনও কোনো course নেই।
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-3">
            {courses.map((course, i) => {
              const p = coursePrice(course);
              const badge = course.isBestseller
                ? 'Bestseller'
                : course.isFeatured
                  ? 'Featured'
                  : null;
              return (
                <Reveal key={course._id} delay={i * 0.08}>
                  <motion.div
                    whileHover={reduce ? undefined : { y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <SpotlightCard className="flex h-full flex-col rounded-3xl border border-border bg-surface text-center shadow-card">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={course.thumbnail || FALLBACK_IMG}
                          alt={course.title}
                          className="h-60 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-64"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {badge && (
                          <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                            {badge}
                          </span>
                        )}
                        <CourseCountdown
                          course={course}
                          variant="compact"
                          className="absolute bottom-4 left-4"
                        />
                      </div>
                      <div className="flex flex-1 flex-col items-center p-7">
                        <h3 className="text-xl font-semibold leading-snug text-text">
                          {course.title}
                        </h3>
                        <div className="mt-4 flex items-baseline justify-center gap-2">
                          {p.isFree ? (
                            <span className="text-2xl font-bold text-success">Free</span>
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-text">
                                ৳{p.price}
                              </span>
                              {p.oldPrice ? (
                                <span className="text-sm text-text-subtle line-through">
                                  ৳{p.oldPrice}
                                </span>
                              ) : null}
                            </>
                          )}
                        </div>
                        <div className="mt-auto flex w-full items-center justify-center gap-3 pt-6">
                          {enrolledIds.has(String(course._id)) ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-6 py-2.5 text-sm font-semibold text-success">
                              <FiCheck className="h-4 w-4" /> Already bought
                            </span>
                          ) : (
                            (now === null || getCourseTiming(course, now).canEnroll) && (
                              <Link
                                href={`/pages/courses/${course.slug || course._id}`}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
                              >
                                Enrol now <FiArrowRight className="h-4 w-4" />
                              </Link>
                            )
                          )}
                          <Link
                            href={`/pages/courses/${course.slug || course._id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-strong bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal className="mt-12 flex justify-center">
          <Link
            href="/pages/courses"
            className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-8 py-4 text-base font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
          >
            View all courses{' '}
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ Page ============================ */

export default function Home() {
  const { courses: allCourses, coursesLoading } = useCourses({ limit: 50 });
  const { courses: myCourses } = useMyCourses();

  const enrolledIds = useMemo(
    () => new Set((myCourses || []).map((c) => String(c._id))),
    [myCourses],
  );

  const popularCourses = useMemo(() => {
    const bestseller = allCourses.find((c) => c.isBestseller);
    const featured = allCourses
      .filter((c) => c.isFeatured && c._id !== bestseller?._id)
      .slice(0, 2);
    const picked = [bestseller, ...featured].filter(Boolean);
    if (picked.length < 3) {
      const used = new Set(picked.map((c) => c._id));
      for (const c of allCourses) {
        if (picked.length >= 3) break;
        if (!used.has(c._id)) {
          picked.push(c);
          used.add(c._id);
        }
      }
    }
    return picked.slice(0, 3);
  }, [allCourses]);

  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-background text-text font-sans antialiased">
      <PageHero variant="marketing">
        <MarketingHeroBody heroCards={popularCourses} />
      </PageHero>

      <TrustMarquee />

      <CategoryGrid />

      <PlatformStats />

      <FeaturedCourses
        courses={popularCourses}
        loading={coursesLoading}
        enrolledIds={enrolledIds}
        now={now}
      />

      <LearningMethodology />

      <LearningRoadmap />

      <InlineCTA
        eyebrow="Try before you buy"
        title="Check our free courses — কোনো card, কোনো commitment না।"
        desc="Enrol করার আগে lesson quality, mentor style আর platform experience — সবটাই free-তে try করুন।"
        primaryLabel="Check our free courses"
        primaryHref="/pages/courses?price=free"
        secondaryLabel="Book a call"
        secondaryHref="/pages/contact"
      />

      <StudentProjects />

      <FeaturedInstructors />

      <CareerSupport />

      <Certifications />

      <HiringPartners />

      <SuccessStories />

      <CommunitySection />

      <LearningOutcomes />

      <TrustIndicators />

      <HomeFAQ />

      <FinalCTA />

      <Footer />
    </div>
  );
}
