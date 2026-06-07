'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const container = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function Stagger({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {Array.isArray(children)
        ? children.map((child, i) => <motion.div key={i} variants={item}>{child}</motion.div>)
        : <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  );
}
