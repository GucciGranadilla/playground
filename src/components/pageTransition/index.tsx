"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence, usePresence } from "framer-motion";
import { useRouter } from "next/router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PageTransitionProps {
  children: ReactNode;
}

function PageContent({
  children,
  exitScrollY,
}: {
  children: ReactNode;
  exitScrollY: number;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<string | number>("auto");
  const lenis = useLenis();

  return (
    <motion.div
      data-page-active={isPresent ? "" : undefined}
      initial={{ clipPath: "inset(0% 0% 0% 0%)", filter: "brightness(0)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)", filter: "brightness(1)" }}
      exit={{
        clipPath: "inset(0% 0% 100% 0%)",
        filter: "brightness(0)",
      }}
      transition={{ duration: 1, ease: [0.5, 0, 0.15, 1] }}
      onAnimationStart={() => {
        setIsTransitioning(true);
        if (!isPresent) {
          setLockedHeight(window.innerHeight);
        }
      }}
      onAnimationComplete={() => {
        setIsTransitioning(false);
        if (!isPresent) {
          safeToRemove?.();
        } else {
          setLockedHeight("auto");
          if (!lenis?.isStopped) {
            lenis?.resize();
          }
          ScrollTrigger.refresh();
        }
      }}
      style={{
        width: "100%",
        position: isPresent ? "relative" : "fixed",
        top: 0,
        left: 0,
        height: isPresent
          ? isTransitioning
            ? "100dvh"
            : "auto"
          : lockedHeight,
        zIndex: isPresent ? 1 : 10,
        overflow: isPresent && !isTransitioning ? "visible" : "clip",
      }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ duration: 1, ease: [0.5, 0, 0.15, 1] }}
        style={{
          width: "100%",
          position: "relative",
          marginTop: isPresent ? 0 : -exitScrollY,
          pointerEvents: isPresent ? "auto" : "none",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const [exitScrollY, setExitScrollY] = useState(0);
  const lenis = useLenis();

  const routeKey = router.asPath.split(/[?#]/)[0];

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const handleRouteChangeStart = () => {
      setExitScrollY(lenis ? lenis.scroll : window.scrollY);
      document.body.classList.add("is-transitioning");
      lenis?.stop();
      gsap.globalTimeline
        .getChildren(true, true, false)
        .forEach((tween) => tween.kill());
      ScrollTrigger.killAll(false);
    };

    const handleRouteChangeComplete = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
      } else {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant" as ScrollBehavior,
        });
      }
      lenis?.start();
      setTimeout(() => document.body.classList.remove("is-transitioning"), 750);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router, lenis]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <PageContent key={routeKey} exitScrollY={exitScrollY}>
        {children}
      </PageContent>
    </AnimatePresence>
  );
}
