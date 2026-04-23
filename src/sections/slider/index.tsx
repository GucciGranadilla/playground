"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParallaxImage from "@/components/parallaxImage";
import s from "./slider.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const item = {
  link: {
    href: "/work",
    label: "View All Work",
  },
};

const SLIDES = [
  {
    src: "/images/gsp.jpg",
    label: "Gavin Schneider Productions",
    href: "/work/gavin-schneider-productions",
    excerpt:
      "Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. Full service digital experience studio.",
    year: 2025,
  },
  {
    src: "/images/higherlife.jpg",
    label: "Higherlife Foundation",
    href: "/work/higherlife-foundation",
    excerpt:
      "2 Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. Full service digital experience studio.",
    year: 2025,
  },
  {
    src: "/images/paragon.jpg",
    label: "Paragon Properties",
    href: "/work/paragon-properties",
    excerpt:
      "3 Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. Full service digital experience studio.",
    year: 2025,
  },
  //   { src: "/images/ac00ea0403609542c800dfbf0d027d27.jpg", label: "04 — Space" },
  //   { src: "/images/d7f035241a98e3094fc1216a91be7a40.jpg", label: "05 — Light" },
];

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const INACTIVE_SCALE_X = 341 / 1044;
const INACTIVE_SCALE_Y = 347 / 820;

export default function Slider({ page: _page }: { page?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "end", loop: true });

  const labelRef = useRef<HTMLElement>(null);
  const yearRef = useRef<HTMLElement>(null);
  const excerptRef = useRef<HTMLParagraphElement>(null);

  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const imgNodes = useRef<HTMLElement[]>([]);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType) => {
    tweenNodes.current = emblaApi
      .slideNodes()
      .map((node) => node.querySelector("[data-slide-inner]") as HTMLElement);
    imgNodes.current = emblaApi
      .slideNodes()
      .map((node) => node.querySelector("[data-slide-img]") as HTMLElement);
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback((emblaApi: EmblaCarouselType, event?: any) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = event?.type === "scroll";

    emblaApi.scrollSnapList().forEach((scrollSnap, slideIndex) => {
      if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

      let diffToTarget = scrollSnap - scrollProgress;

      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((loopItem) => {
          const target = loopItem.target();
          if (slideIndex === loopItem.index && target !== 0) {
            const sign = Math.sign(target);
            if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
            if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
          }
        });
      }

      const tw = clamp(1 - Math.abs(diffToTarget * tweenFactor.current), 0, 1);
      const sx = INACTIVE_SCALE_X + tw * (1 - INACTIVE_SCALE_X);
      const sy = INACTIVE_SCALE_Y + tw * (1 - INACTIVE_SCALE_Y);

      const inner = tweenNodes.current[slideIndex];
      if (inner) inner.style.transform = `scaleX(${sx}) scaleY(${sy})`;

      const img = imgNodes.current[slideIndex];
      if (img) img.style.transform = `scaleX(${sy / sx})`;
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    const onSelect = (api: EmblaCarouselType) => {
      const next = api.selectedScrollSnap();
      const prev = api.previousScrollSnap();
      if (next === prev) return;

      const count = SLIDES.length;
      const diff = next - prev;
      const forward = diff === 1 || diff === -(count - 1);
      const targets = [
        labelRef.current,
        yearRef.current,
        excerptRef.current,
      ].filter(Boolean);

      gsap.to(targets, {
        y: forward ? -20 : 20,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          if (labelRef.current)
            labelRef.current.textContent = SLIDES[next].label;
          if (yearRef.current)
            yearRef.current.textContent = String(SLIDES[next].year);
          if (excerptRef.current)
            excerptRef.current.textContent = SLIDES[next].excerpt;
          gsap.fromTo(
            targets,
            { y: forward ? 20 : -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        },
      });
    };

    onSelect(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("reInit", onSelect)
      .on("scroll", tweenScale)
      .on("select", onSelect);

    return () => {
      emblaApi
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tweenScale)
        .off("reInit", onSelect)
        .off("scroll", tweenScale)
        .off("select", onSelect);
    };
  }, [emblaApi, tweenScale, setTweenNodes, setTweenFactor]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      once: true,
      onEnter: () => {
        const color = `hsl(${randomHue}, 70%, 55%)`;
        el.style.setProperty("--accent", color);
        el.classList.add(a.inView);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section className={s.root} ref={sectionRef}>
      <div className={s.embla} ref={emblaRef}>
        <div className={s.container}>
          {SLIDES.map((slide, i) => (
            <Link key={i} href={slide.href} className={s.slide}>
              <div className={s.slideInner} data-slide-inner>
                <div
                  className={c(s.slideColorBlock)}
                  style={{ "--delay": `${i * 0.05}s` } as React.CSSProperties}
                />
                <div
                  className={c(s.slideImage)}
                  style={
                    { "--delay": `${0.16 + i * 0.05}s` } as React.CSSProperties
                  }
                  data-slide-img
                >
                  <ParallaxImage
                    src={slide.src}
                    alt={slide.label}
                    sizes="(max-width: 768px) 100vw, 1044px"
                    quality={90}
                    parallaxAmount={10}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className={s.bottom}>
        <Link href={item.link.href} className={c(s.link, t.cta)}>
          {item.link.label}
        </Link>
        <div className={s.controls}>
          <button
            className={c(s.btn, t.tag)}
            onClick={() => emblaApi?.scrollPrev()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="#1A1A1A"
                d="M2 7h10m0 0L6.531 2M12 7l-5.469 5"
              ></path>
            </svg>
          </button>
          <button
            className={c(s.btn, t.tag)}
            onClick={() => emblaApi?.scrollNext()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="#1A1A1A"
                d="M2 7h10m0 0L6.531 2M12 7l-5.469 5"
              ></path>
            </svg>
          </button>
        </div>
        <div className={s.details}>
          <div className={s.slideLabel}>
            <span ref={labelRef} className={c(s.slideTextInner, t.tag)}>
              {SLIDES[0].label}
            </span>
          </div>
          <div className={s.slideYear}>
            <span ref={yearRef} className={c(s.slideTextInner, t.tag)}>
              {SLIDES[0].year}
            </span>
          </div>
          <div className={s.slideExcerpt}>
            <p ref={excerptRef} className={t.p}>
              {SLIDES[0].excerpt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
