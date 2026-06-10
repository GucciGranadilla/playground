"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

import s from "./gridScroll.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";

type Card =
  | {
      kind: "image";
      src: string;
      alt: string;
      aspect: number;
      caption?: string;
    }
  | {
      kind: "video";
      src: string;
      poster?: string;
      aspect: number;
      caption?: string;
    };

const SYN = "/images/synthetic-origins";

const VIMEO = (id: string, sig: string) =>
  `https://player.vimeo.com/progressive_redirect/playback/${id}/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&log_user=0&signature=${sig}`;

const VIDEOS = [
  VIMEO(
    "1185062965",
    "8a8a9b590b3143a0d101ed9873aef39d09f89fd885530837a1c9fa7b02a427e6",
  ),
  VIMEO(
    "1185062932",
    "0698a04081163c1c9ba81fffea191d27770fce04a2ebb41291612b0db79f53a3",
  ),
  VIMEO(
    "1185062815",
    "5ce15b44e4b114911f38373d500c95e7f6cd6abb1f48ee46e12fe016ef387b5a",
  ),
  VIMEO(
    "1185062895",
    "66606ec48fd85d90488f48255509d6f194b259ba9ab1ba1825a605836423dbf8",
  ),
  VIMEO(
    "1185062819",
    "8cdcf54d622846224e1e36d96c6c606b855e59d33791071d8cf921cae7706aec",
  ),
  VIMEO(
    "1185062920",
    "6562c9569ff6d393d4a76bf62c547bbe8e88030a658f0bab441fb864eeb50eb4",
  ),
];

const ROW_TOP: Card[] = [
  {
    kind: "image",
    src: "/images/aurora.avif",
    alt: "Aurora study",
    aspect: 1.5,
    caption: "Aurora — 01",
  },
  { kind: "video", src: VIDEOS[0], aspect: 0.78, caption: "Motion — 02" },
  {
    kind: "image",
    src: "/images/lewisburg.jpg",
    alt: "Lewisburg",
    aspect: 1.33,
    caption: "Lewisburg — 03",
  },
  {
    kind: "image",
    src: "/images/pp.avif",
    alt: "Portrait",
    aspect: 0.85,
    caption: "Portrait — 04",
  },
  { kind: "video", src: VIDEOS[1], aspect: 1.7, caption: "Motion — 05" },
  {
    kind: "image",
    src: "/images/horse-bw.jpg",
    alt: "Horse",
    aspect: 1.2,
    caption: "Field — 06",
  },
];

const ROW_MID: Card[] = [
  {
    kind: "image",
    src: `${SYN}/Gemini_Generated_Image_xqxcmbxqxcmbxqxc.png`,
    alt: "Origin study",
    aspect: 1.0,
    caption: "Origin — 07",
  },
  {
    kind: "image",
    src: "/images/snow.png",
    alt: "Snow",
    aspect: 1.78,
    caption: "Snow — 08",
  },
  { kind: "video", src: VIDEOS[2], aspect: 0.72, caption: "Motion — 09" },
  {
    kind: "image",
    src: `${SYN}/Gemini_Generated_Image_pkuf02pkuf02pkuf.png`,
    alt: "Origin study",
    aspect: 1.45,
    caption: "Origin — 10",
  },
  {
    kind: "image",
    src: "/images/tulbag.jpg",
    alt: "Tulbag",
    aspect: 0.9,
    caption: "Tulbag — 11",
  },
  { kind: "video", src: VIDEOS[3], aspect: 1.3, caption: "Motion — 12" },
  {
    kind: "image",
    src: "/images/gsp-work-image-2.jpg",
    alt: "Project",
    aspect: 1.5,
    caption: "Field — 13",
  },
];

