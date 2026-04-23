"use client";

import { useRef, useEffect } from "react";
import Router from "next/router";
import gsap from "gsap";
import Lenis from "lenis";
import s from "./workWave.module.scss";

interface WindowWithLenis extends Window {
  lenis?: Lenis;
}

const LEFT_ITEMS = [
  { text: "Volt R2",       image: "/images/tesla.webp" },
  { text: "Éclat",         image: "/images/chanel.webp" },
  { text: "Project Ion",   image: "/images/apple.webp" },
  { text: "AeroLine",      image: "/images/BMW.webp" },
  { text: "Série Noir",    image: "/images/YSL.webp" },
  { text: "UltraRun",      image: "/images/nike.webp" },
  { text: "Atelier 03",    image: "/images/hermes.webp" },
  { text: "Pulse One",     image: "/images/adidas.webp" },
  { text: "Linea 24",      image: "/images/prada.webp" },
  { text: "Echo Series",   image: "/images/google.webp" },
  { text: "Zero",          image: "/images/polestar.webp" },
  { text: "Shift/Black",   image: "/images/balenciaga.webp" },
  { text: "Solar Drift",   image: "/images/audi.webp" },
  { text: "Nº 27",         image: "/images/valentino.webp" },
  { text: "Mode/3",        image: "/images/samsung.webp" },
  { text: "Pure Form",     image: "/images/bottega.webp" },
  { text: "Edge",          image: "/images/sony.webp" },
  { text: "Stillwater",    image: "/images/aesop.webp" },
  { text: "Parfum Nº8",    image: "/images/dior.webp" },
  { text: "Vantage",       image: "/images/porsche.webp" },
  { text: "Core",          image: "/images/microsoft.webp" },
  { text: "Archive Green", image: "/images/lexus.webp" },
  { text: "Rosso Linea",   image: "/images/mercedes.webp" },
  { text: "A-17",          image: "/images/huawei.webp" },
];

const RIGHT_ITEMS = [
  "Tesla", "Chanel", "Apple", "BMW", "Saint Laurent",
  "Nike", "Hermès", "Adidas", "Prada", "Google",
  "Polestar", "Balenciaga", "Audi", "Valentino", "Samsung",
  "Bottega Veneta", "Sony", "Aesop", "Dior", "Porsche",
  "Microsoft", "Lexus", "Mercedes-Benz", "Huawei",
];

const LEFT  = [...LEFT_ITEMS,  ...LEFT_ITEMS];
const RIGHT = [...RIGHT_ITEMS, ...RIGHT_ITEMS];

const WAVE_NUMBER = 12;
const WAVE_SPEED  = 1;
const HALF        = LEFT_ITEMS.length;

