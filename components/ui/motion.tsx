"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, delay = 0 }: MotionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({ children, className }: Omit<MotionProps, "delay">) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, rotateX: 1.5, rotateY: -1.5 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
