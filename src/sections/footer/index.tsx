import { useCallback, useRef } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { motion, useScroll, useTransform } from "framer-motion";
import CapeTownTime from "@/components/capeTownTime";
import ParallaxImage from "@/components/parallaxImage";

import s from "./footer.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";

interface FooterProps {
  page?: string;
}

export default function Footer({ page }: FooterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, watchDrag: false },
    [AutoScroll({ speed: 1.4, stopOnInteraction: false })],
  );
  const logoMergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      emblaRef(node);
    },
    [emblaRef],
  );

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "start start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(14% 14% 0 14%)", "inset(0% 0% 0 0%)"],
  );

  const y = useTransform(scrollYProgress, [0.5, 1], ["50vh", "0vh"]);

  const items = {
    logo: "kevin:davis",
    image: {
      src: "/images/footer.jpg",
    },
    contact: {
      text: "Thoughts, projects, and updates",
      link: {
        label: "Subscribe Now",
        href: "mailto:kevidavis911@gmail.com",
      },
    },
    copyright: "© 2025. All Rights Reserved",
    links: [
      { label: "Work", href: "/about" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "mailto:kevidavis911@gmail.com" },
    ],
  };

  return (
    <footer className={s.root} ref={rootRef}>
      <motion.div className={s.bg} style={{ clipPath }}>
        <ParallaxImage
          src={items.image.src}
          alt=""
          sizes="100vw"
          className={s.image}
        />
      </motion.div>
      <motion.div className={s.logoWrapper} style={{ y }}>
        <div className={s.glassFilter} />
        <div className={s.glassOverlay} />
        <div className={s.glassSpecular} />
        <div className={s.logo} ref={logoMergedRef}>
          <div className={s.logoTrack}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={c(s.logoItem, t.xxl)}>
                {items.logo}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <svg style={{ display: "none" }}>
        <filter id="lg-dist" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.006"
            numOctaves={2}
            seed={92}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation={5} result="blurred" />
          {/* Single displacement pass */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale={160}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Cheap feOffset chromatic split from the already-displaced result */}
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="displaced"
            result="chanR"
          />
          <feOffset in="chanR" dx={4} dy={0} result="shiftedR" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="displaced"
            result="chanG"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            in="displaced"
            result="chanB"
          />
          <feOffset in="chanB" dx={-4} dy={0} result="shiftedB" />
          <feBlend in="shiftedR" in2="chanG" mode="screen" result="rg" />
          <feBlend in="rg" in2="shiftedB" mode="screen" />
        </filter>
      </svg>
      <motion.div className={s.logoBorder} style={{ y }} />
      <motion.div className={s.content} style={{ y }}>
        <div className={s.inner}>
          <div className={s.middle}>
            <ul>
              {items.links.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className={c(s.link, t.l)}>
                    {link.label}
                    {i < items.links.length - 1 ? "," : ""}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={s.newsletter}>
              <p className={t.p}>{items.contact.text}</p>
              <a href={items.contact.link.href} className={c(s.link, t.cta)}>
                {items.contact.link.label}
              </a>
            </div>
          </div>
          <div className={s.bottom}>
            <p className={c(s.copyright, t.cta)}>{items.copyright}</p>
            <CapeTownTime className={c(s.time, t.cta)} />
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
