import "@/styles/_global.scss";
// import "@/styles/globals.scss";

import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import type { AppProps } from "next/app";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { CUSTOM_EASES } from "@/utils/eases";
import Layout from "@/components/layout";
import { createAudioChain } from "@/utils/createAudioChain";
import { SoundProvider, useSound } from "@/utils/soundContext";

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

const BREATHE_VOLUME = 0.3;
const BREATHE_FADE_MS = 1400;

function BreatheTrack() {
  const { muted } = useSound();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);

  useEffect(() => {
    const cancelFade = () => {
      if (fadeRafRef.current !== null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
    };

    const fade = (audio: HTMLAudioElement, to: number, onDone?: () => void) => {
      cancelFade();
      const from = audio.volume;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - start) / BREATHE_FADE_MS, 1);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * p));
        if (p < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          fadeRafRef.current = null;
          onDone?.();
        }
      };
      fadeRafRef.current = requestAnimationFrame(tick);
    };

    if (muted) {
      const audio = audioRef.current;
      if (!audio) return;
      fade(audio, 0, () => audio.pause());
      return cancelFade;
    }

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio("/effects/waterlife.mp3");
      audio.preload = "none";
      audioRef.current = audio;
    }
    audio.volume = 0;
    audio.play().catch(() => {});
    fade(audio, BREATHE_VOLUME);
    return cancelFade;
  }, [muted]);

  useEffect(() => {
    return () => {
      if (fadeRafRef.current !== null) cancelAnimationFrame(fadeRafRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return null;
}

function GlobalSoundEffects() {
  const { mutedRef } = useSound();

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
      fetch("/effects/click.wav")
        .then((r) => r.arrayBuffer())
        .then((b) => audioCtx.decodeAudioData(b)),
      fetch("/effects/hover.mp3")
        .then((r) => r.arrayBuffer())
        .then((b) => audioCtx.decodeAudioData(b)),
    ])
      .then(([cb, hb]) => {
        clickBuffer = cb;
        hoverBuffer = hb;
      })
      .catch(() => {});

    let lastClickPlayed = 0;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("a, button")) return;
      if (target.closest("[data-mute-sound]")) return;
      if (mutedRef.current) return;
      const now = Date.now();
      if (now - lastClickPlayed < 80) return;
      lastClickPlayed = now;
      if (clickBuffer) playBuffer(clickBuffer, 0.18);
    };

    let lastHoverPlayed = 0;
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("a, button")) return;
      if (target.closest("[data-mute-hover]")) return;
      if (target.closest("[data-mute-sound]")) return;
      if (mutedRef.current) return;
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
  }, [mutedRef]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SoundProvider>
      <GlobalSoundEffects />
      <BreatheTrack />
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
    </SoundProvider>
  );
}
