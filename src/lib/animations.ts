// Premium Motion Design System for EVOLW
// Uses physical spring physics rather than standard easing curves for a more natural, believable feel.

import type { Variants, Transition } from "framer-motion";

// Premium Spring Easing
// These springs are designed to feel elegant and heavy, avoiding the "bouncy" or "flashy" feel.
export const spring: Record<string, Transition> = {
  gentle: { type: "spring", mass: 1, stiffness: 100, damping: 20 },
  smooth: { type: "spring", mass: 1, stiffness: 80, damping: 25 },
  slow: { type: "spring", mass: 1.5, stiffness: 50, damping: 20 },
  snappy: { type: "spring", mass: 0.5, stiffness: 150, damping: 15 }
};

// Premium Cubic Bezier (for opacity/color transitions where springs aren't appropriate)
export const ease = {
  premium: [0.22, 1, 0.36, 1] as const, // Custom smooth ease-out
};

// Shared Animation Variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: { ...spring.smooth }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  whileInView: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { 
    opacity: 1, 
    scale: 1,
    transition: { ...spring.gentle }
  }
};
