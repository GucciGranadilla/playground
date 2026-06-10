"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";
import SplitText from "@/components/splitText";
import ParallaxImage from "@/components/parallaxImage";
import s from "./textImageBlock.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";
import { resolveLink, type SanityLink } from "@/utils/resolveLink";

type MediaImage = {
  alt?: string;
  asset?: { _id?: string; url?: string };
};

type TextImageBlockSection = {
  _key?: string;
  _type?: "textImageBlock";
  tag?: string;
  title?: string;
  text?: string;
  image?: {
    alt?: string;
    image?: MediaImage;
  };
  imageName?: string;
  imageYear?: number;
  link?: SanityLink;
};

interface TextImageBlockProps {
  page?: string | { _id?: string };
  section?: TextImageBlockSection;
}

const FALLBACK = {
  tag: "The next project",
  title:
    "The right collaboration makes the difference between work that exists and work that endures.",
  text: "I take a limited number of projects each year to ensure every engagement receives the full weight of my attention. If you're building something that demands precision, I'd like to hear about it.",
  image: { src: "/images/aurora-card.avif", name: "Kevin Davis", year: 2025 },
  link: { href: "/contact-preview", label: "Get in touch" },
};

export default function TextImageBlock({ section }: TextImageBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedLink = resolveLink(section?.link);

  const item = {
    tag: section?.tag || FALLBACK.tag,
    title: section?.title || FALLBACK.title,
    text: section?.text || FALLBACK.text,
    image: {
      src: section?.image?.image?.asset?.url || FALLBACK.image.src,
      name:
        section?.image?.alt ||
        section?.imageName ||
        FALLBACK.image.name,
      year: section?.imageYear ?? FALLBACK.image.year,
    },
    link: resolvedLink?.href
      ? { href: resolvedLink.href, label: resolvedLink.label || FALLBACK.link.label, external: resolvedLink.external }
      : FALLBACK.link,
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
          text={item.title}
          type="lines"
          trigger="scroll"
          delay={0}
          stagger={0.04}
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
        {("external" in item.link && item.link.external) ? (
          <a
            href={item.link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={c(s.link, t.cta, a.fadeUp50Scroll)}
            style={{ "--delay": "0.52s" } as React.CSSProperties}
          >
            {item.link.label}
          </a>
        ) : (
          <Link
            href={item.link.href}
            className={c(s.link, t.cta, a.fadeUp50Scroll)}
            style={{ "--delay": "0.52s" } as React.CSSProperties}
          >
            {item.link.label}
          </Link>
        )}
      </div>
    </section>
  );
}
