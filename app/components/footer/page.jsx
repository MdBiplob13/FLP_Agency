import React from 'react';
import { AiFillFacebook, AiOutlineInstagram, AiFillLinkedin, AiOutlineTwitter } from 'react-icons/ai';

const Footer = () => {
  return (
    <footer className="bg-slate-950/95 border-t border-white/10 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr_1fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-3">Freelancer Learning Platform</p>
              <h3 className="text-3xl font-bold text-white">Courses built for freelancers and independent creators.</h3>
            </div>
            <p className="max-w-2xl leading-7 text-gray-400">
              Learn practical skills for web development, design, marketing, and freelancing with project-led training made for fast progress.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <a href="mailto:support@flpacademy.com" className="rounded-3xl bg-white/5 px-5 py-4 text-sm text-gray-200 transition hover:bg-white/10">
                support@flpacademy.com
              </a>
              <a href="tel:+15551234567" className="rounded-3xl bg-white/5 px-5 py-4 text-sm text-gray-200 transition hover:bg-white/10">
                +1 (555) 123-4567
              </a>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <a href="#" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-blue-500/20 hover:text-white">
                <AiFillFacebook />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-pink-500/20 hover:text-white">
                <AiOutlineInstagram />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-blue-700/20 hover:text-white">
                <AiFillLinkedin />
              </a>
              <a href="#" aria-label="X" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-slate-300/20 hover:text-white">
                <AiOutlineTwitter />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Popular courses</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#featured-work" className="transition hover:text-white">Freelance Web Dev</a></li>
              <li><a href="#services" className="transition hover:text-white">UI/UX Foundations</a></li>
              <li><a href="#services" className="transition hover:text-white">Digital Marketing</a></li>
              <li><a href="#services" className="transition hover:text-white">Freelancer Growth</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="transition hover:text-white">Course catalog</a></li>
              <li><a href="#" className="transition hover:text-white">Student success</a></li>
              <li><a href="#" className="transition hover:text-white">Pricing</a></li>
              <li><a href="#" className="transition hover:text-white">Terms & privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-sm text-gray-500 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Freelancer Learning Platform. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-gray-400">
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
