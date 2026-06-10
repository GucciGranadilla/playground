"use client";

import Head from "next/head";
import { useRef, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

import Footer from "@/sections/footer";
import CapeTownTime from "@/components/capeTownTime";
import s from "./contactPreview.module.scss";
import t from "@/styles/text.module.scss";
import c from "@/utils/classNames";
import { randomHue } from "@/utils/randomHue";
import { WORK_ITEMS } from "@/data/workItems";
import { imagePlaceholders } from "@/utils/imagePlaceholders";

const BASE = WORK_ITEMS.map((item) => item.cardImage);
const COL_A = BASE.filter((_, i) => i % 2 === 0);
const COL_B = BASE.filter((_, i) => i % 2 !== 0);

export default function ContactPreview() {
  const colARef = useRef<HTMLDivElement>(null);
  const colBRef = useRef<HTMLDivElement>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const infoWrapperRef = useRef<HTMLDivElement>(null);
  const infoContentRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef(0);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      `hsl(${randomHue}, 70%, 55%)`,
    );
  }, []);

  const measureRange = () => {
    const wrapper = infoWrapperRef.current;
    const content = infoContentRef.current;
    if (!wrapper || !content) return;
    const paddingBottom =
      parseFloat(getComputedStyle(wrapper).paddingBottom) || 0;
    const contentTopInWrapper =
      content.getBoundingClientRect().top - wrapper.getBoundingClientRect().top;
    rangeRef.current =
      wrapper.offsetHeight -
      contentTopInWrapper -
      content.offsetHeight -
      paddingBottom;
  };

  useLayoutEffect(() => {
    measureRange();
    const ro = new ResizeObserver(measureRange);
    ro.observe(infoWrapperRef.current!);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end 0.35"],
  });

  const y = useTransform(scrollYProgress, (p) => p * rangeRef.current);

  useEffect(() => {
    const colA = colARef.current;
    const colB = colBRef.current;
    if (!colA || !colB) return;

    type ColState = {
      cards: HTMLElement[];
      bases: number[];
      heights: number[];
      totalH: number;
    };

    const cols: ColState[] = [
      { cards: [], bases: [], heights: [], totalH: 1 },
      { cards: [], bases: [], heights: [], totalH: 1 },
    ];
    const colEls = [colA, colB];

    cols.forEach((col, i) => {
      col.cards = Array.from(
        colEls[i].querySelectorAll<HTMLElement>(`.${s.imgWrap}`),
      );
    });

    const measure = () => {
      const remPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const gap = remPx * 4;
      cols.forEach((col) => {
        let acc = 0;
        col.bases = [];
        col.heights = [];
        col.cards.forEach((card) => {
          const h = card.offsetHeight;
          col.bases.push(acc);
          col.heights.push(h);
          acc += h + gap;
        });
        col.totalH = acc;
      });
    };

    const wrap = (val: number, w: number) => (w > 0 ? ((val % w) + w) % w : 0);

    const applyShift = (col: ColState, shift: number) => {
      for (let i = 0; i < col.cards.length; i++) {
        const h = col.heights[i] ?? 0;
        // Wrap window offset by card height so a card only teleports once it
        // has fully exited the top, then reappears past the bottom edge.
        const y = wrap(col.bases[i] - shift + h, col.totalH) - h;
        col.cards[i].style.transform = `translate3d(0,${y}px,0)`;
      }
    };

    measure();
    applyShift(cols[0], 0);
    applyShift(cols[1], 0);

    let baseOff = 0;
    let extraA = 0;
    let extraB = 0;
    let velocity = 0;
    let rafId: number;

    const BASE_SPEED = 0.6;
    const DECAY = 0.92;
    const LERP = 0.07;

    const onWheel = (e: WheelEvent) => {
      velocity += e.deltaY * 0.03;
    };

    const loop = () => {
      velocity *= DECAY;
      baseOff += BASE_SPEED;
      extraA += velocity;
      extraB += (extraA - extraB) * LERP;
      applyShift(cols[0], baseOff + extraA);
      applyShift(cols[1], baseOff + extraB);
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    rafId = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => measure());
    ro.observe(colA);
    ro.observe(colB);

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
        <section ref={sectionRef} className={s.root} data-nav-bg>
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
          <div ref={infoWrapperRef} className={s.infoWrapper}>
            <motion.div ref={infoContentRef} className={s.info} style={{ y }}>
              {/* <span className={c(s.infoHeader, t.tag)}>Contact</span> */}
              <h2 className={c(s.infoTitle, t.xl)}>Let's work together</h2>
              <p className={c(s.infoIntro, t.p)}>
                Open to new commissions for brand identity, web design, and
                development. Every engagement receives full attention.
              </p>

              <div className={s.infoRows}>
                {/* <span className={c(s.rowsHeader, t.tag)}>Contact Details</span> */}
                <div className={s.row}>
                  <span className={c(s.rowLabel, t.cta)}>Email</span>
                  <Link
                    href="mailto:kevidavis911@gmail.com"
                    className={c(s.email, t.cta)}
                  >
                    kevidavis911@gmail.com
                  </Link>
                </div>
                <div className={s.row}>
                  <span className={c(s.rowLabel, t.cta)}>Services</span>
                  <div className={s.rowValueList}>
                    <span className={t.cta}>Brand Identity</span>
                    <span className={t.cta}>Art Direction</span>
                    <span className={t.cta}>Web Design</span>
                    <span className={t.cta}>Development</span>
                  </div>
                </div>
                <div className={s.row}>
                  <span className={c(s.rowLabel, t.cta)}>New work</span>
                  <span className={t.cta}>Open for commissions</span>
                </div>
                <div className={s.row}>
                  <span className={c(s.rowLabel, t.cta)}>Based</span>
                  <span className={t.cta}>Cape Town, SA</span>
                </div>
                <div className={s.row}>
                  <span className={c(s.rowLabel, t.cta)}>Local time</span>
                  <CapeTownTime className={t.cta} showStatus />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer page={"work"} />
      </main>
    </>
  );
}
