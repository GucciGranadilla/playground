import { ReactNode, useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import Lenis from "lenis";

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

function LenisGSAPSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    (window as WindowWithLenis).lenis = lenis;

    const rafCallback = (time: number) => lenis.raf(time * 1000);
    let dispatching = false;
    const scrollDispatch = () => {
      if (dispatching) return;
      dispatching = true;
      window.dispatchEvent(new Event("scroll"));
      dispatching = false;
    };

    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", scrollDispatch);
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafCallback);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.off("scroll", scrollDispatch);
      (window as WindowWithLenis).lenis = undefined;
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
        wheelMultiplier: 0.9,
        orientation: "vertical",
        gestureOrientation: "vertical",
        autoRaf: false,
        anchors: true,

      }}
    >
      <LenisGSAPSync />
      {children}
    </ReactLenis>
  );
}
