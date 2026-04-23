import { useEffect, useRef, useMemo } from "react";
import { randomHue, hslToHex } from "@/utils/randomHue";

// Module-level: persist animation state across route-change remounts
let _time = 0;
let _phase = 0;

const LiquidGradientBackground = ({
  colors = {
    color1: "#003CFF",
    color2: "#004DFF",
    color3: "#000000",
  },
  speed = 1.0,
  zoom = 0.15,
  mouseInfluence = 0.15,
  loopDuration = 120, // seconds per full back-and-forth cycle
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const timeRef = useRef(_time);
  const phaseRef = useRef(_phase);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Water audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterFreqRef = useRef<BiquadFilterNode | null>(null);
  const velocityRef = useRef(0);
  const smoothGainRef = useRef(0);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Memoize color conversions
  const rgbColors = useMemo(() => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
          ]
        : [0, 0, 0];
    };

    return {
      rgb1: hexToRgb(colors.color1),
      rgb2: hexToRgb(colors.color2),
      rgb3: hexToRgb(colors.color3),
    };
  }, [colors.color1, colors.color2, colors.color3]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let width: number, height: number;

    const resizeCanvas = () => {
      // Aggressive resolution scaling for performance
      const dpr = Math.min(window.devicePixelRatio, 1.5) * 0.9;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float; // Reduced from highp
      varying vec2 vUv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_scroll;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_zoom;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      float fbm(vec3 p) {
        float value = 0.1;
        float amplitude = 0.65;
        float frequency = 1.0;

        // Reduced from 3 to 2 octaves for better performance
        for(int i = 0; i < 2; i++) {
          value += amplitude * snoise(p * frequency);
          frequency *= 1.0;
          amplitude *= 0.5;
        }
        return value;
      }

      vec2 domainWarp(vec2 p, float t) {
        vec2 q = vec2(
          fbm(vec3(p * 2.8, t * 0.6)),
          fbm(vec3(p * 2.8 + vec2(5.2, 1.3), t * 0.6))
        );

        vec2 r = vec2(
          fbm(vec3(p + 6.5 * q + vec2(1.7, 9.2), t * 0.5)),
          fbm(vec3(p + 6.5 * q + vec2(8.3, 2.8), t * 0.5))
        );

        return p + r * 0.85;
      }

      void main() {
        vec2 uv = vUv;
        vec2 resolution = u_resolution / max(u_resolution.x, u_resolution.y);
        vec2 p = (uv - 0.5) * resolution * u_zoom;

        // Add mouse influence
        vec2 mouseInfluence = u_mouse - uv;
        float mouseDist = length(mouseInfluence);
        float mouseEffect = smoothstep(0.35, 0.0, mouseDist) * 0.15;
        p += mouseInfluence * mouseEffect;

        vec2 warped = domainWarp(p, u_time * 0.15 + u_scroll * 0.03);

        float n1 = fbm(vec3(warped * 2.2, u_time * 0.15));
        float n2 = fbm(vec3(warped * 2.8 + vec2(3.0, 1.0), u_time * 0.2));
        float n3 = fbm(vec3(warped * 1.4, u_time * 0.1));

        float noise = (n1 + n2 * 0.5 + n3 * 0.3) / 1.8;
        noise = noise * 0.5 + 0.5;

        float contrast = 1.8;
        float adjustedNoise = pow(noise, contrast);

        vec3 finalColor = mix(u_color3, u_color1, smoothstep(0.2, 0.75, adjustedNoise));
        finalColor = mix(finalColor, u_color2, smoothstep(0.45, 0.95, n2 * 0.5 + 0.5));

        float gradient = length(vec2(
          fbm(vec3(warped * 2.2 + vec2(0.01, 0.0), u_time * 0.15)) - n1,
          fbm(vec3(warped * 2.2 + vec2(0.0, 0.01), u_time * 0.15)) - n1
        ));
        finalColor += vec3(0.15, 0.2, 0.4) * smoothstep(0.15, 0.6, gradient);

        float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5));
        vignette = mix(0.85, 1.0, vignette);
        finalColor *= vignette;

        finalColor += smoothstep(0.5, 1.0, adjustedNoise) * 0.12;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = gl.createProgram();
    if (!program || !vertexShader || !fragmentShader) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }

    const positionLocation = gl.getAttribLocation(program, "position");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const scrollLocation = gl.getUniformLocation(program, "u_scroll");
    const color1Location = gl.getUniformLocation(program, "u_color1");
    const color2Location = gl.getUniformLocation(program, "u_color2");
    const color3Location = gl.getUniformLocation(program, "u_color3");
    const zoomLocation = gl.getUniformLocation(program, "u_zoom");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
          ]
        : [0, 0, 0];
    };

    // Convert colors once outside render loop
    const rgb1 = hexToRgb(colors.color1);
    const rgb2 = hexToRgb(colors.color2);
    const rgb3 = hexToRgb(colors.color3);

    // Water audio — lazy init on first interaction
    const initAudio = () => {
      if (audioCtxRef.current) return;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      ctx.resume();

      // 2-second looping white noise buffer
      const bufLen = ctx.sampleRate * 2;
      const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const source = ctx.createBufferSource();
      source.buffer = noiseBuf;
      source.loop = true;

      // Filter chain: lowpass → bandpass body → bandpass texture
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2400;
      lp.Q.value = 0.5;

      const bp1 = ctx.createBiquadFilter();
      bp1.type = "bandpass";
      bp1.frequency.value = 480;
      bp1.Q.value = 1.4;

      const bp2 = ctx.createBiquadFilter();
      bp2.type = "bandpass";
      bp2.frequency.value = 1300;
      bp2.Q.value = 2.0;

      filterFreqRef.current = bp1;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gainNodeRef.current = gain;

      source.connect(lp);
      lp.connect(bp1);
      bp1.connect(bp2);
      bp2.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    };

    // Mouse and touch handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / width;
      mouseRef.current.targetY = 1.0 - e.clientY / height;

      initAudio();
      audioCtxRef.current?.resume();
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      velocityRef.current += Math.sqrt(dx * dx + dy * dy);
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX / width;
        mouseRef.current.targetY = 1.0 - e.touches[0].clientY / height;

        initAudio();
        audioCtxRef.current?.resume();
        const dx = e.touches[0].clientX - prevMousePosRef.current.x;
        const dy = e.touches[0].clientY - prevMousePosRef.current.y;
        velocityRef.current += Math.sqrt(dx * dx + dy * dy);
        prevMousePosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleScroll = () => {
      targetScrollRef.current = window.scrollY * 0.001;
    };

    // Throttle resize events
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Amplitude: how far into time-space one half-cycle reaches (covers the "good" 30s)
    const T_AMP = 30 * 60 * 0.016 * speed;
    const phaseIncrement = (Math.PI * 2) / (loopDuration * 60);

    let readyDispatched = false;
    const render = () => {
      if (!readyDispatched) {
        readyDispatched = true;
        window.dispatchEvent(new CustomEvent("canvas-ready"));
      }
      // Ping-pong: phase advances linearly, time follows a cosine so it
      // eases in/out at each end — the reversal is imperceptible at slow speed
      phaseRef.current = (phaseRef.current + phaseIncrement) % (Math.PI * 2);
      timeRef.current = T_AMP * 0.5 * (1 - Math.cos(phaseRef.current));

      // Smooth lerp for mouse and scroll — prevents shader jumping on scroll reset
      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.06;

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLocation, timeRef.current);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(scrollLocation, scrollRef.current);
      gl.uniform1f(zoomLocation, zoom);
      gl.uniform3f(color1Location, rgb1[0], rgb1[1], rgb1[2]);
      gl.uniform3f(color2Location, rgb2[0], rgb2[1], rgb2[2]);
      gl.uniform3f(color3Location, rgb3[0], rgb3[1], rgb3[2]);

      // Water audio: map accumulated velocity → gain, asymmetric lerp
      if (gainNodeRef.current) {
        const MAX_GAIN = 0.14;
        const targetGain = Math.min(velocityRef.current / 28, 1) * MAX_GAIN;
        velocityRef.current *= 0.72; // velocity decay per frame
        const rate = targetGain > smoothGainRef.current ? 0.18 : 0.04; // fast attack, slow release
        smoothGainRef.current += (targetGain - smoothGainRef.current) * rate;
        gainNodeRef.current.gain.value = smoothGainRef.current;
        // Subtle filter freq shift: faster movement = slightly brighter
        if (filterFreqRef.current) {
          filterFreqRef.current.frequency.value =
            480 + (smoothGainRef.current / MAX_GAIN) * 320;
        }
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    resizeCanvas();
    render();

    return () => {
      // Persist animation state so next mount continues seamlessly
      _time = timeRef.current;
      _phase = phaseRef.current;
      clearTimeout(resizeTimeout);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      gainNodeRef.current = null;
      filterFreqRef.current = null;
      // Clean up WebGL resources
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [colors, speed, zoom, mouseInfluence, loopDuration]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};

export default function App({ className = "" }) {
  const colors = useMemo(
    () => ({
      color1: hslToHex(randomHue, 70, 30),
      color2: hslToHex(randomHue, 70, 50),
      color3: "#000000",
    }),
    [],
  );

  return (
    <div className={`${className} relative min-h-screen`}>
      <LiquidGradientBackground
        colors={colors}
        speed={0.04}
        zoom={0.1}
        mouseInfluence={0.15}
        loopDuration={120}
      />
    </div>
  );
}
