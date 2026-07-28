// biq-motion.ts — the two hooks behind COURT PAPER motion.
// Plain React, zero dependencies. In Next.js App Router, any component that
// imports these needs "use client" at the top of its file.

import { useEffect, useState, type RefObject } from "react";

/** SSR-safe reduced-motion flag. Defaults false on the server, corrects on mount. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Fires once when the element enters the viewport. Triggers the meter fill. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = "0px 0px -8% 0px",
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true); // no observer support: settle immediately
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, inView]);
  return inView;
}
