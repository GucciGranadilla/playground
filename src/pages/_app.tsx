import "@/styles/globals.scss";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { CUSTOM_EASES } from "@/utils/eases";
import Layout from "@/components/layout";
import { createAudioChain } from "@/utils/createAudioChain";

import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, CustomEase);

ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

Object.entries(CUSTOM_EASES).forEach(([name, curve]) => {
  CustomEase.create(name, `M0,0 C${curve} 1,1`);
});
import PageTransition from "@/components/pageTransition";
import LenisProvider from "@/components/lenisProvider";
import Navbar from "@/components/navbar";
import Preloader from "@/components/preloader";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const audioCtx = new AudioContext();

    const playBuffer = (buffer: AudioBuffer, gainValue: number) => {
      audioCtx.resume().then(() => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(createAudioChain(audioCtx, gainValue));
        source.start();
      });
    };

    let clickBuffer: AudioBuffer | null = null;
    let hoverBuffer: AudioBuffer | null = null;

    Promise.all([
      fetch("/effects/click.wav").then(r => r.arrayBuffer()).then(b => audioCtx.decodeAudioData(b)),
      fetch("/effects/hover.mp3").then(r => r.arrayBuffer()).then(b => audioCtx.decodeAudioData(b)),
    ]).then(([cb, hb]) => {
      clickBuffer = cb;
      hoverBuffer = hb;
    }).catch(() => {});

    let lastClickPlayed = 0;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("a, button")) return;
      const now = Date.now();
      if (now - lastClickPlayed < 80) return;
      lastClickPlayed = now;
      if (clickBuffer) playBuffer(clickBuffer, 0.18);
    };

    let lastHoverPlayed = 0;
    const handleMouseEnter = (e: MouseEvent) => {
      if (!(e.target as Element).closest("a, button")) return;
      const now = Date.now();
      if (now - lastHoverPlayed < 100) return;
      lastHoverPlayed = now;
      if (hoverBuffer) playBuffer(hoverBuffer, 0.3);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("mouseover", handleMouseEnter);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseover", handleMouseEnter);
      audioCtx.close();
    };
  }, []);

  return (
    <LenisProvider>
      <Preloader />
      <Navbar page={pageProps?.page} settings={pageProps?.settings} />
      <PageTransition>
        <Layout
          page={pageProps?.page}
          settings={pageProps?.settings}
          popup={pageProps?.popup}
        >
          <Component {...pageProps} />
        </Layout>
      </PageTransition>
    </LenisProvider>
  );
}
