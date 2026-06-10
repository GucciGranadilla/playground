import { useRef } from "react";
import Link from "next/link";
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

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "start start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(10% 10% 0 10%)", "inset(0% 0% 0 0%)"],
  );

  const y = useTransform(scrollYProgress, [0.5, 1], ["50vh", "0vh"]);

  const items = {
    logo: "kevin:davis",
    image: { src: "/images/snow.png" },
    email: "kevidavis911@gmail.com",
    studio: { city: "Cape Town, ZA" },
    copyright: `© ${new Date().getFullYear()}`,
    menu: [
      { label: "Index", href: "/work" },
      // { label: "Exploration", href: "/explorations" },
      { label: "Studio", href: "/about" },
      { label: "Contact", href: "/contact-preview" },
    ],
  };

  return (
    <footer className={s.root} ref={rootRef}>
      <motion.div className={s.bg} style={{ clipPath }}>
        <ParallaxImage
          src={items.image.src}
          alt=""
          sizes="(min-width: 481px) 120vw, 384vw"
          className={s.image}
        />
      </motion.div>

      <motion.div className={s.card} style={{ y }}>
        <div className={s.glassFilter} />
        <div className={s.glassOverlay} />
        <div className={s.glassSpecular} />

        <div className={s.cardInner}>
          <Link href="/" className={c(s.logoMark, t.logo)}>
            {items.logo}
          </Link>

          <div className={s.menuBlock}>
            <ul className={s.menuList}>
              {items.menu.map(({ label, href }, i) => (
                <li key={i}>
                  <Link href={href} className={c(s.primaryLink, t.l)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={s.elsewhereBlock}>
            <ul className={s.elsewhereList}>
              {/* <li className={c(s.secondaryItem, t.cta)}>{items.studio.city}</li> */}
              <li>
                <CapeTownTime
                  className={c(s.secondaryItem, t.cta)}
                  showStatus
                />
              </li>
            </ul>
            <p className={c(s.copyright, t.cta)}>{items.copyright}</p>
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
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale={160}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
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
    </footer>
  );
}
