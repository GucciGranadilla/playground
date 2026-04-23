"use client";

import { useRef, useEffect } from "react";
import Router from "next/router";
import gsap from "gsap";
import Lenis from "lenis";
import s from "./workWave.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";
import { createAudioChain } from "@/utils/createAudioChain";
import { randomHue } from "@/utils/randomHue";

interface WindowWithLenis extends Window {
  lenis?: Lenis;
}

const LEFT_ITEMS = [
  { text: "Volt R2", image: "/images/tesla.webp" },
  { text: "Éclat", image: "/images/chanel.webp" },
  { text: "Project Ion", image: "/images/apple.webp" },
  { text: "AeroLine", image: "/images/BMW.webp" },
  { text: "Série Noir", image: "/images/YSL.webp" },
  { text: "UltraRun", image: "/images/nike.webp" },
  { text: "Atelier 03", image: "/images/hermes.webp" },
  { text: "Pulse One", image: "/images/adidas.webp" },
  { text: "Linea 24", image: "/images/prada.webp" },
  { text: "Echo Series", image: "/images/google.webp" },
  { text: "Zero", image: "/images/polestar.webp" },
  { text: "Shift/Black", image: "/images/balenciaga.webp" },
  { text: "Solar Drift", image: "/images/audi.webp" },
  { text: "Nº 27", image: "/images/valentino.webp" },
  { text: "Mode/3", image: "/images/samsung.webp" },
  { text: "Pure Form", image: "/images/bottega.webp" },
  { text: "Edge", image: "/images/sony.webp" },
  { text: "Stillwater", image: "/images/aesop.webp" },
  { text: "Parfum Nº8", image: "/images/dior.webp" },
  { text: "Vantage", image: "/images/porsche.webp" },
  { text: "Core", image: "/images/microsoft.webp" },
  { text: "Archive Green", image: "/images/lexus.webp" },
  { text: "Rosso Linea", image: "/images/mercedes.webp" },
  { text: "A-17", image: "/images/huawei.webp" },
];

const RIGHT_ITEMS = [
  "Tesla",
  "Chanel",
  "Apple",
  "BMW",
  "Saint Laurent",
  "Nike",
  "Hermès",
  "Adidas",
  "Prada",
  "Google",
  "Polestar",
  "Balenciaga",
  "Audi",
  "Valentino",
  "Samsung",
  "Bottega Veneta",
  "Sony",
  "Aesop",
  "Dior",
  "Porsche",
  "Microsoft",
  "Lexus",
  "Mercedes-Benz",
  "Huawei",
];

const LEFT = [...LEFT_ITEMS, ...LEFT_ITEMS];
const RIGHT = [...RIGHT_ITEMS, ...RIGHT_ITEMS];

const HALF = LEFT_ITEMS.length;

export default function WorkWave() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLImageElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const leftCol = leftColRef.current;
    const rightCol = rightColRef.current;
    const thumb = thumbRef.current;
    const scrollTrack = scrollTrackRef.current;
    if (!wrapper || !leftCol || !rightCol || !scrollTrack) return;

    document.documentElement.style.setProperty(
      "--accent",
      `hsl(${randomHue}, 70%, 55%)`,
    );

    const globalLenis = (window as WindowWithLenis).lenis;
    globalLenis?.stop();

    const audioCtx = new AudioContext();
    let clickBuffer: AudioBuffer | null = null;
    fetch("/effects/click-modern.wav")
      .then((r) => r.arrayBuffer())
      .then((b) => audioCtx.decodeAudioData(b))
      .then((buf) => {
        clickBuffer = buf;
      })
      .catch(() => {});

    const playClick = () => {
      if (!clickBuffer) return;
      audioCtx
        .resume()
        .then(() => {
          const src = audioCtx.createBufferSource();
          src.buffer = clickBuffer!;
          src.connect(createAudioChain(audioCtx, 0.12));
          src.start();
        })
        .catch(() => {});
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = new Lenis({ infinite: true } as any);

    let rafId: number;
    const rafLoop = (t: DOMHighResTimeStamp) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);

    const leftTexts = gsap.utils.toArray<HTMLElement>(
      leftCol.querySelectorAll<HTMLElement>(`.${s.item}`),
    );
    const rightTexts = gsap.utils.toArray<HTMLElement>(
      rightCol.querySelectorAll<HTMLElement>(`.${s.item}`),
    );

    let oneSetHeight = 1;
    let currentImage: string | null = null;
    let lastFocused = -1;

    const measureOneSetHeight = () => {
      const a = leftTexts[0].getBoundingClientRect().top;
      const b = leftTexts[HALF].getBoundingClientRect().top;
      return Math.round(b - a);
    };

    let currentOffset = 0;

    const findClosest = () => {
      const center = window.innerHeight / 2;
      let closest = 0,
        minDist = Infinity;
      leftTexts.forEach((el, i) => {
        const screenY = el.offsetTop - currentOffset + el.offsetHeight / 2;
        const dist = Math.abs(screenY - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      return closest;
    };

    const updateThumbnail = (focusedEl: HTMLElement) => {
      if (!thumb) return;
      const newSrc = focusedEl.dataset.image;
      if (newSrc && newSrc !== currentImage) {
        currentImage = newSrc;
        thumb.src = newSrc;
      }
    };

    const handleScroll = ({ scroll }: { scroll: number }) => {
      const offset = scroll % oneSetHeight;
      currentOffset = offset;

      gsap.set(leftCol, { y: -offset });
      gsap.set(rightCol, { y: -offset });

      const focused = findClosest();

      if (focused !== lastFocused) {
        playClick();
        lastFocused = focused;
      }

      leftTexts.forEach((el, i) =>
        el.classList.toggle(s.focused, i === focused),
      );
      rightTexts.forEach((el, i) =>
        el.classList.toggle(s.focused, i === focused),
      );

      updateThumbnail(leftTexts[focused]);
    };

    const initAnimation = () => {
      oneSetHeight = measureOneSetHeight();
      scrollTrack.style.height = `${oneSetHeight}px`;
      lenis.resize();
      lenis.on("scroll", handleScroll);
      handleScroll({ scroll: 0 });
    };

    const initTimer = setTimeout(initAnimation, 0);

    const onResize = () => {
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
      audioCtx.close();
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
            <div key={i} className={c(s.item, t.xl)} data-image={item.image}>
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
            <div key={i} className={c(s.item, t.xl)}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div ref={scrollTrackRef} />
    </section>
  );
}
