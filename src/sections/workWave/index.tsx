"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Router from "next/router";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import s from "./workWave.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";
import { createAudioChain } from "@/utils/createAudioChain";
import { randomHue } from "@/utils/randomHue";
import { imagePlaceholders } from "@/utils/imagePlaceholders";

const LEFT_ITEMS = [
  { text: "Volt R2", image: "/images/tesla.webp", width: 896, height: 1344 },
  { text: "Éclat", image: "/images/chanel.webp", width: 1232, height: 928 },
  {
    text: "Project Ion",
    image: "/images/apple.webp",
    width: 2464,
    height: 1856,
  },
  { text: "AeroLine", image: "/images/BMW.webp", width: 896, height: 1344 },
  { text: "Série Noir", image: "/images/YSL.webp", width: 1200, height: 1008 },
  { text: "UltraRun", image: "/images/nike.webp", width: 1232, height: 928 },
  {
    text: "Atelier 03",
    image: "/images/hermes.webp",
    width: 1024,
    height: 1056,
  },
  {
    text: "Pulse One",
    image: "/images/adidas.webp",
    width: 1024,
    height: 1024,
  },
  { text: "Linea 24", image: "/images/prada.webp", width: 1232, height: 928 },
  {
    text: "Echo Series",
    image: "/images/google.webp",
    width: 896,
    height: 1344,
  },
  { text: "Zero", image: "/images/polestar.webp", width: 1024, height: 1024 },
  {
    text: "Shift/Black",
    image: "/images/balenciaga.webp",
    width: 1376,
    height: 880,
  },
  { text: "Solar Drift", image: "/images/audi.webp", width: 896, height: 1344 },
  { text: "Nº 27", image: "/images/valentino.webp", width: 1232, height: 976 },
  { text: "Mode/3", image: "/images/samsung.webp", width: 1232, height: 928 },
  {
    text: "Pure Form",
    image: "/images/bottega.webp",
    width: 1024,
    height: 1024,
  },
  { text: "Edge", image: "/images/sony.webp", width: 896, height: 1344 },
  { text: "Stillwater", image: "/images/aesop.webp", width: 1232, height: 976 },
  { text: "Parfum Nº8", image: "/images/dior.webp", width: 1072, height: 1024 },
  { text: "Vantage", image: "/images/porsche.webp", width: 896, height: 1344 },
  { text: "Core", image: "/images/microsoft.webp", width: 1232, height: 928 },
  {
    text: "Archive Green",
    image: "/images/lexus.webp",
    width: 1024,
    height: 1024,
  },
  {
    text: "Rosso Linea",
    image: "/images/mercedes.webp",
    width: 1232,
    height: 928,
  },
  { text: "A-17", image: "/images/huawei.webp", width: 1024, height: 1024 },
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
  const lenis = useLenis();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const leftCol = leftColRef.current;
    const rightCol = rightColRef.current;
    if (!wrapper || !leftCol || !rightCol) return;

    document.documentElement.style.setProperty(
      "--accent",
      `hsl(${randomHue}, 70%, 55%)`,
    );

    lenis?.stop();

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

    const leftTexts = gsap.utils.toArray<HTMLElement>(
      leftCol.querySelectorAll<HTMLElement>(`.${s.item}`),
    );
    const rightTexts = gsap.utils.toArray<HTMLElement>(
      rightCol.querySelectorAll<HTMLElement>(`.${s.item}`),
    );
    const thumbSlots = Array.from(
      wrapper.querySelectorAll<HTMLElement>(`.${s.thumbSlot}`),
    );
    const bgSlots = Array.from(
      wrapper.querySelectorAll<HTMLElement>(`.${s.bgSlot}`),
    );

    let oneSetHeight = 1;
    let activeSlot = 0;
    let lastFocused = -1;

    // Show first slot immediately
    gsap.set(thumbSlots[0], { opacity: 1 });
    gsap.set(bgSlots[0], { opacity: 1 });

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

    const updateThumbnail = (focused: number) => {
      const newIndex = focused % HALF;
      if (newIndex === activeSlot) return;
      gsap.set(thumbSlots[activeSlot], { opacity: 0 });
      gsap.set(bgSlots[activeSlot], { opacity: 0 });
      gsap.set(thumbSlots[newIndex], { opacity: 1 });
      gsap.set(bgSlots[newIndex], { opacity: 1 });
      activeSlot = newIndex;
    };

    const handleScroll = ({ scroll }: { scroll: number }) => {
      const offset = ((scroll % oneSetHeight) + oneSetHeight) % oneSetHeight;
      currentOffset = offset;

      gsap.set(leftCol, { y: -offset });
      gsap.set(rightCol, { y: -offset });

      const focused = findClosest();
      const normalizedFocused = focused % HALF;

      if (normalizedFocused !== lastFocused) {
        playClick();
        lastFocused = normalizedFocused;
      }

      leftTexts.forEach((el, i) =>
        el.classList.toggle(s.focused, i === focused),
      );
      rightTexts.forEach((el, i) =>
        el.classList.toggle(s.focused, i === focused),
      );

      updateThumbnail(focused);
    };

    let targetScroll = 0;
    let currentScroll = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetScroll += e.deltaY;
    };

    let rafId: number;
    const rafLoop = () => {
      currentScroll += (targetScroll - currentScroll) * 0.1;
      handleScroll({ scroll: currentScroll });
      rafId = requestAnimationFrame(rafLoop);
    };

    const onResize = () => {
      oneSetHeight = measureOneSetHeight();
    };

    const initAnimation = () => {
      lenis?.stop();
      oneSetHeight = measureOneSetHeight();
      handleScroll({ scroll: 0 });
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("resize", onResize);
      rafId = requestAnimationFrame(rafLoop);
    };

    const initTimer = setTimeout(initAnimation, 0);

    let tornDown = false;
    const teardown = () => {
      if (tornDown) return;
      tornDown = true;
      clearTimeout(initTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      lenis?.start();
      audioCtx.close();
    };

    Router.events.on("routeChangeStart", teardown);

    return () => {
      Router.events.off("routeChangeStart", teardown);
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
          {LEFT_ITEMS.map((item, i) => (
            <div key={i} className={s.thumbSlot}>
              <Image
                src={item.image}
                fill
                className={s.thumbnail}
                sizes="(max-width: 1023px) 50vw, 15vw"
                placeholder={imagePlaceholders[item.image] ? "blur" : "empty"}
                blurDataURL={imagePlaceholders[item.image]}
                alt=""
              />
            </div>
          ))}
        </div>

        <div ref={rightColRef} className={s.columnRight}>
          {RIGHT.map((label, i) => (
            <div key={i} className={c(s.item, t.xl)}>
              {label}
            </div>
          ))}
        </div>

        <div className={s.bg}>
          {LEFT_ITEMS.map((item, i) => (
            <div key={i} className={s.bgSlot}>
              <Image
                src={item.image}
                fill
                className={s.bgthumbnail}
                sizes="100vw"
                placeholder={imagePlaceholders[item.image] ? "blur" : "empty"}
                blurDataURL={imagePlaceholders[item.image]}
                alt=""
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
