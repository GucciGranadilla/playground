"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

import s from "./listView.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";

type Item = {
  title: string;
  year: number;
  images: string[];
};

const SYN = "/images/synthetic-origins";

const POOL = [
  `${SYN}/Gemini_Generated_Image_88y5c988y5c988y5.png`,
  `${SYN}/Gemini_Generated_Image_b8c6syb8c6syb8c6.png`,
  `${SYN}/Gemini_Generated_Image_pkuf02pkuf02pkuf.png`,
  `${SYN}/Gemini_Generated_Image_sfakv6sfakv6sfak.png`,
  `${SYN}/Gemini_Generated_Image_swhz1bswhz1bswhz.png`,
  `${SYN}/Gemini_Generated_Image_x1gzdfx1gzdfx1gz.png`,
  `${SYN}/Gemini_Generated_Image_xqxcmbxqxcmbxqxc.png`,
  `${SYN}/Gemini_Generated_Image_yiz1zpyiz1zpyiz1.png`,
  "/images/aurora.avif",
  "/images/aurora-card.avif",
  "/images/lewisburg.jpg",
  "/images/lewisburg-upscale.png",
  "/images/horse-bw.jpg",
  "/images/pp.avif",
  "/images/snow.png",
  "/images/tulbag.jpg",
  "/images/washington.jpg",
  "/images/kevin-spur.jpg",
];

const PRIMARIES: { title: string; year: number; image: string }[] = [
  { title: "Tataki Font", year: 2022, image: "/images/aurora.avif" },
  { title: "Soundtrack Merch", year: 2022, image: "/images/lewisburg.jpg" },
  { title: "Backstage", year: 2022, image: "/images/horse-bw.jpg" },
  { title: "Soundtrack Shop", year: 2023, image: "/images/pp.avif" },
  { title: "B&Breakfast", year: 2023, image: "/images/snow.png" },
  { title: "Made With Gsap", year: 2023, image: POOL[0] },
  { title: "Kara Spring Collection", year: 2023, image: POOL[1] },
  { title: "Le Murmure", year: 2024, image: "/images/tulbag.jpg" },
  { title: "Mars Collection", year: 2024, image: POOL[2] },
  { title: "Made With Gsap II", year: 2024, image: POOL[3] },
  { title: "Chair Supply", year: 2024, image: "/images/washington.jpg" },
  { title: "Croton Collection", year: 2025, image: POOL[6] },
  { title: "Canal Street Cafe", year: 2025, image: "/images/kevin-spur.jpg" },
  { title: "Home DJing", year: 2025, image: POOL[4] },
  { title: "Pink Clothing", year: 2025, image: "/images/aurora-card.avif" },
  { title: "Jazz Club", year: 2025, image: POOL[5] },
  {
    title: "Cocktail Signature",
    year: 2026,
    image: "/images/lewisburg-upscale.png",
  },
  { title: "Kaitlyn Photography", year: 2026, image: POOL[7] },
];

// Build a 4-image carousel per item: primary + three pool images offset by
// index. Four cards keeps totalW comfortably wider than the viewport so the
// per-card wrap always has coverage and there are no visible gaps.
const ITEMS: Item[] = PRIMARIES.map((p, i) => ({
  title: p.title,
  year: p.year,
  images: [
    p.image,
    POOL[(i * 4 + 1) % POOL.length],
    POOL[(i * 4 + 2) % POOL.length],
    POOL[(i * 4 + 3) % POOL.length],
  ],
}));

// Aspect ratios for carousel images, cycled by index — keeps the stack
// visually varied like the grid view rather than uniformly tall.
const CAROUSEL_ASPECTS = [1.5, 0.85, 1.33, 1.0, 0.75, 1.7];

// Wheel-driven carousel motion (same model as gridScroll).
const WHEEL_GAIN = 0.03;
const VELOCITY_DECAY = 0.92;
// Constant baseline drift in px/frame (~60fps) — matches contactPreview's
// BASE_SPEED for a similar floaty feel. Paused while the user is dragging.
const AUTO_SCROLL_SPEED = 0.4;

