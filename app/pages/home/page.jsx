'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Footer from '../../components/footer/page.jsx';

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

export default function Home() {
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const stats = [
    { value: '12k+', label: 'Students enrolled' },
    { value: '98%', label: 'Course completion' },
    { value: '24/7', label: 'Student support' },
    { value: '50+', label: 'Mentors available' },
  ];

  const services = [
    { icon: '👨‍💻', title: 'Web Development', desc: 'Build real websites, landing pages, and full-stack apps from scratch.' },
    { icon: '🎨', title: 'UI/UX Design', desc: 'Design sharp product experiences that delight users and boost conversions.' },
    { icon: '📈', title: 'Digital Marketing', desc: 'Master ads, social growth, email funnels, and audience building.' },
    { icon: '🧠', title: 'Career Coaching', desc: 'Get resume review, interview prep, and portfolio guidance from experts.' },
    { icon: '📱', title: 'Mobile Apps', desc: 'Create mobile-first experiences for iOS and Android using modern tools.' },
    { icon: '💼', title: 'Freelancing', desc: 'Learn how to price services, win clients, and scale your freelance business.' },
  ];

  const projects = [
    { title: 'Full-Stack Web Development', category: 'Web Development', img: '/image1.jpg' },
    { title: 'Product Design Masterclass', category: 'UI/UX Design', img: '/image1.jpg' },
    { title: 'Growth Marketing Bootcamp', category: 'Digital Marketing', img: '/image1.jpg' },
    { title: 'Freelance Launchpad', category: 'Career', img: '/image1.jpg' },
  ];

  const testimonials = [
    {
      quote: 'The web development course helped me land a job in 6 weeks. The projects were practical and the support was excellent.',
      name: 'Sara Ahmed',
      role: 'Junior Web Developer',
    },
    {
      quote: 'I launched my freelance design business after completing the UX course. The mentors gave me real feedback that mattered.',
      name: 'Rina Paul',
      role: 'Freelance Designer',
    },
  ];

  const [carouselPosition, setCarouselPosition] = useState(0);
  const [isCarouselAnimating, setIsCarouselAnimating] = useState(true);
  const [slideWidth, setSlideWidth] = useState(100);
  const carouselTestimonials = [...testimonials, ...testimonials];

  useEffect(() => {
    const updateSlideWidth = () => {
      setSlideWidth(window.innerWidth >= 1024 ? 50 : 100);
    };

    updateSlideWidth();
    window.addEventListener('resize', updateSlideWidth);
    return () => window.removeEventListener('resize', updateSlideWidth);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselPosition((prev) => prev + 1);
      setIsCarouselAnimating(true);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carouselPosition === testimonials.length) {
      const resetTimeout = setTimeout(() => {
        setIsCarouselAnimating(false);
        setCarouselPosition(0);
      }, 820);
      return () => clearTimeout(resetTimeout);
    }
  }, [carouselPosition, testimonials.length]);

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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#020205]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_24%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black" />

        <div
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={resetHeroMouse}
          className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28"
        >
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Innovative digital design with motion-led storytelling
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-white">
                Learn high-income skills with practical online courses.
              </h1>

              <p className="max-w-2xl text-lg md:text-xl leading-8 text-gray-300">
                Master business, design, development, and marketing with expert-led lessons, hands-on projects, and career support.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <motion.a
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  href="#featured-work"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition-all"
                >
                  Browse courses
                </motion.a>
                <motion.a
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  href="#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-colors hover:border-blue-500/30 hover:text-blue-300"
                >
                  Start learning
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="relative rounded-[2.25rem] border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              <motion.div
                style={{ x: heroMouse.x * 16, y: heroMouse.y * 16 }}
                className="pointer-events-none absolute -top-8 -left-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl"
              />
              <motion.div
                style={{ x: heroMouse.x * -14, y: heroMouse.y * -14 }}
                className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-purple-500/20 blur-3xl"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-blue-300 mb-4">Top course</p>
                  <h2 className="text-2xl font-semibold text-white mb-3">Full-stack developer bootcamp</h2>
                  <p className="text-sm leading-7 text-gray-400">
                    Learn real-world web development with hands-on projects, mentorship, and career-ready portfolio work.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Learning outcome</p>
                      <p className="mt-2 text-3xl font-semibold text-white">Job-ready skills</p>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-3 py-2 text-sm text-blue-200">Career</span>
                  </div>
                  <p className="text-sm leading-7 text-gray-400">
                    Learn with expert instructors, live updates, and practical exercises designed for fast progress.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90">
                <img src="/image1.jpg" alt="Digital project showcase" className="w-full h-72 object-cover transition duration-500 hover:scale-105" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">What you will learn</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Skill-building online courses for modern careers.
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-400">
                Explore expert-guided lessons, project work, and mentorship designed to help you launch or level up your career.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, idx) => (
              <AnimatedSection key={service.title} delay={idx * 0.08}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-7 shadow-xl shadow-black/20 transition-all"
                >
                  <div className="text-4xl mb-5">{service.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{service.title}</h3>
                  <p className="text-gray-400 leading-7">{service.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <AnimatedSection key={stat.label} delay={idx * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="rounded-[2rem] border border-white/10 bg-black/60 p-8 text-center"
                >
                  <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.22em] text-gray-400">{stat.label}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section id="featured-work" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Popular courses</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Courses students love for career growth.</h2>
            </div>
          </AnimatedSection>

          <div className="grid gap-8 lg:grid-cols-2">
            {projects.map((project, idx) => (
              <AnimatedSection key={project.title} delay={idx * 0.08}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/20"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={project.img}
                      alt={project.title}
                      className="w-full h-80 object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-2">{project.category}</p>
                      <h3 className="text-2xl font-semibold">{project.title}</h3>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Student reviews</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Hear how learners transformed their careers.</h2>
            </div>
          </AnimatedSection>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-4 shadow-2xl shadow-black/30">
            <motion.div
              animate={{ x: `-${carouselPosition * slideWidth}%` }}
              transition={{ duration: isCarouselAnimating ? 0.8 : 0, ease: 'easeInOut' }}
              className="flex w-full"
            >
              {carouselTestimonials.map((testimonial, idx) => (
                <div key={`${testimonial.name}-${idx}`} className="flex-none w-full lg:w-1/2 px-3">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="h-full min-h-[20rem] rounded-[2rem] border border-white/10 bg-black/60 p-10 shadow-2xl shadow-black/20"
                  >
                    <div className="text-5xl text-blue-500 mb-6">“</div>
                    <p className="text-gray-300 italic leading-relaxed text-lg">{testimonial.quote}</p>
                    <div className="mt-20">
                      <p className="text-xl font-semibold text-white">{testimonial.name}</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-gray-500">{testimonial.role}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-12 text-center shadow-2xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Ready to learn</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Start your next course and grow your career.</h2>
              <p className="mx-auto max-w-2xl text-base leading-8 text-gray-400 mb-10">
                Choose a course, learn at your own pace, and get career guidance from our expert instructors.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/20 transition-all"
              >
                Join a course
              </motion.button>
            </div>
          </AnimatedSection>
        </div>
      </section>
      <Footer />
    </div>
  );
}
