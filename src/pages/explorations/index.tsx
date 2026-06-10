"use client";

import { ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AnimatePresence, motion, usePresence } from "framer-motion";

import GridScroll from "@/sections/gridScroll";
import ListView from "@/sections/listView";

import s from "./explorations.module.scss";

// ioC2 — same curve PageTransition uses for the route swap.
const IOC2 = [0.5, 0, 0.15, 1] as const;
const VIEW_DURATION = 0.9;

function ViewLayer({ children }: { children: ReactNode }) {
  const [isPresent, safeToRemove] = usePresence();

  return (
    <motion.div
      className={s.viewLayer}
      initial={{ clipPath: "inset(0% 0% 0% 0%)", filter: "brightness(1)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)", filter: "brightness(1)" }}
      exit={{
        clipPath: "inset(0% 0% 100% 0%)",
        filter: "brightness(0.15)",
      }}
      transition={{ duration: VIEW_DURATION, ease: IOC2 }}
      onAnimationComplete={() => {
        if (!isPresent) safeToRemove?.();
      }}
      style={{
        position: isPresent ? "relative" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: isPresent ? 1 : 10,
      }}
    >
      <motion.div
        initial={{ y: "80vh" }}
        animate={{ y: 0 }}
        exit={{ y: "-40vh" }}
        transition={{ duration: VIEW_DURATION, ease: IOC2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Explorations() {
  const router = useRouter();
  const view = router.query.view === "list" ? "list" : "grid";

  return (
    <>
      <Head>
        <title>Explorations — Kevin Davis Studio</title>
      </Head>
      <main data-nav-bg>
        <div className={s.viewStage}>
          <AnimatePresence mode="popLayout" initial={false}>
            <ViewLayer key={view}>
              {view === "grid" ? <GridScroll /> : <ListView />}
            </ViewLayer>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
