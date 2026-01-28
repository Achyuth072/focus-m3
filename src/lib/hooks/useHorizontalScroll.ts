import { useCallback, useRef } from "react";

export function useHorizontalScroll() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const callbackRef = useCallback((el: HTMLDivElement | null) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!el) return;

    let targetScrollLeft = el.scrollLeft;
    let animationId: number | null = null;
    const lerpFactor = 0.18;

    // Store original scroll-snap style to restore later
    let originalScrollSnapType: string | null = null;

    const disableScrollSnap = () => {
      if (originalScrollSnapType === null) {
        originalScrollSnapType = el.style.scrollSnapType || "";
        el.style.scrollSnapType = "none";
      }
    };

    const enableScrollSnap = () => {
      if (originalScrollSnapType !== null) {
        el.style.scrollSnapType = originalScrollSnapType;
        originalScrollSnapType = null;
      }
    };

    const update = () => {
      if (!el) return;
      const diff = targetScrollLeft - el.scrollLeft;

      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetScrollLeft;
        animationId = null;
        enableScrollSnap(); // Re-enable snap when animation completes
        return;
      }

      el.scrollLeft += diff * lerpFactor;
      animationId = requestAnimationFrame(update);
    };

    const onScroll = () => {
      if (animationId === null) {
        targetScrollLeft = el.scrollLeft;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      const isScrollable = el.scrollWidth > el.clientWidth;
      if (!isScrollable) return;

      // Disable scroll-snap during wheel animation to allow smooth programmatic scroll
      disableScrollSnap();

      if (animationId === null) {
        targetScrollLeft = el.scrollLeft;
      }

      targetScrollLeft = Math.max(
        0,
        Math.min(el.scrollWidth - el.clientWidth, targetScrollLeft + e.deltaY),
      );

      e.preventDefault();

      if (animationId === null) {
        animationId = requestAnimationFrame(update);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      targetScrollLeft = Math.max(
        0,
        Math.min(el.scrollWidth - el.clientWidth, targetScrollLeft),
      );
    });

    // Mouse Drag Support
    let isDown = false;
    let startX: number;
    let scrollLeftStart: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add("cursor-grabbing");
      startX = e.pageX - el.offsetLeft;
      scrollLeftStart = el.scrollLeft;

      // Disable snap during drag
      disableScrollSnap();

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        el.classList.remove("cursor-grabbing");
        enableScrollSnap();
      }
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        el.classList.remove("cursor-grabbing");
        enableScrollSnap();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;

      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;

      el.scrollLeft = scrollLeftStart - walk;
      targetScrollLeft = el.scrollLeft;

      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);

    resizeObserver.observe(el);

    cleanupRef.current = () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      enableScrollSnap(); // Restore on cleanup
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, []);

  return callbackRef;
}
