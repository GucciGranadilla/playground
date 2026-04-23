import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  animate,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import SplitText from "@/components/splitText";
import ParallaxImage from "@/components/parallaxImage";
import s from "./textTicker.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";
import { createAudioChain } from "@/utils/createAudioChain";
import { link } from "fs";

interface TextTickerProps {
  page?: string;
}

const items = {
  image: {
    src: "/images/kevin.jpg",
    name: "Gavin Schneider Productions",
    year: 2025,
  },
  tag: "About the building",
  text: [
    "Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. My approach is rooted in collaboration, we work with friends and other creative teams to achieve results.",
    "2 Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. My approach is rooted in collaboration, we work with friends and other creative teams to achieve results.",
    "3 Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. My approach is rooted in collaboration, we work with friends and other creative teams to achieve results.",
  ],
  link: {
    href: "/about",
    label: "Learn more",
  },
};

const count = items.text.length;

export default function TextTicker({ page }: TextTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorBlockRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef(0);
  const lastIndexRef = useRef(0);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const indicatorFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const playRef = useRef<(() => void) | null>(null);

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
  }, []);

  const measureRange = () => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    const paddingBottom = parseFloat(getComputedStyle(el).paddingBottom) || 0;
    const contentTopInSection =
      content.getBoundingClientRect().top - el.getBoundingClientRect().top;
    rangeRef.current =
      el.offsetHeight -
      contentTopInSection -
      content.offsetHeight -
      paddingBottom;
  };

  useLayoutEffect(() => {
    measureRange();
    const ro = new ResizeObserver(measureRange);
    ro.observe(containerRef.current!);

    // Set initial text states
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

  const isInView = useInView(containerRef, {
    once: true,
    margin: "0px 0px -30% 0px",
  });

  useEffect(() => {
    if (!isInView) return;
    const el = containerRef.current;
    const colorBlock = colorBlockRef.current;
    if (!el || !colorBlock) return;
    const color = `hsl(${randomHue}, 70%, 55%)`;
    colorBlock.style.backgroundColor = color;
    el.style.setProperty("--accent", color);
    el.classList.add(a.inView);
  }, [isInView]);

  const { scrollYProgress } = useScroll({
    target: contentWrapperRef,
    offset: ["center end", "end 0.3"],
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
    <section className={s.root} ref={containerRef}>
      <div className={c(s.body, t.l)}>
        <SplitText
          text="Beautifully designed, hassle-free spaces across London, crafted to be your personal sanctuary."
          type="words"
          trigger="scroll"
          delay={0}
          stagger={0.04}
        />
      </div>
      <div className={s.blocks}>
        <div
          className={c(s.imageWrap)}
          style={{ "--delay": "0.575s" } as React.CSSProperties}
        >
          <ParallaxImage
            src={items.image.src}
            alt={items.image.name}
            sizes="(max-width: 768px) 100vw, 50vw"
            className={s.image}
          />
        </div>
        <div
          ref={colorBlockRef}
          className={c(s.colorBlock)}
          style={{ "--delay": "0.375s" } as React.CSSProperties}
        />
      </div>
      <div className={s.contentWrapper} ref={contentWrapperRef}>
        <motion.div className={s.content} ref={contentRef} style={{ y }}>
          <h2 className={c(s.tag, t.tag)} style={{ overflow: "clip" }}>
            <span
              className={a.fadeUp50Scroll}
              style={
                { "--delay": "0.24s", display: "block" } as React.CSSProperties
              }
            >
              {items.tag}
            </span>
          </h2>
          <div className={s.indicators}>
            {items.text.map((_, i) => (
              <span
                key={i}
                className={c(s.indicator, a.fadeUp50Scroll)}
                style={
                  { "--delay": `${0.2 + i * 0.08}s` } as React.CSSProperties
                }
              >
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
            className={c(s.textWrap, a.fadeUp50Scroll)}
            style={{ "--delay": "0.42s" } as React.CSSProperties}
          >
            {items.text.map((line, i) => (
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
          <Link
            href={items.link.href}
            className={c(s.link, t.cta, a.fadeUp50Scroll)}
            style={{ "--delay": "0.52s" } as React.CSSProperties}
          >
            {items.link.label}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
