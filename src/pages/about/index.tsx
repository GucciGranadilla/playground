"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import s from "./about.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";
import c from "@/utils/classNames";

const SERVICES = [
  "Brand Identity",
  "Visual Identity Systems",
  "Art Direction",
  "Logo Design",
  "Brand Strategy",
  "Typography",
  "Web Design",
  "Development",
];

const AWARDS = [
  { year: "2026", platform: "Awwwards", title: "Site of the Day" },
  { year: "2026", platform: "Awwwards", title: "Honourable Mention [ 2 ]" },
  { year: "2026", platform: "Awwwards", title: "Hounorary Award" },
];

const PROCESS = [
  {
    title: "Discovery",
    desc: "Deep-dive into your brand, market, and audience. Understanding the problem before proposing any solutions.",
  },
  {
    title: "Strategy",
    desc: "Defining positioning, messaging, and creative direction. A clear brief that guides every decision that follows.",
  },
  {
    title: "Design",
    desc: "Iterative design development — from initial concepts through to refined, production-ready assets.",
  },
  {
    title: "Delivery",
    desc: "Comprehensive brand guidelines, final files, and handover. Every detail documented and accounted for.",
  },
];

const CLIENTS = [
  "Tesla",
  "Chanel",
  "Apple",
  "BMW",
  "Saint Laurent",
  "Nike",
  "Hermès",
  "Adidas",
  "Prada",
  "Google",
  "Polestar",
  "Balenciaga",
  "Audi",
  "Valentino",
  "Samsung",
  "Bottega Veneta",
  "Sony",
  "Aesop",
  "Dior",
];

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });

  useEffect(() => {
    if (isInView) ref.current?.classList.add(a.inView);
  }, [isInView]);

  return (
    <section ref={ref} className={s.block}>
      <div className={s.blockInner}>
        <div className={s.blockLabel}>
          <span className={s.lineWrap}>
            <span className={c(t.tag, a.moveUpScroll)}>{label}</span>
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function About() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const awardsRef = useRef<HTMLDivElement>(null);
  const isServicesInView = useInView(servicesRef, {
    once: true,
    margin: "0px 0px -8% 0px",
  });
  const isAwardsInView = useInView(awardsRef, {
    once: true,
    margin: "0px 0px -8% 0px",
  });

  useEffect(() => {
    if (isServicesInView) servicesRef.current?.classList.add(a.inView);
  }, [isServicesInView]);

  useEffect(() => {
    if (isAwardsInView) awardsRef.current?.classList.add(a.inView);
  }, [isAwardsInView]);

  return (
    <>
      <Head>
        <title>About — Kevin Davis Studio</title>
      </Head>
      <main data-nav-bg>
        {/* ── Intro ────────────────────────────────────────────────── */}
        <section className={s.intro}>
          <div className={s.left}>
            <h1 className={c(s.statement, t.l)}>
              {[
                "Great identity design is never",
                "decoration — it is the distillation",
                "of strategy into form.",
              ].map((line, i) => (
                <span key={i} className={s.lineWrap}>
                  <span
                    className={a.moveUp}
                    style={
                      { "--delay": `${0.1 + i * 0.07}s` } as React.CSSProperties
                    }
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p
              className={c(s.bio, t.p, a.moveUp)}
              style={{ "--delay": "0.42s" } as React.CSSProperties}
            >
              Kevin Davis is an independent brand identity and web designer
              based in Cape Town, South Africa. Working at the intersection of
              visual identity and digital experience — every engagement receives
              complete personal attention. No junior hand-offs, no diluted
              thinking.
            </p>
          </div>

          <div ref={servicesRef} className={s.servicesCol}>
            <div className={s.colHead}>
              <span className={s.lineWrap}>
                <span className={c(s.colLabel, t.tag, a.moveUpScroll)}>
                  Services
                </span>
              </span>
            </div>
            <ul className={s.servicesList}>
              {SERVICES.map((svc, i) => (
                <li key={svc} className={s.serviceRow}>
                  <span className={s.lineWrap}>
                    <span
                      className={c(s.serviceName, t.p, a.moveUpScroll)}
                      style={
                        { "--delay": `${i * 0.04}s` } as React.CSSProperties
                      }
                    >
                      {svc}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div ref={awardsRef} className={s.recognitionCol}>
            <div className={s.colHead}>
              <span className={s.lineWrap}>
                <span className={c(s.colLabel, t.tag, a.moveUpScroll)}>
                  Recognition
                </span>
              </span>
            </div>
            <ul className={s.awardsList}>
              {AWARDS.map((award, i) => (
                <li key={i} className={s.awardRow}>
                  <span className={s.lineWrap}>
                    <span
                      className={c(s.awardMeta, t.p, a.moveUpScroll)}
                      style={
                        {
                          "--delay": `${i * 0.06 + 0.04}s`,
                        } as React.CSSProperties
                      }
                    >
                      {award.platform} — {award.title}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className={s.pageLayout}>
          <div className={s.pageLeft}>

            {/* ── Process ────────────────────────────────────────────── */}
            <Block label="Process">
              <ul className={s.blockList}>
                {PROCESS.map((step, i) => (
                  <li key={i} className={s.serviceRow}>
                    <span className={s.lineWrap}>
                      <span
                        className={c(s.serviceName, t.p, a.moveUpScroll)}
                        style={{ "--delay": `${i * 0.04}s` } as React.CSSProperties}
                      >
                        {step.title}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* ── Clients ────────────────────────────────────────────── */}
            <Block label="Clients">
              <ul className={s.blockList}>
                {CLIENTS.map((name, i) => (
                  <li key={name} className={s.serviceRow}>
                    <span className={s.lineWrap}>
                      <span
                        className={c(s.serviceName, t.p, a.moveUpScroll)}
                        style={{ "--delay": `${i * 0.03}s` } as React.CSSProperties}
                      >
                        {name}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

          </div>

          <div className={s.hoverImg} aria-hidden>
            <Image
              src="/images/kevin.jpg"
              alt=""
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
              sizes="(max-width: 1440px) 25vw, 350px"
            />
          </div>
        </div>
      </main>
    </>
  );
}
