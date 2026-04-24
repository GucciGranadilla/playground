import { ReactNode, useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisProviderProps {
  children: ReactNode;
}

function LenisGSAPSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const rafCallback = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", () => window.dispatchEvent(new Event("scroll")));
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(rafCallback);
    };
  }, [lenis]);

  return null;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        autoResize: true,
        autoRaf: false,
      }}
    >
      <LenisGSAPSync />
      {children}
    </ReactLenis>
  );
}
