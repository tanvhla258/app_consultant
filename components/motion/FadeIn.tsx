'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<'div'> & { delay?: number };

export function FadeIn({ delay = 0, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
