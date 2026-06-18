"use client";

import Head from "next/head";
import { useRef, useEffect, useLayoutEffect } from "react";
import {
  motion,
  animate,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

import Footer from "@/sections/footer";
import { createAudioChain } from "@/utils/createAudioChain";
import { useSound } from "@/utils/soundContext";
import CapeTownTime from "@/components/capeTownTime";
import ParallaxImage from "@/components/parallaxImage";

import s from "./about.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";

const STATEMENT_LEAD =
  "kevin:davis® is a brand identity and web design practice in Cape Town, creating bespoke identity systems and digital experiences. Working at the intersection of strategy and craft,";
const STATEMENT_EMPHASIS =
  "with a focus on identities that survive past the launch.";
const ABOUT_TEXT = [
  "Led by the dynamic and well-connected Gavin Schneider, known for his charismatic energy and unparalleled ability to secure the best locations, talent, and rates, our team brings extensive industry knowledge and a steadfast commitment to each project.",
  "Our dedicated production team manages every aspect of the process, from initial concept to final execution, ensuring a seamless and world-class experience.",
  "With access to top-tier local crew, trusted suppliers, and the finest locations Cape Town has to offer, we consistently deliver productions that surpass expectations.",
];

const count = ABOUT_TEXT.length;

const SERVICES = [
  "Brand Identity",
  "Art Direction",
  "Web Design",
  "Development",
];

const RECOGNITION = [
  "Grand Prix [Loeries '24]",
  "Gold [Loeries '24]",
  "Jury Member [Awwwards '26]",
  "Honourary Award [Awwwards '26]",
  "FWA of the Day [Awwwards '26]",
  "Site of the Day [Awwwards '26]",
  "Honourable Mention [Awwwards '26] [×2]",
];

const CLIENTS = [
  "Gavin Schneider Productions",
  "Freshman",
  "The Art Of Documentary",
  "Higherlife Foundation",
  "Paragon Properties",
  "Southern Guild",
  "Goodman Gallery",
  "Fairways to Africa",
  "The Healthy Wealth",
];

const PLATFORMS: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Are.na", href: "https://are.na" },
  { label: "Awwwards", href: "https://awwwards.com" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef(0);
  const lastIndexRef = useRef(0);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const indicatorFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const playRef = useRef<(() => void) | null>(null);
  const { mutedRef } = useSound();

  useEffect(() => {
    const ctx = new AudioContext();
    let buffer: AudioBuffer | null = null;

    fetch("/effects/click-modern.wav")
      .then((r) => r.arrayBuffer())
      .then((raw) => ctx.decodeAudioData(raw))
      .then((buf) => {
        buffer = buf;
      })
      .catch(() => {});

    playRef.current = () => {
      if (!buffer) return;
      if (mutedRef.current) return;
      ctx
        .resume()
        .then(() => {
          const src = ctx.createBufferSource();
          src.buffer = buffer!;

          src.connect(createAudioChain(ctx, 0.12));
          src.start();
        })
        .catch(() => {});
    };

    return () => {
      ctx.close();
    };
  }, [mutedRef]);

  const measureRange = () => {
    const wrapper = contentWrapperRef.current;
    const content = contentInnerRef.current;
    if (!wrapper || !content) return;
    const paddingBottom =
      parseFloat(getComputedStyle(wrapper).paddingBottom) || 0;
    const contentTopInWrapper =
      content.getBoundingClientRect().top - wrapper.getBoundingClientRect().top;
    rangeRef.current =
      wrapper.offsetHeight -
      contentTopInWrapper -
      content.offsetHeight -
      paddingBottom;
  };

  useLayoutEffect(() => {
    measureRange();
    const ro = new ResizeObserver(measureRange);
    ro.observe(contentWrapperRef.current!);
    ro.observe(contentInnerRef.current!);

    // Set initial text states — first visible, rest hidden below.
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      animate(
        el,
        { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 },
        { duration: 0 },
      );
    });

    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end 0.35"],
  });

  const y = useTransform(scrollYProgress, (p) => p * rangeRef.current);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const raw = progress * count;
    const index = Math.min(Math.max(Math.floor(raw), 0), count - 1);
    const progressInStep = Math.min(Math.max(raw - index, 0), 1);

    indicatorFillRefs.current.forEach((fill, i) => {
      if (!fill) return;
      const p = i < index ? 1 : i === index ? progressInStep : 0;
      animate(fill, { scaleX: p }, { duration: 0 });
    });

    if (index === lastIndexRef.current) return;
    const forward = index > lastIndexRef.current;
    const prev = textRefs.current[lastIndexRef.current];
    const next = textRefs.current[index];

    playRef.current?.();

    if (prev)
      animate(
        prev,
        { opacity: 0, y: forward ? -20 : 20 },
        { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      );
    if (next)
      animate(
        next,
        { opacity: 1, y: 0 },
        { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      );

    lastIndexRef.current = index;
  });

  return (
    <>
      <Head>
        <title>About — Kevin Davis Studio</title>
      </Head>
      <main data-nav-bg>
        {/* ── Big-type editorial intro ─────────────────────────────── */}
        <section ref={sectionRef} className={s.intro}>
          <header className={c(s.metaBar, t.cta)}>
            <span className={s.metaItem}>Kevin Davis Studio®</span>
            <span className={s.metaItem}>Cape Town, ZA — 33°S</span>
            <CapeTownTime className={s.metaItem} showStatus />
            <span className={s.metaItem}>Available for Commissions</span>
            <span className={s.metaItem}>Studio / 01</span>
          </header>

          <h1 className={s.wordmark} aria-label="Kevin Davis Studio">
            <span>Kevin Davis</span>
            <span>
              Studio<sup className={s.reg}>®</sup>
            </span>
          </h1>

          <p className={c(s.lead, t.xl)}>
            {STATEMENT_LEAD}{" "}
            <span className={s.leadEm}>{STATEMENT_EMPHASIS}</span>
          </p>

          <div className={c(s.content)} ref={contentWrapperRef}>
            <motion.div
              className={s.contentInner}
              ref={contentInnerRef}
              style={{ y }}
            >
              <h2 className={c(s.tag, t.tag)} style={{ overflow: "clip" }}>
                <span
                  style={
                    {
                      "--delay": "0.24s",
                      display: "block",
                    } as React.CSSProperties
                  }
                >
                  Profile
                </span>
              </h2>
              <div className={s.indicators}>
                {ABOUT_TEXT.map((_, i) => (
                  <span key={i} className={s.indicator}>
                    <span
                      className={s.indicatorFill}
                      ref={(el) => {
                        indicatorFillRefs.current[i] = el;
                      }}
                    />
                  </span>
                ))}
              </div>
              <div
                className={s.textWrap}
                style={{ "--delay": "0.42s" } as React.CSSProperties}
              >
                {ABOUT_TEXT.map((line, i) => (
                  <p
                    key={i}
                    ref={(el) => {
                      textRefs.current[i] = el;
                    }}
                    className={c(s.textItem, t.p)}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>

          <aside className={c(s.sidebar)}>
            <div className={s.sidebarGroup}>
              <span className={c(s.sidebarLabel, t.tag)}>Services</span>
              <ul className={c(s.sidebarList, t.p)}>
                {SERVICES.map((svc) => (
                  <li key={svc}>{svc}</li>
                ))}
              </ul>
            </div>

            <div className={s.sidebarGroup}>
              <span className={c(s.sidebarLabel, t.tag)}>Recognition</span>
              <ul className={c(s.sidebarList, t.p)}>
                {RECOGNITION.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={s.sidebarGroup}>
              <span className={c(s.sidebarLabel, t.tag)}>Clients</span>
              <ul className={c(s.sidebarList, t.p)}>
                {CLIENTS.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>

            <div className={s.sidebarGroup}>
              <span className={c(s.sidebarLabel, t.tag)}>Platforms</span>
              <ul className={c(s.sidebarList, t.p)}>
                {PLATFORMS.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      className={s.platformLink}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className={s.images} aria-hidden>
            <div className={c(s.imageItem, s.imageWide)}>
              <ParallaxImage
                src="/images/profile-photo.jpg"
                alt=""
                sizes="(max-width: 1440px) 38vw, 540rem"
              />
            </div>
            <div className={c(s.imageItem, s.imageNarrow)}>
              <ParallaxImage
                src="/images/washington.png"
                alt=""
                sizes="(max-width: 1440px) 14vw, 180rem"
              />
            </div>
          </div>
        </section>
        <Footer page={"about"} />
      </main>
    </>
  );
}
