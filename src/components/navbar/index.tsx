import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLenis } from "lenis/react";
import gsap from "gsap";

import Link from "next/link";

import s from "./navbar.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import { useSound } from "@/utils/soundContext";
import CapeTownTime from "@/components/capeTownTime";

const NAV_ITEMS = [
  { href: "/work", label: "Index" },
  // { href: "/explorations", label: "explorations" },
  { href: "/about", label: "Studio" },
  { href: "/contact-preview", label: "Contact" },
];

const DELAYS = ["0.38s", "0.43s", "0.48s", "0.53s"];

interface NavbarProps {
  page?: string;
  settings?: unknown;
}

export default function Navbar({ page }: NavbarProps) {
  const router = useRouter();
  const lenis = useLenis();
  const { muted, toggleMuted, mutedRef } = useSound();
  const [isOpen, setIsOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsetRef = useRef(0);
  const prevScrollRef = useRef(0);
  const updateBgRef = useRef<() => void>(() => {});
  const tickerFnRef = useRef<(() => void) | null>(null);
  const bgWasVisibleRef = useRef(false);
  const wavePathRefs = useRef<(SVGPathElement | null)[]>([]);
  const wavePanRef = useRef<gsap.core.Tween | null>(null);

  // ── Mute button: SVG only visible when sound is on ───────────────────────
  // Initial paint matches the current `muted` state synchronously so there
  // is no scale-out flash on first load.
  useLayoutEffect(() => {
    const paths = wavePathRefs.current.filter(Boolean) as SVGPathElement[];
    if (!paths.length) return;
    gsap.set(paths, {
      x: 0,
      scaleY: muted ? 0 : 1,
      transformOrigin: "center",
    });
  }, []);

  // On mute: kill the loop, scale the wave away. On unmute: snap x to 0,
  // scale the wave back in, start a fresh pan from the beginning.
  useEffect(() => {
    const paths = wavePathRefs.current.filter(Boolean) as SVGPathElement[];
    if (!paths.length) return;

    gsap.killTweensOf(paths);
    wavePanRef.current?.kill();
    wavePanRef.current = null;

    if (muted) {
      gsap.to(paths, {
        scaleY: 0,
        duration: 0.4,
        ease: "power3.out",
        transformOrigin: "center",
      });
    } else {
      gsap.set(paths, { x: 0 });
      gsap.to(paths, {
        scaleY: 1,
        duration: 0.4,
        ease: "power3.out",
        transformOrigin: "center",
      });
      wavePanRef.current = gsap.to(paths, {
        x: -20,
        duration: 2,
        ease: "none",
        repeat: -1,
      });
    }

    return () => {
      wavePanRef.current?.kill();
      wavePanRef.current = null;
    };
  }, [muted]);

  // PageTransition kills every active GSAP tween on routeChangeStart, taking
  // out our pan loop. The existing route handler keeps the nav translated
  // offscreen until ~1000ms after routeChangeComplete; restart the pan just
  // before that so the snap to x=0 happens while the nav is still hidden.
  useEffect(() => {
    let timer: number | undefined;
    const restart = () => {
      timer = window.setTimeout(() => {
        if (mutedRef.current) return;
        const paths = wavePathRefs.current.filter(Boolean) as SVGPathElement[];
        if (!paths.length) return;
        wavePanRef.current?.kill();
        gsap.set(paths, { x: 0 });
        wavePanRef.current = gsap.to(paths, {
          x: -20,
          duration: 2,
          ease: "none",
          repeat: -1,
        });
      }, 950);
    };
    router.events.on("routeChangeComplete", restart);
    return () => {
      router.events.off("routeChangeComplete", restart);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [router, mutedRef]);

  // ── Mobile menu open/close ────────────────────────────────────────────────
  useEffect(() => {
    const close = () => setIsOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router]);

  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, lenis]);

  // ── Sliding pill ──────────────────────────────────────────────────────────
  useEffect(() => {
    const menu = menuRef.current;
    const pill = pillRef.current;
    const items = itemRefs.current;
    if (!menu || !pill || !items.length) return;

    const activeIdx = NAV_ITEMS.findIndex(
      ({ href }) =>
        router.pathname === href || router.pathname.startsWith(href + "/"),
    );

    const movePill = (el: HTMLDivElement, animate: boolean) => {
      const menuRect = menu.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const remPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const props = {
        x: elRect.left - menuRect.left,
        width: elRect.width + remPx * 8,
        opacity: 1,
      };
      if (animate)
        gsap.to(pill, {
          ...props,
          duration: 0.6,
          ease: "expo.out",
          overwrite: "auto",
        });
      else gsap.set(pill, props);
    };

    const activeEl = activeIdx >= 0 ? items[activeIdx] : null;
    const cleanups: (() => void)[] = [];

    if (activeEl) {
      movePill(activeEl, false);
    } else {
      // Let the pill ride off-screen with the nav slide (0.6s), then reset
      const tid = setTimeout(
        () => gsap.set(pill, { opacity: 0, width: 0 }),
        750,
      );
      cleanups.push(() => clearTimeout(tid));
    }

    items.forEach((item) => {
      if (!item) return;
      const onEnter = () => movePill(item, true);
      item.addEventListener("mouseenter", onEnter);
      cleanups.push(() => item.removeEventListener("mouseenter", onEnter));
    });

    const onLeave = () => {
      if (activeEl) movePill(activeEl, true);
      else gsap.to(pill, { opacity: 0, duration: 0.2, overwrite: "auto" });
    };
    menu.addEventListener("mouseleave", onLeave);
    cleanups.push(() => menu.removeEventListener("mouseleave", onLeave));

    return () => cleanups.forEach((fn) => fn());
  }, [router.pathname]);

  // ── Route transitions ─────────────────────────────────────────────────────
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleRouteStart = () => {
      nav.classList.add(s.sliding);
      nav.style.setProperty("--nav-offset", "100px");
      offsetRef.current = 100;
      const offsetStr = nav.style.getPropertyValue("--nav-bg-offset");
      const navH = nav.offsetHeight;
      bgWasVisibleRef.current = !!offsetStr && parseInt(offsetStr) < navH + 2;
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };

    const handleRouteComplete = () => {
      prevScrollRef.current = 0;
      // Start returning after page enter is underway — nav lands (~0.6s) as page settles (~1s)
      setTimeout(() => {
        offsetRef.current = 0;
        nav.style.setProperty("--nav-offset", "0px");
        setTimeout(() => nav.classList.remove(s.sliding), 750);
      }, 1000);

      // Drive updateBg every frame through the full nav return arc
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

  // ── Scroll / nav-bg ───────────────────────────────────────────────────────
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
        const innerTop = pageInner?.getBoundingClientRect().top ?? 0;
        if (innerTop > 0 && bgWasVisibleRef.current) {
          nav.style.setProperty("--nav-bg-offset", "0px");
        } else {
          const sectionTop = alwaysBg.getBoundingClientRect().top;
          nav.style.setProperty(
            "--nav-bg-offset",
            `${Math.round(Math.min(hiddenPos, Math.max(0, sectionTop)))}px`,
          );
        }
      } else {
        const innerTop = pageInner?.getBoundingClientRect().top ?? 0;
        if (innerTop > 0 && bgWasVisibleRef.current) {
          const rawOffset = Math.min(0, innerTop - navH);
          const bgOffset = rawOffset <= -navH ? hiddenPos : rawOffset;
          nav.style.setProperty("--nav-bg-offset", `${Math.round(bgOffset)}px`);
        } else if (hero) {
          const heroBottom = hero.getBoundingClientRect().bottom;
          nav.style.setProperty(
            "--nav-bg-offset",
            `${Math.round(Math.min(hiddenPos, Math.max(0, heroBottom)))}px`,
          );
        } else {
          nav.style.setProperty("--nav-bg-offset", `${hiddenPos}px`);
        }
      }
    };

    updateBgRef.current = updateBg;

    const onScroll = () => {
      const navH = nav.offsetHeight;
      // Clamp to 0 to ignore iOS rubber-band overscroll. Without this,
      // window.scrollY goes briefly negative at the top, and the delta on
      // spring-back is treated as a "scroll down" → nav hides by that delta.
      const scroll = Math.max(0, window.scrollY);
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


    const handleResetNav = () => {
      offsetRef.current = 0;
      prevScrollRef.current = Math.max(0, window.scrollY);
      nav.style.setProperty("--nav-offset", "0px");
      document.documentElement.style.setProperty("--nav-offset", "0px");
      updateBg();
    };

    updateBg();
    lenis.on("scroll", onScroll);
    window.addEventListener("resize", updateBg);
    window.addEventListener("resetNavPosition", handleResetNav);

    return () => {
      lenis.off("scroll", onScroll);
      window.removeEventListener("resize", updateBg);
      window.removeEventListener("resetNavPosition", handleResetNav);

    };
  }, [lenis]);

  return (
    <nav ref={navRef} className={s.root}>
      <div
        id="mobile-nav-panel"
        className={c(s.slideOut, isOpen && s.slideOutOpen)}
        aria-hidden={!isOpen}
      >
        <ul className={s.slideOutNav}>
          {NAV_ITEMS.map(({ href, label }, itemIdx) => (
            <li key={href} className={t.xl}>
              <Link href={href} aria-label={label}>
                <span className={t.lineClip} aria-hidden="true">
                  {label.split("").map((char, i) => (
                    <span
                      key={i}
                      className={s.slideOutLetter}
                      style={
                        {
                          "--i": i,
                          "--item-i": itemIdx,
                        } as React.CSSProperties
                      }
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={s.slideOutFooter}>
          <CapeTownTime className={c(s.slideOutTime, t.cta)} showStatus />
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            aria-pressed={muted}
            data-mute-sound
            data-mute-hover
            className={s.slideOutMute}
          >
            <svg
              viewBox="0 0 20 20"
              className={s.muteSvg}
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={(el) => {
                  wavePathRefs.current[1] = el;
                }}
                d="M -20 10 Q -15 3, -10 10 T 0 10 Q 5 3, 10 10 T 20 10 Q 25 3, 30 10 T 40 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={t.cta}>{muted ? "Audio Off" : "Audio On"}</span>
          </button>
        </div>
      </div>
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
        <div className={s.menuArea}>
          <div className={s.menuPill} ref={pillRef} />
          <ul className={c(s.menu, t.cta)} ref={menuRef}>
            {NAV_ITEMS.map(({ href, label }, i) => (
              <div
                key={href}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={s.menuItem}
              >
                <Link
                  href={href}
                  className={a.moveUp}
                  style={{ "--delay": DELAYS[i] } as React.CSSProperties}
                >
                  {label}
                </Link>
              </div>
            ))}
          </ul>
        </div>
        {router.pathname === "/explorations" && (
          <div className={s.viewToggle} role="tablist" aria-label="View mode">
            {(["grid", "list"] as const).map((v) => {
              const current = router.query.view === "list" ? "list" : "grid";
              return (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={current === v}
                  className={c(s.viewBtn, t.cta, current === v && s.viewActive)}
                  onClick={() =>
                    router.push(
                      {
                        pathname: "/explorations",
                        query: v === "grid" ? {} : { view: v },
                      },
                      undefined,
                      { shallow: true, scroll: false },
                    )
                  }
                >
                  {v}
                </button>
              );
            })}
          </div>
        )}
        <div className={s.mute}>
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            aria-pressed={muted}
            data-mute-sound
            data-mute-hover
            className={s.muteButton}
          >
            <svg
              viewBox="0 0 20 20"
              className={s.muteSvg}
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={(el) => {
                  wavePathRefs.current[0] = el;
                }}
                d="M -20 10 Q -15 3, -10 10 T 0 10 Q 5 3, 10 10 T 20 10 Q 25 3, 30 10 T 40 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={c(s.muteText, t.cta)}>
              {muted ? "Audio Off" : "Audio On"}
            </span>
          </button>
        </div>
        <button
          type="button"
          className={c(s.menuToggle, t.cta)}
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-panel"
        >
          {isOpen ? "close" : "menu"}
        </button>
      </div>
    </nav>
  );
}
