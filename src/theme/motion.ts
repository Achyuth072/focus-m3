export const transition = {
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  morph: { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: transition.spring },
  exit: { opacity: 0, y: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: transition.spring },
  exit: { opacity: 0, scale: 0.9 },
};
