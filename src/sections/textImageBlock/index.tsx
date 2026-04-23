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
      name: "Gavin Schneider Productions",
      year: 2025,
    },
    title:
      "A state-of-the-art studio facility that thrives on bringing creative ideas to life.",
    tag: "Let’s work together",
    text: "Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. My approach is rooted in collaboration, we work with friends and other creative teams to achieve results.",
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
            { text: "Each project begins with" },
            { text: "how the space should feel," },
            {
              text: "shaped by the client's vision, the energy they want to create, and",
            },
            { text: "the moments they hope to inspire." },
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
