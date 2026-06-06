
'use client';

import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';

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
				hidden: { opacity: 0, y: 24 },
				visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay } },
			}}
		>
			{children}
		</motion.div>
	);
};

export default function About() {
	const values = [
		{ title: 'Practical projects', desc: 'Real-world work you can show employers.' },
		{ title: 'Mentor-led', desc: 'Guidance from industry experts and active feedback.' },
		{ title: 'Career focus', desc: 'Resume, interview and portfolio support.' },
		{ title: 'Community', desc: 'Peer network and study groups for consistency.' },
	];

	const team = [
		{ name: 'Amina Rahman', role: 'Head Instructor', img: '/image1.jpg' },
		{ name: 'Rafi Hossain', role: 'Curriculum Lead', img: '/image1.jpg' },
		{ name: 'Sara Khan', role: 'Student Success', img: '/image1.jpg' },
	];

	return (
		<div className="bg-black text-white">
            <Navbar/>
			{/* Hero */}
			<section className="relative overflow-hidden bg-gradient-to-b from-[#07070a] to-black">
				<div className="max-w-6xl mx-auto px-6 py-24">
					<div className="grid gap-12 lg:grid-cols-2 items-center">
						<AnimatedSection>
							<div>
								<p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">About us</p>
								<h1 className="text-4xl sm:text-5xl font-bold leading-tight">We teach practical skills that launch careers</h1>
								<p className="mt-6 text-lg text-gray-300 max-w-xl">
									Our mission is to provide fast, focused, and hands-on training designed for people who want
									to build job-ready skills. Courses combine live mentorship, portfolio projects, and career support.
								</p>

								<div className="mt-8 flex gap-4">
									<a href="/pages/courses/page.jsx" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow">
										View courses
									</a>
									<a href="/pages/contact/page.jsx" className="rounded-full border border-white/10 px-6 py-3 text-gray-200">
										Contact us
									</a>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection delay={0.14}>
							<div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 p-4 shadow-xl">
								<img src="/image1.jpg" alt="Our classroom" className="w-full h-72 object-cover transition-transform hover:scale-105" />
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Mission + Values */}
			<section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<AnimatedSection>
						<div className="text-center mb-12">
							<p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Our approach</p>
							<h2 className="text-3xl sm:text-4xl font-bold">Learn by building — from day one</h2>
							<p className="mt-4 max-w-2xl mx-auto text-gray-400">
								We design curricula around projects that mirror real product problems so you graduate with
								demonstrable work and the confidence to ship.
							</p>
						</div>
					</AnimatedSection>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{values.map((v) => (
							<AnimatedSection key={v.title} delay={0.06}>
								<div className="rounded-xl border border-white/8 bg-black/40 p-6 text-center h-full">
									<h3 className="text-xl font-semibold text-white mb-2">{v.title}</h3>
									<p className="text-gray-400">{v.desc}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Team */}
			<section className="py-20 bg-slate-950/70">
				<div className="max-w-6xl mx-auto px-6">
					<AnimatedSection>
						<div className="text-center mb-10">
							<p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Meet the team</p>
							<h2 className="text-3xl sm:text-4xl font-bold">Instructors & support</h2>
						</div>
					</AnimatedSection>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{team.map((m) => (
							<AnimatedSection key={m.name} delay={0.06}>
								<div className="rounded-2xl border border-white/10 bg-black/50 p-6 text-center">
									<div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full border border-white/6">
										<img src={m.img} alt={m.name} className="w-full h-full object-cover" />
									</div>
									<h3 className="text-xl font-semibold">{m.name}</h3>
									<p className="mt-1 text-sm text-gray-400">{m.role}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<AnimatedSection>
						<div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#07102a]/80 to-[#1b0438]/80 p-12 text-center">
							<h3 className="text-2xl font-bold mb-4">Ready to build something real?</h3>
							<p className="text-gray-400 max-w-2xl mx-auto mb-8">Join a cohort, build projects, and get career support from mentors.</p>
							<div className="flex justify-center gap-4">
								<a href="/pages/courses/page.jsx" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white">
									Browse courses
								</a>
								<a href="/pages/contact/page.jsx" className="rounded-full border border-white/10 px-8 py-3 text-gray-200">
									Get in touch
								</a>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			<Footer />
		</div>
	);
}

