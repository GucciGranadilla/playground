"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import SplitText from "@/components/splitText";
import s from "./textBlock.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";

interface TextBlockProps {
  page?: string;
}

export default function TextBlock({ page }: TextBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className={c(s.body, t.xl)}>
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
            { text: "the energy they want to create," },
            { text: "and the moments they hope to inspire." },
          ]}
        />
      </div>
    </section>
  );
}
