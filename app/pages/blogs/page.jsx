'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';

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
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

export default function BlogsPage() {
  const featured = {
    title: 'How to build a career-ready portfolio that stands out',
    category: 'Career',
    excerpt: 'Learn the exact framework designers and developers use to create stories, case studies, and project presentations that hire and impress.',
    author: 'Maya Khan',
    date: 'June 1, 2026',
  };

  const articles = [
    {
      title: 'Design systems for fast product launches',
      category: 'Design',
      excerpt: 'Use consistent patterns and reusable components to ship faster and keep products polished.',
      author: 'Rina Paul',
      date: 'May 24, 2026',
    },
    {
      title: 'From idea to MVP: a practical startup guide',
      category: 'Startup',
      excerpt: 'Turn your concept into a launch-ready product with a lean workflow, testing, and growth focus.',
      author: 'Sara Ahmed',
      date: 'May 18, 2026',
    },
    {
      title: 'Learning JavaScript with project-based training',
      category: 'Development',
      excerpt: 'Build meaningful projects while you learn the language, not just the syntax.',
      author: 'Arif Rahman',
      date: 'May 12, 2026',
    },
    {
      title: 'The marketing habits every creator should know',
      category: 'Marketing',
      excerpt: 'Create content, launch campaigns, and build an audience without wasting time.',
      author: 'Nadia Chowdhury',
      date: 'May 8, 2026',
    },
    {
      title: 'UX research made simple for busy teams',
      category: 'UX',
      excerpt: 'Capture feedback, validate ideas, and improve your design choices with fast research methods.',
      author: 'Tanvir Hasan',
      date: 'May 2, 2026',
    },
  ];

  const categories = ['All', 'Design', 'Development', 'Product', 'Marketing', 'Career', 'Startup'];

  const popular = [
    'How to price freelance projects',
    'Top productivity tools for remote learners',
    'A/B testing your course landing page',
  ];

  return (
    <div className="bg-black text-white">
        <Navbar/>
      <section className="relative overflow-hidden bg-[#020205]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_24%)] pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/80 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid gap-16 xl:grid-cols-[1.05fr_0.95fr] items-center">
            <AnimatedSection>
              <div className="space-y-8">
                <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Content for future freelancers
                </span>

                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white">
                  Read stories, strategies, and learning playbooks that help you grow faster.
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-gray-300">
                  The blog brings together practical guides, career advice, and design systems for makers who want more clarity, confidence, and momentum.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Latest update</p>
                    <p className="mt-4 text-2xl font-semibold text-white">Stay current</p>
                  </div>
                  <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Read time</p>
                    <p className="mt-4 text-2xl font-semibold text-white">5 min average</p>
                  </div>
                  <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Topics</p>
                    <p className="mt-4 text-2xl font-semibold text-white">Design, dev, career</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/85 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Featured article</p>
                  <div className="mt-6 space-y-6">
                    <div className="rounded-4xl bg-white/5 p-6 shadow-lg shadow-black/10">
                      <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-blue-200">
                        {featured.category}
                      </span>
                      <h2 className="mt-5 text-3xl font-semibold text-white">{featured.title}</h2>
                      <p className="mt-4 text-gray-300 leading-8">{featured.excerpt}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 text-gray-400">
                      <p>{featured.author}</p>
                      <p>{featured.date}</p>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01]">
                      Read full story
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Browse topics</p>
                    <h2 className="mt-4 text-4xl font-bold text-white">Explore insightful posts.</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <span key={category} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                {articles.map((article, idx) => (
                  <AnimatedSection key={article.title} delay={idx * 0.05}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="group rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20 transition-all"
                    >
                      <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-blue-200">
                        {article.category}
                      </span>
                      <h3 className="mt-5 text-2xl font-semibold text-white">{article.title}</h3>
                      <p className="mt-4 text-gray-300 leading-7">{article.excerpt}</p>
                      <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
                        <span>{article.author}</span>
                        <span>{article.date}</span>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            </div>

            <aside className="space-y-8">
              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Subscribe</p>
                  <h2 className="mt-4 text-3xl font-bold text-white">Never miss a post.</h2>
                  <p className="mt-4 text-gray-400 leading-7">
                    Get the latest articles and updates delivered to your inbox every week.
                  </p>
                  <div className="mt-8 space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                    />
                    <button className="w-full rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.01]">
                      Subscribe
                    </button>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Popular reads</p>
                  <div className="mt-6 space-y-4">
                    {popular.map((item) => (
                      <div key={item} className="rounded-4xl border border-white/10 bg-black/60 p-5">
                        <p className="text-sm text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Quick stats</p>
                  <div className="mt-8 grid gap-4">
                    <div className="rounded-4xl bg-slate-950/80 p-5">
                      <p className="text-3xl font-bold text-white">75+</p>
                      <p className="mt-2 text-sm text-gray-400">Published posts</p>
                    </div>
                    <div className="rounded-4xl bg-slate-950/80 p-5">
                      <p className="text-3xl font-bold text-white">22k+</p>
                      <p className="mt-2 text-sm text-gray-400">Monthly readers</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </aside>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="rounded-4xl border border-white/10 bg-slate-950/90 p-12 text-center shadow-2xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Want more insights?</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Discover more guides, tutorials, and course stories.</h2>
              <p className="mx-auto max-w-2xl text-base leading-8 text-gray-400 mb-10">
                Follow the blog for weekly updates, skills guides, and actionable advice for your career in tech and design.
              </p>
              <button className="rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.01]">
                Browse all posts
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
