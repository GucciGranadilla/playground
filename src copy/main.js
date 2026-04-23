import Lenis from "lenis";
import gsap from "gsap";
import { DualWaveAnimation } from "./dual-wave/DualWaveAnimation.js";
import { preloadImages } from "./utils.js";

const lenis = new Lenis({ infinite: true });

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const wrapper = document.querySelector(".dual-wave-wrapper");
if (wrapper) {
  const animation = new DualWaveAnimation(wrapper, lenis);
  preloadImages(".dual-wave-wrapper").then(() => {
    document.body.classList.remove("loading");
    animation.init();
  });
}
