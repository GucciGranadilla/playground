"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import Canvas from "./canvas";
import SplitText from "@/components/splitText";
import CapeTownTime from "@/components/capeTownTime";
import s from "./hero.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import useMobile from "@/utils/useMobile";

interface HeroData {
  tag?: string;
  title?: string;
  version?: string;
  scrollLabel?: string;
}

interface HeroProps {
  page?: string;
  hero?: HeroData;
}

export default function Hero({ hero }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const isMobile = useMobile();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const innerY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const item = {
    title:
      hero?.title ||
      "A bespoke digital studio where brand identity design and engineering become one",
    tag: hero?.tag || "Digital studio",
    version: hero?.version || "v0.0.1 alpha",
    scrollLabel: hero?.scrollLabel || "Scroll Down",
  };

  return (
    <section className={s.root} ref={containerRef} data-hero>
      <motion.div
        className={s.inner}
        style={isMobile ? undefined : { y: innerY }}
      >
        <div className={s.content}>
          <div className={s.center}>
            <div className={c(s.tag, t.tag)} style={{ overflow: "clip" }}>
              <div
                className={a.moveUp}
                style={{ "--delay": "0.56s" } as React.CSSProperties}
              >
                {item.tag}
              </div>
            </div>
            <div className={c(s.title, t.xl)}>
              <SplitText
                text={item.title}
                type="words"
                delay={0.66}
                stagger={0.045}
              />
            </div>
          </div>
          <div className={s.bottom}>
            <div style={{ overflow: "clip" }}>
              <div
                className={a.moveUp}
                style={{ "--delay": "0.8s" } as React.CSSProperties}
              >
                <CapeTownTime className={c(s.time, t.cta)} showStatus />
              </div>
            </div>
            <div className={c(s.version, t.cta)} style={{ overflow: "clip" }}>
              <div
                className={a.moveUp}
                style={{ "--delay": "0.52s" } as React.CSSProperties}
              >
                {item.version}
              </div>
            </div>
            <div className={s.scrollLabel}>
              <div
                className={a.moveUp}
                style={{ "--delay": "0.86s" } as React.CSSProperties}
              >
                <span
                  className={t.cta}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    lenis?.scrollTo(
                      containerRef.current?.offsetHeight ?? window.innerHeight,
                      {
                        duration: 1.2,
                        easing: (t: number) => 1 - Math.pow(1 - t, 4),
                      },
                    );
                  }}
                >
                  {item.scrollLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={s.bg}>
          <div className={s.image}>
            <Canvas />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
