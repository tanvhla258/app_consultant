'use client';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export function Reveal({ className, children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