export default function WorkWave() {
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const leftColRef     = useRef<HTMLDivElement>(null);
  const rightColRef    = useRef<HTMLDivElement>(null);
  const thumbRef       = useRef<HTMLImageElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper     = wrapperRef.current;
    const leftCol     = leftColRef.current;
    const rightCol    = rightColRef.current;
    const thumb       = thumbRef.current;
    const scrollTrack = scrollTrackRef.current;
    if (!wrapper || !leftCol || !rightCol || !scrollTrack) return;

    const globalLenis = (window as WindowWithLenis).lenis;
    globalLenis?.stop();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = new Lenis({ infinite: true } as any);

    // Native rAF loop — no GSAP ticker needed
    let rafId: number;
    const rafLoop = (t: DOMHighResTimeStamp) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);

    const leftTexts  = gsap.utils.toArray<HTMLElement>(leftCol.querySelectorAll<HTMLElement>(`.${s.item}`));
    const rightTexts = gsap.utils.toArray<HTMLElement>(rightCol.querySelectorAll<HTMLElement>(`.${s.item}`));

    let leftRange  = { minX: 0, maxX: 0 };
    let rightRange = { minX: 0, maxX: 0 };
    let oneSetHeight = 1;
    let currentImage: string | null = null;

    const leftSetters  = leftTexts.map((el)  => gsap.quickTo(el,  "x", { duration: 0.6, ease: "power4.out" }));
    const rightSetters = rightTexts.map((el) => gsap.quickTo(el, "x", { duration: 0.6, ease: "power4.out" }));

    const calculateRanges = () => {
      const maxLW = Math.max(...leftTexts.map((el) => el.offsetWidth));
      const maxRW = Math.max(...rightTexts.map((el) => el.offsetWidth));
      leftRange  = { minX: 0, maxX: Math.max(0, leftCol.offsetWidth  - maxLW) };
      rightRange = { minX: 0, maxX: Math.max(0, rightCol.offsetWidth - maxRW) };
    };

    const setInitialPositions = () => {
      const apply = (texts: HTMLElement[], range: typeof leftRange, mult: number) => {
        const size = range.maxX - range.minX;
        texts.forEach((el, i) => {
          const wi    = i % HALF;
          const phase = WAVE_NUMBER * wi - Math.PI / 2;
          const x     = (range.minX + ((Math.sin(phase) + 1) / 2) * size) * mult;
          gsap.set(el, { x });
        });
      };
      apply(leftTexts,  leftRange,   1);
      apply(rightTexts, rightRange, -1);
    };

    const measureOneSetHeight = () => {
      const a = leftTexts[0].getBoundingClientRect().top;
      const b = leftTexts[HALF].getBoundingClientRect().top;
      return Math.round(b - a);
    };

    const waveX = (index: number, progress: number, range: typeof leftRange) => {
      const wi    = index % HALF;
      const phase = WAVE_NUMBER * wi + WAVE_SPEED * progress * Math.PI * 2 - Math.PI / 2;
      return range.minX + ((Math.sin(phase) + 1) / 2) * (range.maxX - range.minX);
    };

    const findClosest = () => {
      const center = window.innerHeight / 2;
      let closest = 0, minDist = Infinity;
      leftTexts.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      return closest;
    };

    const updateThumbnail = (focusedEl: HTMLElement) => {
      if (!thumb) return;
      const newSrc = focusedEl.dataset.image;
      if (newSrc && newSrc !== currentImage) {
        currentImage = newSrc;
        thumb.src    = newSrc;
      }
      const wrapperRect = wrapper.getBoundingClientRect();
      const vCenter     = window.innerHeight / 2;
      const thumbH      = thumb.offsetHeight;
      const wrapperH    = wrapper.offsetHeight;
      const idealY      = vCenter - wrapperRect.top - thumbH / 2;
      gsap.set(thumb, { y: Math.max(-thumbH / 2, Math.min(wrapperH - thumbH / 2, idealY)) });
    };

    const handleScroll = ({ scroll }: { scroll: number }) => {
      const offset   = scroll % oneSetHeight;
      const progress = scroll / oneSetHeight;

      gsap.set(leftCol,  { y: -offset });
      gsap.set(rightCol, { y: -offset });

      const focused = findClosest();

      leftTexts.forEach((el, i) => {
        leftSetters[i](waveX(i, progress, leftRange));
        el.classList.toggle(s.focused, i === focused);
      });
      rightTexts.forEach((el, i) => {
        rightSetters[i](-waveX(i, progress, rightRange));
        el.classList.toggle(s.focused, i === focused);
      });

      updateThumbnail(leftTexts[focused]);
    };

    const initAnimation = () => {
      calculateRanges();
      setInitialPositions();
      oneSetHeight = measureOneSetHeight();
      scrollTrack.style.height = `${oneSetHeight}px`;
      lenis.resize();
      lenis.on("scroll", handleScroll);
      handleScroll({ scroll: 0 });
    };

    // If a page transition is in progress, defer measurement until after it
    // completes — measuring during the Framer exit/enter animation gives wrong
    // getBoundingClientRect values and breaks the scroll loop point.
    const isTransitioning = document.body.classList.contains("is-transitioning");
    const initTimer = setTimeout(initAnimation, isTransitioning ? 1100 : 0);

    const onResize = () => {
      calculateRanges();
      oneSetHeight = measureOneSetHeight();
      scrollTrack.style.height = `${oneSetHeight}px`;
      lenis.resize();
    };
    window.addEventListener("resize", onResize);

    const teardown = () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(rafId);
      lenis.off("scroll", handleScroll);
      lenis.destroy();
      globalLenis?.start();
    };

    Router.events.on("routeChangeStart", teardown);

    return () => {
      Router.events.off("routeChangeStart", teardown);
      window.removeEventListener("resize", onResize);
      teardown();
    };
  }, []);

  return (
    <section className={s.root}>
      <div ref={wrapperRef} className={s.wrapper}>

        <div ref={leftColRef} className={s.columnLeft}>
          {LEFT.map((item, i) => (
            <div key={i} className={s.item} data-image={item.image}>
              {item.text}
            </div>
          ))}
        </div>

        <div className={s.thumbnailWrapper}>
          <img
            ref={thumbRef}
            className={s.thumbnail}
            src={LEFT_ITEMS[0].image}
            alt=""
          />
        </div>

        <div ref={rightColRef} className={s.columnRight}>
          {RIGHT.map((label, i) => (
            <div key={i} className={s.item}>{label}</div>
          ))}
        </div>

      </div>

      <div ref={scrollTrackRef} />
    </section>
  );
}
