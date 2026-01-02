import { useRef, useEffect } from "react";

export function useHorizontalScroll() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let targetScrollLeft = el.scrollLeft;
    let animationId: number | null = null;
    const lerpFactor = 0.15; // Adjustment for smoothness (0.1 to 0.2 is usually good)

    const update = () => {
      if (!el) return;
      const diff = targetScrollLeft - el.scrollLeft;

      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetScrollLeft;
        animationId = null;
        return;
      }

      el.scrollLeft += diff * lerpFactor;
      animationId = requestAnimationFrame(update);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      const isScrollable = el.scrollWidth > el.clientWidth;
      if (!isScrollable) return;

      // Update target based on wheel delta
      // We multiply by a factor if we want it to feel faster/slower relative to wheel
      targetScrollLeft = Math.max(
        0,
        Math.min(el.scrollWidth - el.clientWidth, targetScrollLeft + e.deltaY)
      );

      e.preventDefault();

      if (animationId === null) {
        animationId = requestAnimationFrame(update);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, []);

  return elRef;
}
