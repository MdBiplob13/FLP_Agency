'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { easeOut } from './easings';

export default function Reveal({
  children,
  delay = 0,
  y = 36,
  duration = 0.7,
  amount = 0.25,
  className = '',
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