const ROW_BOT: Card[] = [
  {
    kind: "image",
    src: "/images/washington.jpg",
    alt: "Washington",
    aspect: 1.4,
    caption: "Washington — 14",
  },
  { kind: "video", src: VIDEOS[4], aspect: 0.8, caption: "Motion — 15" },
  {
    kind: "image",
    src: "/images/kevin-spur.jpg",
    alt: "Spur",
    aspect: 1.0,
    caption: "Field — 16",
  },
  {
    kind: "image",
    src: `${SYN}/Gemini_Generated_Image_x1gzdfx1gzdfx1gz.png`,
    alt: "Origin study",
    aspect: 1.6,
    caption: "Origin — 17",
  },
  {
    kind: "image",
    src: "/images/lewisburg-upscale.png",
    alt: "Lewisburg",
    aspect: 0.95,
    caption: "Lewisburg — 18",
  },
  { kind: "video", src: VIDEOS[5], aspect: 1.25, caption: "Motion — 19" },
];

// Per-row travel multiplier (top medium, mid fastest, bottom slowest).
const SPEED_TOP = 0.85;
const SPEED_MID = 1.55;
const SPEED_BOT = 0.6;
// Lerp factor toward the top row's extra. 1 = no smoothing (top); lower = more drag.
// Match the contactPreview marquee — its 0.07 LERP between leader/follower
// gives a much softer trail. Bot trails a touch slower than mid for variety.
const LERP_MID = 0.07;
const LERP_BOT = 0.04;
const GAP_REM = 4;
const WHEEL_GAIN = 0.03;
const VELOCITY_DECAY = 0.92;

const wrap = (val: number, w: number) => (w > 0 ? ((val % w) + w) % w : 0);

