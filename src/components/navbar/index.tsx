import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import Link from "next/link";

import s from "./navbar.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";

interface NavbarProps {
  page?: string;
  settings?: unknown;
}

export default function Navbar({ page }: NavbarProps) {
  const router = useRouter();
  const lenis = useLenis();
  const navRef = useRef<HTMLElement>(null);
  const offsetRef = useRef(0);
  const prevScrollRef = useRef(0);
  const updateBgRef = useRef<() => void>(() => {});
  const tickerFnRef = useRef<(() => void) | null>(null);
  const bgWasVisibleRef = useRef(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleRouteStart = () => {
      nav.classList.add(s.sliding);
      nav.style.setProperty("--nav-offset", "100px");
      offsetRef.current = 100;
      // Capture whether navBg is visible right now so the exit push-up only
      // fires when there's actually something to push out.
      const offsetStr = nav.style.getPropertyValue("--nav-bg-offset");
      const navH = nav.offsetHeight;
      bgWasVisibleRef.current = !!offsetStr && parseInt(offsetStr) < navH + 2;
      // Kill any in-flight ticker from a previous transition
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };

    const handleRouteComplete = () => {
      prevScrollRef.current = 0;

      // Always wait for the page animation to complete before bringing nav back
      setTimeout(() => {
        offsetRef.current = 0;
        nav.style.setProperty("--nav-offset", "0px");
        setTimeout(() => nav.classList.remove(s.sliding), 750);
      }, 1000);

      // Drive updateBg every frame during the 1s page enter animation.
      const fn = updateBgRef.current;
      tickerFnRef.current = fn;
      gsap.ticker.add(fn);
      setTimeout(() => {
        gsap.ticker.remove(fn);
        if (tickerFnRef.current === fn) tickerFnRef.current = null;
      }, 1100);
    };

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteComplete);
    };
  }, [router]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !lenis) return;

    const navHeight = nav.offsetHeight;
    nav.style.setProperty("--nav-height", `${navHeight}px`);
    document.documentElement.style.setProperty(
      "--nav-height",
      `${navHeight}px`,
    );

    const updateBg = () => {
      const navH = nav.offsetHeight;
      const hiddenPos = navH + 2;
      nav.style.setProperty("--nav-height", `${navH}px`);
      document.documentElement.style.setProperty("--nav-height", `${navH}px`);

      const alwaysBg = document.querySelector<HTMLElement>(
        "[data-page-active] [data-nav-bg]",
      );
      const hero = document.querySelector<HTMLElement>(
        "[data-page-active] [data-hero]",
      );
      const pageInner = document.querySelector<HTMLElement>(
        "[data-page-active] [data-page-inner]",
      );

      if (alwaysBg) {
        // Track the section's live top position — getBoundingClientRect reflects
        // the Framer Motion y-translate so the bg slides in with the page content
        const sectionTop = alwaysBg.getBoundingClientRect().top;
        const bgOffset = Math.round(
          Math.min(hiddenPos, Math.max(0, sectionTop)),
        );
        nav.style.setProperty("--nav-bg-offset", `${bgOffset}px`);
      } else {
        const innerTop = pageInner?.getBoundingClientRect().top ?? 0;

        if (innerTop > 0 && bgWasVisibleRef.current) {
          // New page entering from 100vh — push navBg upward in the final navH px
          // of travel, then snap to hiddenPos so it's ready for the next entry.
          // Only fires if the bg was actually visible when the route change started.
          const rawOffset = Math.min(0, innerTop - navH);
          const bgOffset = rawOffset <= -navH ? hiddenPos : rawOffset;
          nav.style.setProperty("--nav-bg-offset", `${Math.round(bgOffset)}px`);
        } else if (hero) {
          // Page at rest — standard hero-bottom scroll tracking
          const heroBottom = hero.getBoundingClientRect().bottom;
          const bgOffset = Math.round(
            Math.min(hiddenPos, Math.max(0, heroBottom + offsetRef.current)),
          );
          nav.style.setProperty("--nav-bg-offset", `${bgOffset}px`);
        } else {
          nav.style.setProperty("--nav-bg-offset", `${hiddenPos}px`);
        }
      }
    };

    updateBgRef.current = updateBg;

    const onScroll = () => {
      const navH = nav.offsetHeight;
      const scroll = window.scrollY;
      const delta = scroll - prevScrollRef.current;
      prevScrollRef.current = scroll;

      offsetRef.current = Math.round(
        Math.min(navH, Math.max(0, offsetRef.current + delta)),
      );
      nav.style.setProperty("--nav-offset", `${offsetRef.current}px`);
      document.documentElement.style.setProperty(
        "--nav-offset",
        `${offsetRef.current}px`,
      );

      updateBg();
    };

    updateBg();
    lenis.on("scroll", onScroll);
    window.addEventListener("resize", updateBg);

    return () => {
      lenis.off("scroll", onScroll);
      window.removeEventListener("resize", updateBg);
    };
  }, [lenis]);

  return (
    <nav ref={navRef} className={s.root}>
      <div className={s.inner}>
        <div className={s.navBg} />
        <Link
          href={page === "home" ? "/about" : "/"}
          className={c(s.logo, t.logo)}
          style={{ overflow: "clip" }}
        >
          <div
            className={a.moveUp}
            style={{ "--delay": "0.3s" } as React.CSSProperties}
          >
            kevin:davis
          </div>
        </Link>
        <ul className={c(s.menu, t.cta)}>
          <div style={{ overflow: "clip" }}>
            <Link
              href="/work"
              className={a.moveUp}
              style={{ "--delay": "0.38s" } as React.CSSProperties}
            >
              work,
            </Link>
          </div>
          <div style={{ overflow: "clip" }}>
            <div
              className={a.moveUp}
              style={{ "--delay": "0.43s" } as React.CSSProperties}
            >
              about,
            </div>
          </div>
          <div style={{ overflow: "clip" }}>
            <div
              className={a.moveUp}
              style={{ "--delay": "0.48s" } as React.CSSProperties}
            >
              contact
            </div>
          </div>
        </ul>
        <div className={c(s.button, t.cta)} style={{ overflow: "clip" }}>
          <div
            className={a.moveUp}
            style={{ "--delay": "0.52s" } as React.CSSProperties}
          >
            get in touch
          </div>
        </div>
      </div>
    </nav>
  );
}
