'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';

export default function SpotlightCard({
  children,
  className = '',
  glow = 'rgba(99,102,241,0.18)',
  size = 240,
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

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mx}px ${my}px, ${glow}, transparent 60%)`;

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
