'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

export default function StackCard({ index, offset = 26, base = 130, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 160px', 'end 220px'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  return (
    <div ref={ref} className="sticky" style={{ top: `${base + index * offset}px` }}>
      <motion.div style={{ scale: reduce ? 1 : scale }} className="origin-top">
        {children}
      </motion.div>
    </div>
  );
}
