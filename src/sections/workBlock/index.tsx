"use client";

import { useEffect } from "react";
import ParallaxImage from "@/components/parallaxImage";
import Video from "@/components/video";

import c from "@/utils/classNames";
import s from "./workBlock.module.scss";
import t from "@/styles/text.module.scss";
import { randomHue } from "@/utils/randomHue";
import { WorkItem } from "@/data/workItems";

interface WorkBlockProps {
  page: WorkItem;
}

export default function WorkBlock({ page }: WorkBlockProps) {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      `hsl(${randomHue}, 70%, 55%)`,
    );
  }, []);

  return (
    <section className={s.root} data-nav-bg>
      <div className={s.header}>
        <span className={c(s.client, t.tag)}>{page.client}</span>
        <span className={c(s.year, t.tag)}>{page.year}</span>
        <h1 className={c(s.title, t.xl)}>{page.title}</h1>
        <p className={c(s.excerpt, t.p)}>{page.excerpt}</p>
      </div>

      <div className={s.blocks}>
        {page.images.map((item, i) => (
          <div
            key={i}
            className={s.cell}
            style={{
              gridColumn: `span ${item.gridSpan}`,
              aspectRatio: item.aspectRatio,
            }}
          >
            {item.type === "video" ? (
              <Video
                mobileSrc={item.mobileSrc}
                desktopSrc={item.desktopSrc}
                className={s.videoCell}
                innerClass={s.videoInner}
                lazy
              />
            ) : (
              <ParallaxImage
                src={item.src}
                alt={`${page.title} — ${page.client}`}
                sizes={`${Math.round((item.gridSpan / 8) * 96)}vw`}
                className={s.image}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
