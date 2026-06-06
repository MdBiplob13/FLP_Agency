'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';
import Navbar from '../../components/navbar/page.jsx';
import Footer from '../../components/footer/page.jsx';

const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

const teachers = [
  {
    name: 'Amina Rahman',
    role: 'Head Instructor',
    expertise: 'React · Next.js · Frontend systems',
    description: 'Builds modern web products with real teams and helps students ship portfolio-ready applications.',
    img: '/image1.jpg',
  },
  {
    name: 'Rafi Hossain',
    role: 'Curriculum Lead',
    expertise: 'Product strategy · Course design',
    description: 'Crafts lessons around real product problems so every student learns skills employers want.',
    img: '/image1.jpg',
  },
  {
    name: 'Sara Khan',
    role: 'Career Coach',
    expertise: 'Resumes · Interviews · Growth',
    description: 'Guides students through interview prep, portfolio reviews, and client-ready presentations.',
    img: '/image1.jpg',
  },
  {
    name: 'Omar Ali',
    role: 'UX Mentor',
    expertise: 'Design systems · Research',
    description: 'Reviews UX flows, usability, and accessibility with a focus on polished digital experiences.',
    img: '/image1.jpg',
  },
  {
    name: 'Dia Islam',
    role: 'Growth Mentor',
    expertise: 'Marketing · Freelance strategy',
    description: 'Teaches creators how to launch services, attract clients, and grow their brand online.',
    img: '/image1.jpg',
  },
];

export default function TeachersPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="pt-24">
        <section className="relative overflow-hidden bg-[#05060d]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_22%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
            <div className="grid gap-16 lg:grid-cols-[1fr_0.95fr] items-center">
              <AnimatedSection>
                <div className="max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Our teachers</p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
                    Learn from experienced mentors who have shipped products and scaled teams.
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-300">
                    Our instructors combine industry experience with hands-on coaching so you can build work that stands out and grow with confidence.
                  </p>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <a
                      href="/pages/courses"
                      className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl"
                    >
                      Explore courses
                    </a>
                    <a
                      href="/pages/contact"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-gray-100 transition hover:border-blue-500/30 hover:text-blue-200"
                    >
                      Talk to a mentor
                    </a>
                  </div>

                  <div className="mt-14 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                      <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Mentors</p>
                      <p className="mt-3 text-3xl font-semibold text-white">5</p>
                      <p className="mt-2 text-gray-400">Industry experts teaching every cohort.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                      <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Students guided</p>
                      <p className="mt-3 text-3xl font-semibold text-white">2.4k+</p>
                      <p className="mt-2 text-gray-400">Practical mentoring with live feedback.</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.12}>
                <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
                  <Image
                    src="/image1.jpg"
                    alt="Teacher leading a workshop"
                    width={900}
                    height={720}
                    className="h-105 w-full rounded-[1.75rem] object-cover"
                  />
                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/70 p-6">
                    <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Featured mentor</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">Amina Rahman</h2>
                    <p className="mt-2 text-gray-400">Supports students with guided code reviews, real-world demos, and portfolio feedback.</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatedSection>
              <div className="text-center mx-auto max-w-2xl pb-12">
                <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Meet the team</p>
                <h2 className="text-3xl sm:text-4xl font-bold">Instructors, mentors, and career coaches</h2>
                <p className="mt-4 text-gray-400">
                  Every teacher brings practical experience from startups, agencies, and product teams. They help you build work-ready skills and launch your next role.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {teachers.map((teacher, index) => (
                <AnimatedSection key={teacher.name} delay={0.08 * index}>
                  <div className="group rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-blue-500/20">
                    <div className="relative h-72 overflow-hidden rounded-[1.75rem] bg-white/5">
                      <Image src={teacher.img} alt={teacher.name} fill className="object-cover" />
                    </div>
                    <div className="mt-6">
                      <p className="text-sm uppercase tracking-[0.35em] text-blue-300">{teacher.role}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">{teacher.name}</h3>
                      <p className="mt-3 text-gray-400 leading-7">{teacher.description}</p>
                      <p className="mt-4 rounded-full bg-white/5 px-4 py-2 text-sm text-blue-200">{teacher.expertise}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-950/70">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-[#090a12] p-10 shadow-2xl shadow-black/40">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Why mentors matter</p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">Get the feedback and direction that accelerates your growth.</h2>
                  <p className="mt-6 text-gray-400 leading-8">
                    Our teachers do more than share lessons. They review your work, highlight what matters, and help you stay on track with career-focused guidance.
                  </p>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                      <p className="text-sm font-semibold text-white">Live feedback</p>
                      <p className="mt-2 text-gray-400">Get specific reviews on projects, interviews, and real deliverables.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                      <p className="text-sm font-semibold text-white">Career-ready advice</p>
                      <p className="mt-2 text-gray-400">Learn how to package your work, tell your story, and win clients.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                      <p className="text-sm font-semibold text-white">Industry experience</p>
                      <p className="mt-2 text-gray-400">Mentorship comes from people who have shipped real products.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                      <p className="text-sm font-semibold text-white">Small cohorts</p>
                      <p className="mt-2 text-gray-400">Focused groups make it easy to ask questions and get personalized guidance.</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <div className="rounded-4xl border border-white/10 bg-linear-to-br from-blue-950/90 to-violet-950/90 p-10 shadow-2xl shadow-black/40">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Trusted results</p>
                      <h3 className="mt-3 text-3xl font-semibold text-white">Real student success stories</h3>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                      <p className="text-lg font-semibold text-white">“The mentors helped me build a portfolio I could confidently share with clients.”</p>
                      <p className="mt-4 text-sm uppercase tracking-[0.35em] text-gray-500">Mina</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                      <p className="text-lg font-semibold text-white">“The career guidance was the difference between applying and getting hired.”</p>
                      <p className="mt-4 text-sm uppercase tracking-[0.35em] text-gray-500">Sayeed</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
