import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisProviderProps {
  children: ReactNode;
}

interface WindowWithLenis extends Window {
  lenis?: Lenis;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoResize: true,
    });

    if (typeof window !== "undefined") {
      (window as WindowWithLenis).lenis = lenis;
    }

    // Sync Lenis with GSAP's ticker so both run on the same frame
    // and ScrollTrigger's scroll position stays in sync
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Notify Framer Motion's useScroll on each Lenis frame
    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("scroll"));
    });

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
      if (typeof window !== "undefined") {
        (window as WindowWithLenis).lenis = undefined;
      }
    };
  }, []);

  return <>{children}</>;
}
