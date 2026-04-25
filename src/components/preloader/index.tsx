import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { randomHue } from "@/utils/randomHue";
import c from "@/utils/classNames";
import s from "./preloader.module.scss";
import g from "@/styles/global.module.scss";
import t from "@/styles/text.module.scss";
import a from "@/styles/ani.module.scss";

const IMAGES = [
  { src: "/images/preloader/gsp.jpg" },
  { src: "/images/preloader/higherlife.jpg" },
  { src: "/images/preloader/paragon.jpg" },
  { src: "/images/preloader/gsp.jpg" },
];

// Real readyState milestones — same signals the original DocumentMonitor tracked
const MILESTONES: Partial<Record<DocumentReadyState, number>> = {
  loading: 0.15,
  interactive: 0.6,
  complete: 0.9, // holds until canvas signals ready
};

function usePageProgress(onComplete: () => void) {
  const progress = useMotionValue(0);
  const canvasReady = useRef(false);
  const hasCompleted = useRef(false);

  // Latest-ref pattern keeps onComplete stable without requiring useCallback at call site
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Spring smooths both the counter display and the GSAP name-spread animation.
  // Raw progress jumps instantly on fast connections; spring ensures visible counting.
  const displayProgress = useSpring(progress, {
    stiffness: 200,
    damping: 35,
    restDelta: 0.001,
  });

  useEffect(() => {
    const applyMilestone = () => {
      const ceil = MILESTONES[document.readyState];
      if (ceil !== undefined && ceil > progress.get()) progress.set(ceil);
    };

    applyMilestone();
    document.addEventListener("readystatechange", applyMilestone);

    // Organic fill: eases toward current ceiling each tick
    const fill = setInterval(() => {
      const current = progress.get();
      const ceil = canvasReady.current
        ? 1
        : (MILESTONES[document.readyState] ?? 0.15);
      if (current < ceil) {
        progress.set(Math.min(current + (ceil - current) * 0.08 + 0.004, ceil));
      }
    }, 80);

    // Minimum display time so the image sequence has meaningful visual time
    const startTime = Date.now();
    const MIN_DISPLAY_MS = 2200;
    let minDisplayTimer: ReturnType<typeof setTimeout> | null = null;
    let completed = false;

    const tryComplete = () => {
      if (completed) return;
      completed = true;
      const elapsed = Date.now() - startTime;
      const remaining = MIN_DISPLAY_MS - elapsed;
      if (remaining <= 0) {
        progress.set(1);
      } else {
        minDisplayTimer = setTimeout(() => progress.set(1), remaining);
      }
    };

    const onCanvasReady = () => {
      canvasReady.current = true;
      tryComplete();
    };
    window.addEventListener("canvas-ready", onCanvasReady);

    // Fallback for non-canvas pages — unconditional so slow/offline networks always complete
    const fallback = setTimeout(() => {
      canvasReady.current = true;
      tryComplete();
    }, 5000);

    return () => {
      document.removeEventListener("readystatechange", applyMilestone);
      clearInterval(fill);
      window.removeEventListener("canvas-ready", onCanvasReady);
      clearTimeout(fallback);
      if (minDisplayTimer !== null) clearTimeout(minDisplayTimer);
    };
  }, []);

  // Completion fires when spring settles at 1 — correct moment to start exit animation
  useMotionValueEvent(displayProgress, "change", (value) => {
    if (value >= 1 && !hasCompleted.current) {
      hasCompleted.current = true;
      onCompleteRef.current();
    }
  });

  return { displayProgress };
}

