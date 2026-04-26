"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import gsap from "gsap";
import useMobile from "@/utils/useMobile";
import c from "@/utils/classNames";
import s from "./video.module.scss";

interface SliderState {
  isActive: boolean;
  isAnimating: boolean;
}

interface VideoProps {
  className?: string;
  innerClass?: string;
  style?: React.CSSProperties;
  mobileSrc?: string;
  desktopSrc?: string;
  fullMobileSrc?: string;
  fullDesktopSrc?: string;
  play?: boolean;
  mute?: boolean;
  loop?: boolean;
  lazy?: boolean;
  round?: boolean;
  parallax?: "hero" | "auto" | string;
  dataHover?: string;
  onClick?: () => void;
  sliderState?: SliderState | null;
  fadeInOnLoad?: boolean;
  onLoad?: () => void;
}

const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Video = forwardRef<HTMLDivElement, VideoProps>(
  (
    {
      className,
      innerClass,
      style,
      mobileSrc,
      desktopSrc,
      fullMobileSrc,
      fullDesktopSrc,
      play = true,
      mute = true,
      loop = true,
      lazy = false,
      round = false,
      parallax,
      dataHover,
      onClick,
      sliderState = null,
      fadeInOnLoad = false,
      onLoad,
    },
    ref,
  ) => {
    const mobile = useMobile();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [intersecting, setIntersecting] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [canPlay, setCanPlay] = useState(false);
    const [wasPlayingBeforeAnimation, setWasPlayingBeforeAnimation] =
      useState(false);

    const handleCanPlay = () => {
      setCanPlay(true);
      videoRef.current?.parentElement?.classList.add(s.canplay);

      if (fadeInOnLoad && videoRef.current) {
        gsap.fromTo(
          videoRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "o2" },
        );
      }

      onLoad?.();
    };

    const setVideoSource = () => {
      if (!videoRef.current || mobile === undefined) return;
      const src = mobile ? mobileSrc : desktopSrc;
      if (src) videoRef.current.setAttribute("src", src);
    };

    useEffect(() => {
      if (!videoRef.current || mobile === undefined) return;

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        setIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && lazy && !hydrated) {
          videoRef.current!.oncanplaythrough = handleCanPlay;
          setVideoSource();
          setHydrated(true);
        }
      };

      const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0,
        rootMargin: lazy && !hydrated ? "20%" : "0%",
      });

      observer.observe(videoRef.current);

      if (!lazy) {
        setVideoSource();
        videoRef.current.oncanplaythrough = handleCanPlay;
      }

      const el = videoRef.current;
      return () => {
        if (el) observer.unobserve(el);
      };
    }, [videoRef, mobile, hydrated, lazy, mobileSrc, desktopSrc]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !sliderState) return;

      const { isActive, isAnimating } = sliderState;
      const isPlaying =
        video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > video.HAVE_CURRENT_DATA;

      if (isAnimating && isPlaying) {
        setWasPlayingBeforeAnimation(true);
        video.pause();
        video.style.willChange = "transform";
      } else if (
        !isAnimating &&
        wasPlayingBeforeAnimation &&
        intersecting &&
        isActive
      ) {
        setWasPlayingBeforeAnimation(false);
        video.style.willChange = "auto";
        video.play().catch(console.error);
      } else if (!isAnimating) {
        video.style.willChange = "auto";
      }
    }, [sliderState, wasPlayingBeforeAnimation, intersecting]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || sliderState?.isAnimating) return;

      const isPlaying =
        video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > video.HAVE_CURRENT_DATA;

      const shouldPlay = sliderState
        ? intersecting && sliderState.isActive && !sliderState.isAnimating
        : intersecting;

      if (shouldPlay && !isPlaying) {
        video.play().catch(console.error);
      } else if (!shouldPlay && video.readyState >= 2) {
        video.pause();
      }
    }, [play, intersecting, sliderState]);

    useEffect(() => {
      if (!parallax || !containerRef.current || !videoRef.current || !canPlay)
        return;

      const ctx = gsap.context(() => {
        if (parallax === "hero") {
          gsap.fromTo(
            videoRef.current,
            { y: "0%" },
            {
              y: "30%",
              ease: "linear",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "0% 0%",
                end: "100% 0%",
                scrub: true,
              },
            },
          );
        } else if (parallax === "auto") {
          const updateHeight = () => {
            if (containerRef.current && videoRef.current) {
              gsap.set(containerRef.current, { height: "auto" });
              gsap.set(containerRef.current, {
                height: videoRef.current.offsetHeight,
              });
            }
          };
          updateHeight();
          const debouncedResize = debounce(updateHeight, 200);
          window.addEventListener("resize", debouncedResize);

          gsap.fromTo(
            videoRef.current,
            { y: "-5%" },
            {
              y: "5%",
              ease: "linear",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "0% 100%",
                end: "100% 0%",
                scrub: true,
              },
            },
          );

          return () => window.removeEventListener("resize", debouncedResize);
        } else {
          gsap.fromTo(
            videoRef.current,
            { y: "-30%" },
            {
              y: "30%",
              ease: "linear",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "0% 100%",
                end: "100% 0%",
                scrub: true,
              },
            },
          );
        }
      }, videoRef);

      return () => ctx.revert();
    }, [videoRef, containerRef, parallax, canPlay]);

    return (
      <div
        className={c(
          className,
          s.video,
          lazy ? s.lazy : undefined,
          round ? s.round : undefined,
          parallax ? s.parallax : undefined,
          fullMobileSrc && fullDesktopSrc ? s.clickable : undefined,
        )}
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        onClick={() => onClick?.()}
        data-hover={dataHover}
      >
        <video
          className={c(innerClass, canPlay ? s.visible : s.hidden)}
          style={fadeInOnLoad ? { ...style, opacity: 0 } : style}
          ref={videoRef}
          autoPlay
          loop={loop}
          muted={mute}
          playsInline
          preload="metadata"
        />
      </div>
    );
  },
);

Video.displayName = "Video";

export default Video;
