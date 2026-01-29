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
    const friction = 0.95; // Inertia decay rate
    let velocity = 0;
    let lastMouseX = 0;
    let lastTime = 0;
    let isMoving = false;
    let totalMoved = 0;

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

      if (isMoving) {
        // Smoothly interpolate to target (used for Wheel)
        const diff = targetScrollLeft - el.scrollLeft;
        if (Math.abs(diff) < 0.5) {
          el.scrollLeft = targetScrollLeft;
          animationId = null;
          enableScrollSnap();
          return;
        }
        el.scrollLeft += diff * lerpFactor;
      } else {
        // Inertia (used for Drag release)
        if (Math.abs(velocity) < 0.1) {
          velocity = 0;
          animationId = null;
          enableScrollSnap();
          return;
        }
        el.scrollLeft += velocity;
        velocity *= friction;
        targetScrollLeft = el.scrollLeft;
      }

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

      disableScrollSnap();
      isMoving = true;

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
      totalMoved = 0;
      velocity = 0;
      lastMouseX = e.pageX;
      lastTime = performance.now();
      isMoving = false;

      disableScrollSnap();

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const stopDragging = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("cursor-grabbing");

      if (Math.abs(velocity) > 2) {
        // Trigger inertia
        isMoving = false;
        animationId = requestAnimationFrame(update);
      } else {
        enableScrollSnap();
      }
    };

    const onMouseLeave = stopDragging;
    const onMouseUp = stopDragging;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;

      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      const prevScrollLeft = el.scrollLeft;

      el.scrollLeft = scrollLeftStart - walk;
      targetScrollLeft = el.scrollLeft;

      // Calculate velocity
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const dx = el.scrollLeft - prevScrollLeft;
        velocity = dx; // Simple frame velocity
        lastTime = now;
      }

      totalMoved += Math.abs(x - (lastMouseX - el.offsetLeft));
      lastMouseX = e.pageX;

      e.preventDefault();
    };

    // Prevent click if we moved significantly
    const onClick = (e: MouseEvent) => {
      if (totalMoved > 10) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("click", onClick, { capture: true });

    resizeObserver.observe(el);

    cleanupRef.current = () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("click", onClick, { capture: true });
      resizeObserver.disconnect();
      enableScrollSnap();
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, []);

  return callbackRef;
}
