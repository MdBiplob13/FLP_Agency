'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';

// Reusable animated section wrapper
const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
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
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

export default function CoursesPage() {
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const categories = [
    { label: 'All', accent: 'from-slate-500 to-slate-600' },
    { label: 'Web Development', accent: 'from-blue-500 to-cyan-500' },
    { label: 'UI/UX Design', accent: 'from-purple-500 to-pink-500' },
    { label: 'Digital Marketing', accent: 'from-emerald-500 to-lime-500' },
    { label: 'Mobile Apps', accent: 'from-cyan-500 to-sky-500' },
    { label: 'Career Growth', accent: 'from-sky-500 to-indigo-500' },
    { label: 'Product Design', accent: 'from-fuchsia-500 to-pink-500' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const courses = [
    {
      title: 'Full-Stack Developer Bootcamp',
      category: 'Web Development',
      description: 'Build real web apps, APIs, and full-stack projects with React, Node, and databases.',
      duration: '12 weeks',
      level: 'Intermediate',
    },
    {
      title: 'Product Design Essentials',
      category: 'UI/UX Design',
      description: 'Learn how to create user flows, wireframes, and polished product interfaces.',
      duration: '8 weeks',
      level: 'Beginner',
    },
    {
      title: 'Growth Marketing Systems',
      category: 'Digital Marketing',
      description: 'Master funnels, ad campaigns, analytics, and conversion optimization.',
      duration: '10 weeks',
      level: 'Intermediate',
    },
    {
      title: 'Mobile App Fundamentals',
      category: 'Mobile Apps',
      description: 'Create mobile-first experiences for iOS and Android using modern cross-platform tools.',
      duration: '9 weeks',
      level: 'Beginner',
    },
    {
      title: 'Freelance Launchpad',
      category: 'Career Growth',
      description: 'Learn how to price services, win clients, and scale your freelance business.',
      duration: '6 weeks',
      level: 'Beginner',
    },
    {
      title: 'Advanced Product Strategy',
      category: 'Product Design',
      description: 'Turn research into product decisions and launch more effective digital experiences.',
      duration: '7 weeks',
      level: 'Advanced',
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    const matchesSearch = `${course.title} ${course.description} ${course.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesLevel && matchesSearch;
  });

  const stats = [
    { value: '24+', label: 'Live courses' },
    { value: '4.9/5', label: 'Average rating' },
    { value: '18k+', label: 'Course graduates' },
    { value: '98%', label: 'Satisfaction rate' },
  ];

  const handleHeroMouseMove = (event) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setHeroMouse({ x: x - 0.5, y: y - 0.5 });
  };

  const resetHeroMouse = () => setHeroMouse({ x: 0, y: 0 });

  return (
    <div className="bg-black text-white">
     <Navbar/>

      <section className="py-24 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-8 rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/30">
              <AnimatedSection>
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Refine your path</p>
                  <h2 className="text-3xl font-bold text-white">Filter and discover faster.</h2>
                  <p className="text-gray-400 leading-7">
                    Start with search, pick a category, and focus on the level that fits your journey.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6">
                  <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.35em] text-gray-400">Search courses</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by keyword"
                    className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Categories</p>
                      <p className="text-xs text-gray-500">Tap to filter</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="text-sm text-blue-300 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.label}
                        type="button"
                        onClick={() => setSelectedCategory(category.label)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          selectedCategory === category.label
                            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-gray-400 mb-5">Experience level</p>
                  <div className="flex flex-wrap gap-3">
                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(level)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          selectedLevel === level ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              
            </aside>

            <section className="space-y-10">
              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/20">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Course catalogue</p>
                      <h2 className="mt-4 text-4xl font-bold text-white">Choose your best match.</h2>
                      <p className="mt-4 max-w-2xl text-gray-400 leading-7">
                        {filteredCourses.length} courses are available based on your filters and keywords.
                      </p>
                    </div>
                    <div className="rounded-4xl border border-white/10 bg-slate-950/80 px-6 py-4 text-sm text-gray-300">
                      Showing {filteredCourses.length} of {courses.length} courses
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {filteredCourses.length === 0 ? (
                <AnimatedSection>
                  <div className="rounded-4xl border border-white/10 bg-black/60 p-12 text-center text-gray-300 shadow-2xl shadow-black/20">
                    <p className="text-lg font-semibold text-white">No courses found.</p>
                    <p className="mt-3 text-sm text-gray-400">Try another category or search term to discover more available courses.</p>
                  </div>
                </AnimatedSection>
              ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                  {filteredCourses.map((course, idx) => (
                    <AnimatedSection key={course.title} delay={idx * 0.06}>
                      <motion.div
                        whileHover={{ y: -8 }}
                        className="group rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20 transition-all"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-2 text-xs uppercase tracking-[0.35em] text-blue-200">
                              {course.category}
                            </span>
                            <h3 className="mt-5 text-3xl font-semibold text-white">{course.title}</h3>
                          </div>
                          <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">{course.level}</div>
                        </div>

                        <p className="mt-6 text-gray-300 leading-8">{course.description}</p>

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            {course.duration}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            className="rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
                          >
                            View course
                          </motion.button>
                        </div>
                      </motion.div>
                    </AnimatedSection>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <AnimatedSection key={stat.label} delay={idx * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="rounded-4xl border border-white/10 bg-black/60 p-8 text-center"
                >
                  <p className="text-4xl font-bold text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">{stat.value}</p>
                  <p className="mt-3 text-sm uppercase tracking-[0.22em] text-gray-400">{stat.label}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="rounded-4xl border border-white/10 bg-slate-950/90 p-12 text-center shadow-2xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Ready to learn</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Choose a course and start your next project.</h2>
              <p className="mx-auto max-w-2xl text-base leading-8 text-gray-400 mb-10">
                Take a course that fits your pace, build real work, and join a supportive community of learners.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/20 transition-all"
              >
                Start learning
              </motion.button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
