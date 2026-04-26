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
        <span className={c(s.client, t.md)}>{page.client}</span>
        <h1 className={c(s.title, t.xxl)}>{page.title}</h1>
      </div>

      <div className={s.blocks}>
        {page.images.map((item, i) => (
          <div
            key={i}
            className={c(s.cell, item.gridSpan === 8 ? s.full : null)}
            style={{ gridColumn: `span ${item.gridSpan}` }}
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
                sizes={item.gridSpan === 8 ? "96vw" : "48vw"}
                className={s.image}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
