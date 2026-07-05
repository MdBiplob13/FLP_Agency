'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

export default function MagneticButton({
  children,
  className = '',
  as = 'a',
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  const reduce = useReducedMotion();
  const Comp = motion[as];

  function handleMove(e) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <Comp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={`cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
