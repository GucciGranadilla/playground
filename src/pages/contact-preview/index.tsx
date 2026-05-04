"use client";

import Head from "next/head";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CapeTownTime from "@/components/capeTownTime";
import s from "./contactPreview.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";
import { WORK_ITEMS } from "@/data/workItems";
import { imagePlaceholders } from "@/utils/imagePlaceholders";

const BASE = WORK_ITEMS.map((item) => item.cardImage);
const COL_A_BASE = BASE.filter((_, i) => i % 2 === 0);
const COL_B_BASE = BASE.filter((_, i) => i % 2 !== 0);
const COL_A = [...COL_A_BASE, ...COL_A_BASE];
const COL_B = [...COL_B_BASE, ...COL_B_BASE];

export default function ContactPreview() {
  const colARef = useRef<HTMLDivElement>(null);
  const colBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      `hsl(${randomHue}, 70%, 55%)`,
    );
  }, []);

  useEffect(() => {
    const colA = colARef.current;
    const colB = colBRef.current;
    if (!colA || !colB) return;

    let halfA = 0;
    let halfB = 0;
    let stagger = 0;
    let rawOff = 0;
    let lerpOff = 0;
    let rafId: number;

    const measure = () => {
      halfA = colA.scrollHeight / 2;
      halfB = colB.scrollHeight / 2;
      stagger = halfB * 0.4;
    };

    measure();
    lerpOff = stagger;

    const BASE_SPEED = 0.6;
    const DECAY = 0.92;
    const LERP = 0.07;
    let velocity = 0;

    const onWheel = (e: WheelEvent) => {
      velocity += e.deltaY * 0.03;
    };

    const loop = () => {
      velocity *= DECAY;
      const speed = BASE_SPEED + velocity;
      rawOff += speed;
      lerpOff += (rawOff + stagger - lerpOff) * LERP;
      const offA = ((rawOff % halfA) + halfA) % halfA;
      const offB = ((lerpOff % halfB) + halfB) % halfB;
      colA.style.transform = `translateY(-${offA}px)`;
      colB.style.transform = `translateY(-${offB}px)`;
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    rafId = requestAnimationFrame(loop);

    const ro = new ResizeObserver(measure);
    ro.observe(colA);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Contact — Kevin Davis Studio</title>
      </Head>
      <main>
        <section className={s.root} data-nav-bg>
          {/* ── Image marquee ── */}
          <div className={s.imageArea}>
            <div className={s.colA} ref={colARef}>
              {COL_A.map((img, i) => (
                <div key={i} className={s.imgWrap}>
                  <Image
                    src={img.src}
                    fill
                    alt=""
                    sizes="15vw"
                    placeholder={imagePlaceholders[img.src] ? "blur" : "empty"}
                    blurDataURL={imagePlaceholders[img.src]}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
            <div className={s.colB} ref={colBRef}>
              {COL_B.map((img, i) => (
                <div key={i} className={s.imgWrap}>
                  <Image
                    src={img.src}
                    fill
                    alt=""
                    sizes="15vw"
                    placeholder={imagePlaceholders[img.src] ? "blur" : "empty"}
                    blurDataURL={imagePlaceholders[img.src]}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className={s.info}>
            {/* <span className={c(s.infoHeader, t.tag)}>Contact</span> */}
            <p className={c(s.infoIntro, t.p)}>
              Open to new commissions for brand identity, web design, and
              development. Every engagement receives full attention.
            </p>

            <div className={s.infoRows}>
              <div className={s.row}>
                <span className={c(s.rowLabel, t.tag)}>Based</span>
                <span className={t.tag}>Cape Town, SA</span>
              </div>
              <div className={s.row}>
                <span className={c(s.rowLabel, t.tag)}>Local time</span>
                <CapeTownTime className={t.tag} showStatus />
              </div>
              <div className={s.row}>
                <span className={c(s.rowLabel, t.tag)}>Services</span>
                <div className={s.rowValueList}>
                  <span className={t.tag}>Brand Identity</span>
                  <span className={t.tag}>Art Direction</span>
                  <span className={t.tag}>Web Design</span>
                  <span className={t.tag}>Development</span>
                </div>
              </div>
              <div className={s.row}>
                <span className={c(s.rowLabel, t.tag)}>New work</span>
                <span className={t.tag}>Open for commissions</span>
              </div>
              <div className={s.row}>
                <span className={c(s.rowLabel, t.tag)}>Email</span>
                <Link href="mailto:kevidavis911@gmail.com" className={c(s.email, t.tag)}>
                  kevidavis911@gmail.com
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
