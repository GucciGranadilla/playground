"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Router from "next/router";
import Link from "next/link";
import gsap from "gsap";

import { useLenis } from "lenis/react";
import s from "./workWave.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";
import { createAudioChain } from "@/utils/createAudioChain";
import { useSound } from "@/utils/soundContext";
import { randomHue } from "@/utils/randomHue";
import { imagePlaceholders } from "@/utils/imagePlaceholders";
import { WORK_ITEMS } from "@/data/workItems";
import useMobile from "@/utils/useMobile";

const LEFT_ITEMS = WORK_ITEMS.map((item) => ({
  link: `work/${item.slug}`,
  text: item.title,
  heroImage: item.heroImage,
  cardImage: item.cardImage,
}));

const RIGHT_ITEMS = WORK_ITEMS.map((item) => item.client);

const LEFT = [...LEFT_ITEMS, ...LEFT_ITEMS];
const RIGHT = [...RIGHT_ITEMS, ...RIGHT_ITEMS];

const HALF = LEFT_ITEMS.length;

export default function WorkWave() {
  const lenis = useLenis();
  const { mutedRef } = useSound();
  const isMobile = useMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const thumbnailWrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    if (isMobile === undefined) return;
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
      if (mutedRef.current) return;
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
      (thumbnailWrapperRef.current ?? wrapper).querySelectorAll<HTMLElement>(
        `.${s.thumbSlot}`,
      ),
    );
    const bgSlots = Array.from(
      wrapper.querySelectorAll<HTMLElement>(`.${s.bgSlot}`),
    );

    let oneSetHeight = 1;
    let activeSlot = 0;
    let lastFocused = -1;

    // All slots hidden by default, show first
    gsap.set(thumbSlots, { opacity: 0 });
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
      setActiveIndex(newIndex);

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

    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;
    let touchActive = false;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      lastTouchTime = performance.now();
      touchVelocity = 0;
      touchActive = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const now = performance.now();
      const dt = Math.max(now - lastTouchTime, 1);
      const delta = lastTouchY - y;
      touchVelocity = (delta / dt) * 16;
      targetScroll += delta;
      lastTouchY = y;
      lastTouchTime = now;
    };
    const onTouchEnd = () => {
      touchActive = false;
    };

    let rafId: number;
    const rafLoop = () => {
      if (!touchActive && Math.abs(touchVelocity) > 0.1) {
        targetScroll += touchVelocity;
        touchVelocity *= 0.94;
      }
      const lerp = touchActive ? 0.35 : 0.1;
      currentScroll += (targetScroll - currentScroll) * lerp;
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
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
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
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);

      audioCtx.close();
    };

    Router.events.on("routeChangeStart", teardown);

    return () => {
      Router.events.off("routeChangeStart", teardown);
      teardown();
      lenis?.start();
    };
  }, [isMobile, lenis]);

  if (isMobile === undefined) {
    return <section className={s.root} />;
  }

  return (
    <section className={s.root}>
      <Link
        href={`/${LEFT_ITEMS[activeIndex].link}`}
        className={s.linkWrap}
        aria-label={`View ${LEFT_ITEMS[activeIndex].text}`}
        data-mute-hover
      >
        <div ref={wrapperRef} className={s.wrapper}>
        <div ref={leftColRef} className={s.columnLeft}>
          {LEFT.map((item, i) => (
            <div
              key={i}
              className={c(s.item, t.l)}
              data-image={item.cardImage.src}
            >
              {item.text}
            </div>
          ))}
        </div>

        <div ref={thumbnailWrapperRef} className={s.thumbnailWrapper}>
          {LEFT_ITEMS.map((item, i) => (
            <div key={i} className={s.thumbSlot}>
              <Image
                src={item.cardImage.src}
                fill
                className={s.thumbnail}
                sizes="(max-width: 1023px) 50vw, 15vw"
                placeholder={
                  imagePlaceholders[item.cardImage.src] ? "blur" : "empty"
                }
                blurDataURL={imagePlaceholders[item.cardImage.src]}
                alt=""
              />
            </div>
          ))}

        </div>

        <div ref={rightColRef} className={s.columnRight}>
          {RIGHT.map((label, i) => (
            <div key={i} className={c(s.item, t.l)}>
              {label}
            </div>
          ))}
        </div>

        <div className={s.bg}>
          {LEFT_ITEMS.map((item, i) => (
            <div key={i} className={s.bgSlot}>
              <Image
                src={item.heroImage.src}
                fill
                className={s.bgthumbnail}
                sizes="100vw"
                placeholder={
                  imagePlaceholders[item.heroImage.src] ? "blur" : "empty"
                }
                blurDataURL={imagePlaceholders[item.heroImage.src]}
                alt=""
              />
            </div>
          ))}
        </div>
        </div>
      </Link>
    </section>
  );
}
