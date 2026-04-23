"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import Canvas from "./canvas";
import SplitText from "@/components/splitText";
import CapeTownTime from "@/components/capeTownTime";
import s from "./hero.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  page?: string;
}

export default function Hero({ page }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const item = {
    title:
      "A state-of-the-art studio facility that thrives on bringing creative ideas to life.",
    tag: 1997,
    scrollLabel: "Scroll Down",
  };

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const tween = gsap.fromTo(
      inner,
      { y: "0%" },
      {
        y: "20%",
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
    };
  }, []);

  return (
    <section className={s.root} ref={containerRef} data-hero>
      <div className={s.inner} ref={innerRef}>
        <div className={s.content}>
          <div className={s.center}>
            <div className={c(s.tag, t.tag)} style={{ overflow: "clip" }}>
              <div
                className={a.moveUp}
                style={{ "--delay": "0.56s" } as React.CSSProperties}
              >
                Since {item.tag}
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
                <CapeTownTime className={c(s.time, t.cta)} />
              </div>
            </div>
            <div style={{ overflow: "clip" }}>
              <div
                className={a.moveUp}
                style={{ "--delay": "0.86s" } as React.CSSProperties}
              >
                <span
                  className={c(s.scrollLabel, t.cta)}
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
      </div>
    </section>
  );
}
