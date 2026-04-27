"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import SplitText from "@/components/splitText";
import ParallaxImage from "@/components/parallaxImage";
import s from "./textImageBlock.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";

interface TextBlockProps {
  page?: string;
}

export default function TextBlock({ page }: TextBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const item = {
    image: {
      src: "/images/d7f035241a98e3094fc1216a91be7a40.jpg",
      name: "Kevin Davis",
      year: 2025,
    },
    title:
      "The right collaboration makes the difference between work that exists and work that endures.",
    tag: "The next project",
    text: "I take a limited number of projects each year to ensure every engagement receives the full weight of my attention. If you’re building something that demands precision, I’d like to hear about it.",
    link: {
      href: "/contact",
      label: "Get in touch",
    },
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      `hsl(${randomHue}, 70%, 55%)`,
    );
  }, []);

  const isInView = useInView(containerRef, {
    once: true,
    margin: "0px 0px -20% 0px",
  });

  useEffect(() => {
    if (!isInView) return;
    containerRef.current?.classList.add(a.inView);
  }, [isInView]);

  return (
    <section className={s.root} ref={containerRef}>
      <div
        className={c(s.imageWrap)}
        style={{ "--delay": "0.575s" } as React.CSSProperties}
      >
        <ParallaxImage
          src={item.image.src}
          alt={item.image.name}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={s.image}
        />
      </div>
      <div className={c(s.body, t.l)}>
        <SplitText
          trigger="scroll"
          delay={0}
          stagger={0.01}
          segments={[
            { text: "The right collaboration makes" },
            { text: "the difference between work" },
            { text: "that exists and work" },
            { text: "that endures." },
            { text: "It starts with understanding" },
            { text: "not what the brand wants to say" },
            { text: "but what it needs" },
            { text: "the world to feel." },
          ]}
        />
      </div>
      <div className={s.content}>
        <h2 className={c(s.tag, t.tag)} style={{ overflow: "clip" }}>
          <span
            className={a.fadeUp50Scroll}
            style={
              { "--delay": "0.24s", display: "block" } as React.CSSProperties
            }
          >
            {item.tag}
          </span>
        </h2>
        <div
          className={c(s.textWrap, a.fadeUp50Scroll)}
          style={{ "--delay": "0.42s" } as React.CSSProperties}
        >
          <p className={c(s.textItem, t.p)}>{item.text}</p>
        </div>
        <a
          href={item.link.href}
          className={c(s.link, t.cta, a.fadeUp50Scroll)}
          style={{ "--delay": "0.52s" } as React.CSSProperties}
        >
          {item.link.label}
        </a>
      </div>
    </section>
  );
}