export default function GridScroll() {
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const topEl = topRef.current;
    const midEl = midRef.current;
    const botEl = botRef.current;
    if (!root || !topEl || !midEl || !botEl) return;

    type RowState = {
      cards: HTMLElement[];
      bases: number[];
      widths: number[];
      totalW: number;
      speed: number;
    };

    const rows: RowState[] = [
      { cards: [], bases: [], widths: [], totalW: 1, speed: SPEED_TOP },
      { cards: [], bases: [], widths: [], totalW: 1, speed: SPEED_MID },
      { cards: [], bases: [], widths: [], totalW: 1, speed: SPEED_BOT },
    ];
    const tracks = [topEl, midEl, botEl];

    rows.forEach((row, i) => {
      row.cards = Array.from(
        tracks[i].querySelectorAll<HTMLElement>(`.${s.card}`),
      );
    });

    const measure = () => {
      const remPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const gap = remPx * GAP_REM;
      rows.forEach((row) => {
        let acc = 0;
        row.bases = [];
        row.widths = [];
        row.cards.forEach((card) => {
          const w = card.offsetWidth;
          row.bases.push(acc);
          row.widths.push(w);
          acc += w + gap;
        });
        row.totalW = acc;
      });
    };

    measure();

    // Top row tracks the wheel-driven extra directly; mid and bot lerp toward
    // it at different rates for smoothed/lagged variation.
    // baseOff, dragOffset and dragVelocity are per-row so a grab+throw on one
    // row affects only that row — independent of the wheel/auto motion that
    // still drives all three.
    const baseOffs = [0, 0, 0];
    const dragOffsets = [0, 0, 0];
    const dragVelocities = [0, 0, 0];
    let extraTop = 0;
    let extraMid = 0;
    let extraBot = 0;
    let velocity = 0;
    let rafId = 0;
    let visible = true;

    let dragRow = -1;
    let dragPointerId: number | null = null;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let lastPointerVelocity = 0;
    let dragMoved = false;

    const trackEls = [topEl, midEl, botEl];

    const findRow = (clientY: number): number => {
      for (let r = 0; r < 3; r++) {
        const el = trackEls[r];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) return r;
      }
      return -1;
    };

    const onWheel = (e: WheelEvent) => {
      // Take whichever axis has the larger magnitude so trackpad horizontal
      // swipes and vertical mouse wheel both drive the same horizontal motion.
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      velocity += delta * WHEEL_GAIN;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const r = findRow(e.clientY);
      if (r < 0) return;
      dragRow = r;
      dragPointerId = e.pointerId;
      lastPointerX = e.clientX;
      lastPointerTime = performance.now();
      lastPointerVelocity = 0;
      dragMoved = false;
      dragVelocities[r] = 0;
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragRow < 0 || e.pointerId !== dragPointerId) return;
      const dx = lastPointerX - e.clientX;
      if (Math.abs(dx) > 2) dragMoved = true;
      const now = performance.now();
      const dt = Math.max(now - lastPointerTime, 1);
      lastPointerVelocity = (dx / dt) * 16;
      lastPointerX = e.clientX;
      lastPointerTime = now;
      // Direct 1:1 movement on the grabbed row only.
      dragOffsets[dragRow] += dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (dragRow < 0 || e.pointerId !== dragPointerId) return;
      const r = dragRow;
      dragRow = -1;
      dragPointerId = null;
      dragVelocities[r] = lastPointerVelocity;
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {}
      if (dragMoved) {
        const suppress = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
          root.removeEventListener("click", suppress, true);
        };
        root.addEventListener("click", suppress, true);
      }
    };

    const loop = () => {
      velocity *= VELOCITY_DECAY;
      extraTop += velocity;
      extraMid += (extraTop - extraMid) * LERP_MID;
      extraBot += (extraTop - extraBot) * LERP_BOT;
      const extras = [extraTop, extraMid, extraBot];
      for (let r = 0; r < rows.length; r++) {
        // Auto-scroll baseline and the drag throw both pause for the row
        // currently being grabbed so the gesture reads as 1:1.
        if (r !== dragRow) {
          baseOffs[r] += 0.6;
          dragVelocities[r] *= VELOCITY_DECAY;
          dragOffsets[r] += dragVelocities[r];
        }
        const row = rows[r];
        const shift = (baseOffs[r] + extras[r]) * row.speed + dragOffsets[r];
        const { cards, bases, widths, totalW } = row;
        for (let i = 0; i < cards.length; i++) {
          const w = widths[i];
          // Wrap window is offset by card width so a card exits the left only
          // once it's fully off-screen, then reappears past the right edge.
          const x = wrap(bases[i] - shift + w, totalW) - w;
          cards[i].style.transform = `translate3d(${x}px,0,0)`;
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.isIntersecting;
        if (nowVisible === visible) return;
        visible = nowVisible;
        if (visible) {
          rafId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 },
    );
    io.observe(root);

    const ro = new ResizeObserver(measure);
    ro.observe(root);

    window.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const renderCard = (card: Card, key: string) => (
    <div
      key={key}
      className={s.card}
      style={{ width: `calc(var(--row-h) * ${card.aspect})` }}
    >
      <div className={s.cardMedia}>
        {card.kind === "image" ? (
          <Image src={card.src} alt={card.alt} fill sizes="40vw" />
        ) : (
          <video
            className={s.video}
            src={card.src}
            poster={card.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        )}
      </div>
      {card.caption && (
        <div className={c(s.cardCaption, t.cta)}>
          {(() => {
            const [name, idx] = card.caption.split(" — ");
            return (
              <>
                <span>{name}</span>
                {idx && <span>{idx}</span>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );

  const renderRow = (
    cards: Card[],
    refEl: React.RefObject<HTMLDivElement | null>,
    rowKey: string,
  ) => (
    <div className={s.row}>
      <div ref={refEl} className={s.track}>
        {cards.map((card, i) => renderCard(card, `${rowKey}-${i}`))}
      </div>
    </div>
  );

  return (
    <section ref={rootRef} className={s.root}>
      <div className={s.sticky}>
        {renderRow(ROW_TOP, topRef, "top")}
        {renderRow(ROW_MID, midRef, "mid")}
        {renderRow(ROW_BOT, botRef, "bot")}
      </div>
    </section>
  );
}
