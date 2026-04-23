"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { imagePlaceholders } from "@/utils/imagePlaceholders";

interface ParallaxImageProps {
  src: string;
  alt: string;
  sizes: string;
  quality?: number;
  priority?: boolean;
  className?: string;
  /** Enable scroll parallax. Default: true */
  parallax?: boolean;
  /**
   * Parallax intensity as a percentage of the container (0–100).
   * Controls both the scale-up and total vertical travel distance.
   * Default: 12
   */
  parallaxAmount?: number;
  /** useScroll start offset (Framer Motion format). Default: "start end" */
  parallaxStart?: string;
  /** useScroll end offset (Framer Motion format). Default: "end start" */
  parallaxEnd?: string;
}

export default function ParallaxImage({
  src,
  alt,
  sizes,
  quality = 85,
  priority,
  className,
  parallax = true,
  parallaxAmount = 12,
  parallaxStart = "start end",
  parallaxEnd = "end start",
}: ParallaxImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const intensity = parallaxAmount / 100;
  const scale = 1 + intensity;
  const travel = intensity * 100;
  const start = -(travel / 2);
  const end = travel / 2;

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: [parallaxStart, parallaxEnd] as any,
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${start}%`, `${end}%`]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          scale: parallax ? scale : 1,
          y: parallax ? y : 0,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={imagePlaceholders[src] ? "blur" : "empty"}
          blurDataURL={imagePlaceholders[src]}
          style={{ objectFit: "cover", filter: "brightness(0.85)" }}
        />
      </motion.div>
    </div>
  );
}
