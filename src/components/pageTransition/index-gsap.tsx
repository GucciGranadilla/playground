"use client";

import {
  ReactNode,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { AnimatePresence, usePresence } from "framer-motion";
import { useRouter } from "next/router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useLenis } from "lenis/react";
import s from "./transition.module.scss";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  if (!CustomEase.get("transitionEase")) {
    CustomEase.create("transitionEase", "M0,0 C0.5,0 0.15,1 1,1");
  }
}

const DURATION = 1;
const EASE = "transitionEase";
const ENTER_Y_FROM = "80vh";
const EXIT_Y_TO = "-40vh";
const EXIT_OVERLAY_OPACITY = 0.85;

// Avoid useLayoutEffect SSR warning under Pages Router.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Skip the enter animation on the very first PageContent mount (mirrors
// AnimatePresence's `initial={false}` for the first child).
let hasMountedFirstPage = false;

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

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const skipEnterRef = useRef(false);

  // Synchronously apply enter-from state before paint to prevent a flash of
  // the new page in its final position before the animation runs.
  useIsoLayoutEffect(() => {
    if (!isPresent) return;
    if (!hasMountedFirstPage) {
      hasMountedFirstPage = true;
      skipEnterRef.current = true;
      return;
    }
    if (!wrapRef.current || !overlayRef.current) return;
    gsap.set(wrapRef.current, { y: ENTER_Y_FROM });
    gsap.set(overlayRef.current, { opacity: 1 });
    setIsTransitioning(true);
  }, [isPresent]);

  // Run the enter animation. Double-RAF waits for layout/hydration to settle
  // before reading positions and kicking off — addresses the "first nav after
  // hard reload" failure mode where layout isn't ready when framer snapshots.
  useEffect(() => {
    if (!isPresent || skipEnterRef.current) return;
    if (!wrapRef.current || !overlayRef.current) return;

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        if (!wrapRef.current || !overlayRef.current) return;
        tl = gsap.timeline({
          onComplete: () => {
            setIsTransitioning(false);
            setLockedHeight("auto");
            lenis?.resize();
            ScrollTrigger.refresh();
          },
        });
        tl.to(
          wrapRef.current,
          { y: 0, duration: DURATION, ease: EASE },
          0
        );
        tl.to(
          overlayRef.current,
          { opacity: 0, duration: DURATION, ease: EASE },
          0
        );
      });
    });

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, [isPresent, lenis]);

  // Run the exit animation when AnimatePresence flags this instance for
  // removal. GSAP picks up current values, so this composes correctly even
  // if the user navigates mid-enter.
  useEffect(() => {
    if (isPresent) return;
    if (!containerRef.current || !wrapRef.current || !overlayRef.current) {
      safeToRemove?.();
      return;
    }

    setIsTransitioning(true);
    setLockedHeight(window.innerHeight);

    const tl = gsap.timeline({
      onComplete: () => safeToRemove?.(),
    });
    tl.to(
      containerRef.current,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: DURATION,
        ease: EASE,
      },
      0
    );
    tl.to(
      wrapRef.current,
      { y: EXIT_Y_TO, duration: DURATION, ease: EASE },
      0
    );
    tl.to(
      overlayRef.current,
      {
        opacity: EXIT_OVERLAY_OPACITY,
        duration: DURATION,
        ease: EASE,
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [isPresent, safeToRemove]);

  return (
    <div
      ref={containerRef}
      data-page-active={isPresent ? "" : undefined}
      className={!isPresent ? s.clone : undefined}
      style={{
        width: "100%",
        position: isPresent ? "relative" : "absolute",
        top: 0,
        left: 0,
        height: isPresent ? (isTransitioning ? "100vh" : "auto") : lockedHeight,
        zIndex: isPresent ? 1 : 10,
        overflow: isPresent && !isTransitioning ? "visible" : "clip",
        clipPath: "inset(0% 0% 0% 0%)",
      }}
    >
      <div
        ref={overlayRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "black",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        ref={wrapRef}
        data-page-inner
        style={{
          width: "100%",
          position: "relative",
          marginTop: isPresent ? 0 : -exitScrollY,
          pointerEvents: isPresent ? "auto" : "none",
        }}
      >
        {children}
      </div>
    </div>
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
      // Read scroll BEFORE killing anything else so the value is taken from
      // a stable frame. Use window.scrollY (not lenis.scroll) — lenis can
      // overshoot the real maxScroll when its ResizeObserver hasn't caught
      // a scrollHeight change.
      setExitScrollY(window.scrollY);
      document.body.classList.add("is-transitioning");
      lenis?.resize();
      lenis?.stop();
      // Kills page-level gsap and ScrollTriggers from the outgoing page.
      // The transition tweens haven't been created yet (they're spawned
      // inside the PageContent effects, which fire after this handler).
      gsap.globalTimeline
        .getChildren(true, true, false)
        .forEach((tween) => tween.kill());
      ScrollTrigger.killAll(false);
    };

    const handleRouteChangeComplete = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
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
