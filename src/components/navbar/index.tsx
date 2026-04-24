import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useLenis } from "lenis/react";
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

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleRouteStart = () => {
      nav.classList.add(s.sliding);
      nav.style.setProperty("--nav-offset", "100px");
      offsetRef.current = 100;
    };

    const handleRouteComplete = () => {
      prevScrollRef.current = 0;
      offsetRef.current = 0;
      nav.style.setProperty("--nav-offset", "0px");
      setTimeout(() => nav.classList.remove(s.sliding), 750);
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
    document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);

    const updateBg = () => {
      const navH = nav.offsetHeight;
      const hiddenPos = navH + 2;
      nav.style.setProperty("--nav-height", `${navH}px`);
      document.documentElement.style.setProperty("--nav-height", `${navH}px`);

      const hero = document.querySelector<HTMLElement>(
        "[data-page-active] [data-hero]",
      );
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        const bgOffset = Math.round(
          Math.min(hiddenPos, Math.max(0, heroBottom + offsetRef.current)),
        );
        nav.style.setProperty("--nav-bg-offset", `${bgOffset}px`);
      } else {
        nav.style.setProperty("--nav-bg-offset", `${hiddenPos}px`);
      }
    };

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
            <div
              className={a.moveUp}
              style={{ "--delay": "0.38s" } as React.CSSProperties}
            >
              work,
            </div>
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
