import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import Link from "next/link";

import s from "./navbar.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";

const NAV_ITEMS = [
  { href: "/work", label: "index" },
  { href: "/about", label: "studio" },
  { href: "/contact-preview", label: "contact" },
];

const DELAYS = ["0.38s", "0.43s", "0.48s"];

interface NavbarProps {
  page?: string;
  settings?: unknown;
}

export default function Navbar({ page }: NavbarProps) {
  const router = useRouter();
  const lenis = useLenis();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsetRef = useRef(0);
  const prevScrollRef = useRef(0);
  const updateBgRef = useRef<() => void>(() => {});
  const tickerFnRef = useRef<(() => void) | null>(null);
  const bgWasVisibleRef = useRef(false);

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
      if (animate) gsap.to(pill, { ...props, duration: 0.6, ease: "expo.out" });
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
      else gsap.to(pill, { opacity: 0, duration: 0.2 });
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
        const sectionTop = alwaysBg.getBoundingClientRect().top;
        nav.style.setProperty(
          "--nav-bg-offset",
          `${Math.round(Math.min(hiddenPos, Math.max(0, sectionTop)))}px`,
        );
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
            `${Math.round(Math.min(hiddenPos, Math.max(0, heroBottom + offsetRef.current)))}px`,
          );
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
        <ul className={c(s.menu, t.cta)} ref={menuRef}>
          <div className={s.menuPill} ref={pillRef} />
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
        <div className={c(s.button, t.cta)} style={{ overflow: "clip" }}>
          <div
            className={a.moveUp}
            style={{ "--delay": "0.52s" } as React.CSSProperties}
          >
            version 0.0.1 [2026]
          </div>
        </div>
      </div>
    </nav>
  );
}
