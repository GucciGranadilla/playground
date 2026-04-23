import gsap from "gsap";

export class DualWaveAnimation {
  constructor(wrapper, lenis, options = {}) {
    this.wrapper =
      wrapper instanceof Element ? wrapper : document.querySelector(wrapper);
    this.lenis = lenis;

    const waveNumber = this.wrapper?.dataset.waveNumber
      ? parseFloat(this.wrapper.dataset.waveNumber)
      : 2;
    const waveSpeed = this.wrapper?.dataset.waveSpeed
      ? parseFloat(this.wrapper.dataset.waveSpeed)
      : 1;

    this.config = { waveNumber, waveSpeed, ...options };
    this.currentImage = null;
    this._oneSetHeight = null;
    this.halfLen = 0;
  }

  init() {
    if (!this.wrapper) {
      console.warn("Wrapper not found");
      return;
    }

    this.leftColumn = this.wrapper.querySelector(".wave-column-left");
    this.rightColumn = this.wrapper.querySelector(".wave-column-right");

    if (!this.leftColumn || !this.rightColumn) {
      console.warn("Columns not found");
      return;
    }

    this.setupAnimation();
  }

  setupAnimation() {
    this.leftTexts = gsap.utils.toArray(
      this.leftColumn.querySelectorAll(".animated-text")
    );
    this.rightTexts = gsap.utils.toArray(
      this.rightColumn.querySelectorAll(".animated-text")
    );
    this.thumbnail = this.wrapper.querySelector(".image-thumbnail");

    if (this.leftTexts.length === 0 || this.rightTexts.length === 0) return;

    // Half the item count — the second half are duplicates of the first
    this.halfLen = Math.floor(this.leftTexts.length / 2);

    this.leftQuickSetters = this.leftTexts.map((text) =>
      gsap.quickTo(text, "x", { duration: 0.6, ease: "power4.out" })
    );
    this.rightQuickSetters = this.rightTexts.map((text) =>
      gsap.quickTo(text, "x", { duration: 0.6, ease: "power4.out" })
    );

    this.calculateRanges();
    this.setInitialPositions(this.leftTexts, this.leftRange, 1);
    this.setInitialPositions(this.rightTexts, this.rightRange, -1);

    // Measure height of one item set (before any translation)
    this._oneSetHeight = this.calculateOneSetHeight();

    // Set scroll-track to exactly one item-set height so Lenis infinite
    // wraps at the same point the column and wave both naturally loop
    const scrollTrack = document.querySelector(".scroll-track");
    if (scrollTrack) {
      scrollTrack.style.height = `${this._oneSetHeight}px`;
      this.lenis.resize();
    }

    // Drive animation from Lenis scroll events
    this.scrollHandler = ({ scroll }) => this.handleScroll(scroll);
    this.lenis.on("scroll", this.scrollHandler);

    // Seed the initial state
    this.handleScroll(0);

    this.resizeHandler = () => {
      this.calculateRanges();
      this._oneSetHeight = this.calculateOneSetHeight();
    };
    window.addEventListener("resize", this.resizeHandler);
  }

  calculateOneSetHeight() {
    if (this.halfLen <= 0) return 1;
    const first = this.leftTexts[0];
    const firstClone = this.leftTexts[this.halfLen];
    return (
      firstClone.getBoundingClientRect().top -
      first.getBoundingClientRect().top
    );
  }

  calculateRanges() {
    const maxLeftTextWidth = Math.max(
      ...this.leftTexts.map((t) => t.offsetWidth)
    );
    const maxRightTextWidth = Math.max(
      ...this.rightTexts.map((t) => t.offsetWidth)
    );

    this.leftRange = {
      minX: 0,
      maxX: this.leftColumn.offsetWidth - maxLeftTextWidth,
    };
    this.rightRange = {
      minX: 0,
      maxX: this.rightColumn.offsetWidth - maxRightTextWidth,
    };
  }

  setInitialPositions(texts, range, multiplier) {
    const rangeSize = range.maxX - range.minX;
    texts.forEach((text, index) => {
      const waveIndex = index % this.halfLen;
      const initialPhase = this.config.waveNumber * waveIndex - Math.PI / 2;
      const initialProgress = (Math.sin(initialPhase) + 1) / 2;
      gsap.set(text, {
        x: (range.minX + initialProgress * rangeSize) * multiplier,
      });
    });
  }

  handleScroll(scrollY) {
    const oneSetHeight = this._oneSetHeight || 1;

    // Loop columns: translate by the remainder so items repeat seamlessly
    const offset = scrollY % oneSetHeight;
    gsap.set(this.leftColumn, { y: -offset });
    gsap.set(this.rightColumn, { y: -offset });

    // Progress grows unboundedly; wave is periodic so it cycles naturally
    const progress = scrollY / oneSetHeight;

    const closestIndex = this.findClosestToViewportCenter();

    this.updateColumn(
      this.leftTexts,
      this.leftQuickSetters,
      this.leftRange,
      progress,
      closestIndex,
      1
    );
    this.updateColumn(
      this.rightTexts,
      this.rightQuickSetters,
      this.rightRange,
      progress,
      closestIndex,
      -1
    );

    this.updateThumbnail(this.thumbnail, this.leftTexts[closestIndex]);
  }

  updateColumn(texts, setters, range, progress, focusedIndex, multiplier) {
    const rangeSize = range.maxX - range.minX;
    texts.forEach((text, index) => {
      const finalX =
        this.calculateWavePosition(index, progress, range.minX, rangeSize) *
        multiplier;
      setters[index](finalX);
      text.classList.toggle("focused", index === focusedIndex);
    });
  }

  updateThumbnail(thumbnail, focusedText) {
    if (!thumbnail || !focusedText) return;

    const newImage = focusedText.dataset.image;
    if (newImage && this.currentImage !== newImage) {
      this.currentImage = newImage;
      thumbnail.src = newImage;
    }

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const thumbnailHeight = thumbnail.offsetHeight;
    const wrapperHeight = this.wrapper.offsetHeight;

    const idealY = viewportCenter - wrapperRect.top - thumbnailHeight / 2;
    const minY = -thumbnailHeight / 2;
    const maxY = wrapperHeight - thumbnailHeight / 2;
    gsap.set(thumbnail, { y: Math.max(minY, Math.min(maxY, idealY)) });
  }

  calculateWavePosition(index, globalProgress, minX, range) {
    // Use modulo index so cloned items share wave positions with their originals
    const waveIndex = index % this.halfLen;
    const phase =
      this.config.waveNumber * waveIndex +
      this.config.waveSpeed * globalProgress * Math.PI * 2 -
      Math.PI / 2;
    return minX + ((Math.sin(phase) + 1) / 2) * range;
  }

  findClosestToViewportCenter() {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    this.leftTexts.forEach((text, index) => {
      const rect = text.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  destroy() {
    if (this.scrollHandler) {
      this.lenis.off("scroll", this.scrollHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
  }
}