export default function ListView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const carouselRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Persisted per-item scroll offset so switching tabs doesn't snap the
  // carousel back to the top — the active item resumes where it left off.
  const carouselOffsets = useRef<number[]>(ITEMS.map(() => 0));
  const [activeIndex, setActiveIndex] = useState(4);
  const [openIndex, setOpenIndex] = useState(4);
  const activeRef = useRef(activeIndex);

  const selectInstant = (i: number) => {
    activeRef.current = i;
    setActiveIndex(i);
    setOpenIndex(i);
  };

  // Pill is a hover-only indicator. The active row paints its own surface,
  // so the pill is free to chase the pointer without losing the active state.
  // Clip-path is used (instead of opacity) so the reveal/conceal direction
  // can match the cursor's motion — entering from above clips in top-down,
  // entering from below clips in bottom-up. Same for leaving.
  useEffect(() => {
    const pill = pillRef.current;
    const track = trackRef.current;
    if (!pill || !track) return;
    const items = itemRefs.current;

    const CLOSED_TOP = "inset(0 0 100% 0)"; // anchored at top, visible h = 0
    const CLOSED_BOT = "inset(100% 0 0 0)"; // anchored at bottom, visible h = 0
    const OPEN = "inset(0 0 0 0)";

    gsap.set(pill, { clipPath: CLOSED_TOP });
    let pillVisible = false;
    let lastClientY = 0;

    const onTrackMove = (e: MouseEvent) => {
      lastClientY = e.clientY;
    };
    track.addEventListener("mousemove", onTrackMove);

    const cleanups: (() => void)[] = [
      () => track.removeEventListener("mousemove", onTrackMove),
    ];

    items.forEach((item) => {
      if (!item) return;
      const onEnter = (e: MouseEvent) => {
        const movingDown = e.clientY >= lastClientY;
        if (!pillVisible) {
          // Snap y, then fromTo the clip. gsap.set + gsap.to on the same
          // property in the same tick can collapse if the start value already
          // matches the current rendered value — fromTo forces a delta.
          gsap.set(pill, { y: item.offsetTop });
          gsap.fromTo(
            pill,
            { clipPath: movingDown ? CLOSED_TOP : CLOSED_BOT },
            {
              clipPath: OPEN,
              duration: 0.4,
              ease: "expo.out",
              overwrite: "auto",
            },
          );
          pillVisible = true;
        } else {
          gsap.to(pill, {
            y: item.offsetTop,
            duration: 0.6,
            ease: "expo.out",
            overwrite: "auto",
          });
        }
        lastClientY = e.clientY;
      };
      item.addEventListener("mouseenter", onEnter as EventListener);
      cleanups.push(() =>
        item.removeEventListener("mouseenter", onEnter as EventListener),
      );
    });

    const onLeave = (e: MouseEvent) => {
      const movingDown = e.clientY > lastClientY;
      // Clip out in the direction of motion — pill "follows" the cursor out.
      // Cursor moving down → top extends downward (CLOSED_BOT).
      // Cursor moving up → bottom extends upward (CLOSED_TOP).
      gsap.to(pill, {
        clipPath: movingDown ? CLOSED_BOT : CLOSED_TOP,
        duration: 0.4,
        ease: "expo.out",
        overwrite: "auto",
      });
      pillVisible = false;
      lastClientY = e.clientY;
    };
    track.addEventListener("mouseleave", onLeave as EventListener);
    cleanups.push(() =>
      track.removeEventListener("mouseleave", onLeave as EventListener),
    );

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Horizontal carousel for the active row's image strip — per-card transforms
  // so each image wraps individually (gridScroll's pattern). Wheel + pointer
  // drag accumulate into `velocity`, decay each frame, and update a shared
  // shift value. Each card teleports past the right edge once it has fully
  // exited the left, giving a truly infinite loop with no whole-track snap.
  useEffect(() => {
    const carousel = carouselRefs.current[activeIndex];
    if (!carousel) return;

    let velocity = 0;
    let rafId = 0;
    let bases: number[] = [];
    let widths: number[] = [];
    let totalW = 1;

    let isDragging = false;
    let dragPointerId: number | null = null;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let lastPointerVelocity = 0;
    let dragMoved = false;

    const cardsOf = () =>
      Array.from(carousel.querySelectorAll<HTMLElement>(`.${s.carouselItem}`));

    const measure = () => {
      const remPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const gap = remPx * 8;
      const cards = cardsOf();
      let acc = 0;
      bases = [];
      widths = [];
      cards.forEach((card) => {
        const w = card.offsetWidth;
        bases.push(acc);
        widths.push(w);
        acc += w + gap;
      });
      totalW = acc;
    };

    const wrap = (val: number, w: number) => (w > 0 ? ((val % w) + w) % w : 0);

    const applyShift = (shift: number) => {
      const cards = cardsOf();
      for (let i = 0; i < cards.length; i++) {
        const w = widths[i] ?? 0;
        // Wrap window offset by card width so a card only teleports when it
        // is fully off-screen left, then reappears past the right edge.
        const x = wrap(bases[i] - shift + w, totalW) - w;
        cards[i].style.transform = `translate3d(${x}px,0,0)`;
      }
    };

    measure();
    applyShift(carouselOffsets.current[activeIndex]);

    const ro = new ResizeObserver(() => {
      measure();
      applyShift(carouselOffsets.current[activeIndex]);
    });
    ro.observe(carousel);

    const onWheel = (e: WheelEvent) => {
      // Trackpad horizontal swipes / shift+wheel emit deltaX; mouse wheel
      // emits deltaY. Take whichever axis has the larger magnitude so the
      // carousel responds to both gestures naturally.
      e.preventDefault();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      velocity += delta * WHEEL_GAIN;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isDragging = true;
      dragPointerId = e.pointerId;
      lastPointerX = e.clientX;
      lastPointerTime = performance.now();
      lastPointerVelocity = 0;
      dragMoved = false;
      velocity = 0;
      try {
        carousel.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== dragPointerId) return;
      const x = e.clientX;
      const dx = lastPointerX - x;
      if (Math.abs(dx) > 2) dragMoved = true;
      const now = performance.now();
      const dt = Math.max(now - lastPointerTime, 1);
      lastPointerVelocity = (dx / dt) * 16;
      lastPointerX = x;
      lastPointerTime = now;
      carouselOffsets.current[activeIndex] += dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== dragPointerId) return;
      isDragging = false;
      dragPointerId = null;
      velocity = lastPointerVelocity;
      try {
        carousel.releasePointerCapture(e.pointerId);
      } catch {}
      if (dragMoved) {
        const suppress = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
          carousel.removeEventListener("click", suppress, true);
        };
        carousel.addEventListener("click", suppress, true);
      }
    };

    const loop = () => {
      if (!isDragging) {
        velocity *= VELOCITY_DECAY;
        carouselOffsets.current[activeIndex] += velocity + AUTO_SCROLL_SPEED;
      }
      applyShift(carouselOffsets.current[activeIndex]);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    carousel.addEventListener("wheel", onWheel, { passive: false });
    carousel.addEventListener("pointerdown", onPointerDown);
    carousel.addEventListener("pointermove", onPointerMove);
    carousel.addEventListener("pointerup", endDrag);
    carousel.addEventListener("pointercancel", endDrag);

    return () => {
      cancelAnimationFrame(rafId);
      carousel.removeEventListener("wheel", onWheel);
      carousel.removeEventListener("pointerdown", onPointerDown);
      carousel.removeEventListener("pointermove", onPointerMove);
      carousel.removeEventListener("pointerup", endDrag);
      carousel.removeEventListener("pointercancel", endDrag);
      ro.disconnect();
      // Don't clear the transform — leaving it in place means the next time
      // this item becomes active, it resumes visually instead of snapping.
    };
  }, [activeIndex]);

  return (
    <section ref={rootRef} className={s.root}>
      <div ref={trackRef} className={s.track}>
        <div ref={pillRef} className={s.pill} aria-hidden />
        {ITEMS.map((item, i) => (
          <button
            key={`${item.title}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            className={c(
              s.label,
              i === activeIndex && s.active,
              i === openIndex && s.open,
            )}
            aria-label={`Show ${item.title}`}
            aria-pressed={i === activeIndex}
            onClick={() => selectInstant(i)}
          >
            <div className={s.textCell}>
              <span className={c(s.text, t.cta)}>{item.title}</span>
              <span className={c(s.year, t.cta)}>{item.year}</span>
            </div>
            <div className={s.image} aria-hidden={i !== activeIndex}>
              <div
                ref={(el) => {
                  carouselRefs.current[i] = el;
                }}
                className={s.carousel}
                data-lenis-prevent
              >
                {[...item.images, ...item.images].map((src, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={s.carouselItem}
                    style={{
                      aspectRatio:
                        CAROUSEL_ASPECTS[(i + j) % CAROUSEL_ASPECTS.length],
                    }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="40vw"
                      priority={j === 0 && i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