export default function Preloader({ disabled }: { disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [load, setLoad] = useState(false);
  const [done, setDone] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const enterTextRef = useRef<HTMLDivElement>(null);

  const kevinQuickTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const davisQuickTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const percentageRef = useRef<HTMLDivElement>(null);
  const maxDistanceRef = useRef(
    typeof window !== "undefined" ? window.innerWidth * 0.25 : 0,
  );

  const { displayProgress } = usePageProgress(
    useCallback(() => setLoad(true), []),
  );

  useLayoutEffect(() => {
    if (disabled) {
      document.documentElement.classList.add(a.disabled);
      setLoad(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const kevinEl = el.querySelector("#pre-kevin");
    const davisEl = el.querySelector("#pre-davis");
    if (kevinEl && davisEl) {
      gsap.set([kevinEl, davisEl], { x: 0 });
      kevinQuickTo.current = gsap.quickTo(kevinEl, "x", {
        duration: 0.8,
        ease: "o3",
      });
      davisQuickTo.current = gsap.quickTo(davisEl, "x", {
        duration: 0.8,
        ease: "o3",
      });
    }
  }, [disabled]);

  // Counter + name spread: both read from the spring so they animate smoothly
  // even when raw `progress` jumps to 1 instantly on fast connections
  useMotionValueEvent(displayProgress, "change", (value) => {
    if (percentageRef.current) {
      percentageRef.current.textContent = `${Math.round(value * 100)
        .toString()
        .padStart(2, "0")} %`;
    }
    if (kevinQuickTo.current && davisQuickTo.current) {
      kevinQuickTo.current(-value * maxDistanceRef.current);
      davisQuickTo.current(value * maxDistanceRef.current);
    }
  });

  useEffect(() => {
    const update = () => {
      maxDistanceRef.current = window.innerWidth * 0.25;
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (done || disabled) lenis.start();
    else lenis.stop();
  }, [lenis, done, disabled]);

  useEffect(() => {
    // `load` is the only meaningful dep — re-running on resize would revert a mid-sequence timeline
    if (!load || !ref.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({});
      tlRef.current = tl;
      const imgs = ref.current!.querySelectorAll(
        `.${s.image}:not(#pre-color-div)`,
      );
      const colorDiv =
        ref.current!.querySelector<HTMLElement>("#pre-color-div");
      if (colorDiv) {
        colorDiv.style.backgroundColor = `hsl(${randomHue}, 70%, 55%)`;
      }
      const progressTextDiv = ref.current!.querySelector(
        `.${s.progressText} div`,
      );
      const nameElements = "#pre-kevin, #pre-colon, #pre-davis";
      const bgPanel = ref.current!.querySelector(`.${s.bgPanel}`);

      gsap.set([...imgs], { clipPath: "inset(100% 100% 100% 100%)" });
      if (colorDiv)
        gsap.set(colorDiv, { clipPath: "inset(100% 100% 100% 100%)" });

      tl.to(
        colorDiv,
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "ioC2" },
        ">",
      )
        .to(
          colorDiv,
          {
            clipPath: "inset(100% 100% 100% 100%)",
            duration: 0.65,
            ease: "ioC2",
          },
          "0.25",
        )
        .to(
          imgs[0],
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "ioC2" },
          "<-0.25",
        )
        .to(
          imgs[0],
          {
            clipPath: "inset(100% 100% 100% 100%)",
            duration: 0.65,
            ease: "ioC2",
          },
          ">",
        )
        .to(
          imgs[1],
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "ioC2" },
          "<-0.15",
        )
        .to(
          imgs[1],
          {
            clipPath: "inset(100% 100% 100% 100%)",
            duration: 0.65,
            ease: "ioC2",
          },
          ">",
        )
        .to(
          imgs[2],
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "ioC2" },
          "<-0.15",
        )
        .to(
          imgs[2],
          {
            clipPath: "inset(100% 100% 100% 100%)",
            duration: 0.65,
            ease: "ioC2",
          },
          ">",
        )
        .to(
          imgs[3],
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "ioC2" },
          "<-0.15",
        )
        .call(
          () => {
            setShowEnter(true);
          },
          undefined,
          "<0.2",
        )
        .call(
          () => {
            tl.pause();
          },
          undefined,
          ">0.2",
        )
        .to(
          imgs[3],
          {
            clipPath: "inset(100% 100% 100% 100%)",
            duration: 0.85,
            ease: "ioC2",
          },
          ">",
        )
        .to(
          progressTextDiv,
          { y: "110%", opacity: 0, duration: 0.5, ease: "io4" },
          "<",
        )
        .to(
          nameElements,
          { y: "130%", opacity: 0, duration: 0.5, ease: "io4" },
          "<",
        )
        .set(imgs[3], { opacity: 0 }, ">")
        .to(bgPanel, { opacity: 0, duration: 1.4, ease: "ease" }, "-=0.8")
        .call(
          () => {
            setDone(true);
          },
          undefined,
          ">",
        );
    }, ref);
    return () => ctx.revert();
  }, [load]);

  useEffect(() => {
    if (showEnter && enterTextRef.current) {
      gsap.fromTo(
        enterTextRef.current,
        { y: "110%" },
        { y: "0%", duration: 0.5, ease: "power3.out" },
      );
    }
  }, [showEnter]);

  const handleEnter = () => {
    lenis?.start();
    const dubAudio = new Audio("/effects/dub.mp3");
    dubAudio.volume = 0.25;
    dubAudio.play().catch(() => {});
    document.documentElement.classList.add(a.ready);
    if (enterTextRef.current) {
      gsap.to(enterTextRef.current, {
        y: "-110%",
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          setShowEnter(false);
          tlRef.current?.resume();
        },
      });
    } else {
      setShowEnter(false);
      tlRef.current?.resume();
    }
  };

  return disabled || done ? null : (
    <div
      id="pre-wrapper"
      className={c(s.wrapper, showEnter && s.clickable)}
      ref={ref}
      onClick={showEnter ? handleEnter : undefined}
    >
      <div className={s.bg}>
        <div className={s.bgPanel}></div>
      </div>
      <div className={c(s.container, g.padding)}>
        <div className={c(s.loading, t.tag)}>
          <div className={s.progressContainer}>
            <div className={s.progressText}>
              <div className={t.tag} ref={percentageRef} id="pre-percentage">
                00 %
              </div>
            </div>
          </div>
          <div className={s.nameContainer}>
            <div
              className={c(s.nameText, t.tag)}
              id="pre-kevin"
              style={{ transform: "translateX(0)" }}
            >
              kevin
            </div>
            <div className={c(s.nameText, t.tag)} id="pre-colon">
              :
            </div>
            <div
              className={c(s.nameText, t.tag)}
              id="pre-davis"
              style={{ transform: "translateX(0)" }}
            >
              davis
            </div>
          </div>
          <div className={c(s.image, s.colorDiv)} id="pre-color-div"></div>
          {showEnter && (
            <div className={s.enterButton}>
              <div ref={enterTextRef} className={c(s.nameText, t.cta)}>
                click to enter
              </div>
            </div>
          )}
          {IMAGES.map((image, i) => (
            <img key={i} src={image.src} alt="" className={s.image} />
          ))}
        </div>
      </div>
    </div>
  );
}
