"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroCharacterCompanionProps {
  onSelectPrompt?: (prompt: string) => void;
}

const ARCHITECT_TIPS = [
  "Ketik ide aplikasimu di samping, biar aku racik PRD 4-lapis & skema database-nya.",
  "Bisa bikin spesifikasi SaaS, marketplace, POS kasir, sampai aplikasi mobile.",
  "Hasil PRD & skema SQL-nya langsung siap dieksekusi di Cursor atau Claude Code.",
];

// Loop timings to eliminate the dead freeze at the end and beginning of the video
const LOOP_START = 0.35; // Skip initial idle delay
const LOOP_END = 9.25;   // Skip trailing idle delay right after turn finishes
const CROSSFADE_TIME = 0.35; // 350ms seamless GPU crossfade

export function HeroCharacterCompanion({ onSelectPrompt }: HeroCharacterCompanionProps) {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ARCHITECT_TIPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Dual-Buffered Seamless Loop & WebGL Chroma Key Renderer
  useEffect(() => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    const canvas = canvasRef.current;
    if (!videoA || !videoB || !canvas) return;

    let animationFrameId: number;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let textureA: WebGLTexture | null = null;
    let textureB: WebGLTexture | null = null;

    // Autoplay initialization for dual videos
    const initVideo = (v: HTMLVideoElement) => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.currentTime = LOOP_START;
    };
    initVideo(videoA);
    initVideo(videoB);

    const startPlayback = () => {
      videoA.muted = true;
      videoA.play().catch(() => {
        const onFirstTouch = () => {
          videoA.muted = true;
          videoA.play().catch(() => {});
          window.removeEventListener("click", onFirstTouch);
          window.removeEventListener("touchstart", onFirstTouch);
          window.removeEventListener("scroll", onFirstTouch);
        };
        window.addEventListener("click", onFirstTouch, { once: true });
        window.addEventListener("touchstart", onFirstTouch, { once: true });
        window.addEventListener("scroll", onFirstTouch, { once: true });
      });
    };
    startPlayback();

    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      // 2D Canvas Fallback
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      let currentLead = "A";
      const render2DFallback = () => {
        const activeV = currentLead === "A" ? videoA : videoB;
        if (activeV.readyState >= 2) {
          if (!isVideoReady) setIsVideoReady(true);
          const w = canvas.width;
          const h = canvas.height;
          ctx.drawImage(activeV, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const maxRB = Math.max(r, b);
            const diff = (g - maxRB) / 255.0;

            if (diff > 0.06) {
              const alphaRatio = Math.max(0, Math.min(1, (diff - 0.06) / 0.10));
              data[i + 3] = Math.round(data[i + 3] * (1 - alphaRatio));
              data[i + 1] = Math.min(g, maxRB);
            }
          }
          ctx.putImageData(imgData, 0, 0);

          // Simple single seek loop in 2D
          if (activeV.currentTime >= LOOP_END) {
            activeV.currentTime = LOOP_START;
          }
        }
        animationFrameId = requestAnimationFrame(render2DFallback);
      };

      animationFrameId = requestAnimationFrame(render2DFallback);
      return () => cancelAnimationFrame(animationFrameId);
    }

    // WebGL Shader Programs with Dual-Texture Blend & Chroma Keying
    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_textureA;
      uniform sampler2D u_textureB;
      uniform float u_blend;
      varying vec2 v_texCoord;
      uniform float u_threshold;
      uniform float u_smoothing;

      vec4 keyChroma(vec4 color) {
        float r = color.r;
        float g = color.g;
        float b = color.b;

        float max_rb = max(r, b);
        float diff = g - max_rb;

        float alpha = 1.0 - smoothstep(u_threshold, u_threshold + u_smoothing, diff);
        float despilled_g = min(g, max_rb * 1.02);
        vec3 rgb = mix(color.rgb, vec3(r, despilled_g, b), step(u_threshold * 0.5, diff));

        return vec4(rgb * alpha, alpha);
      }

      void main() {
        vec4 colA = keyChroma(texture2D(u_textureA, v_texCoord));
        vec4 colB = keyChroma(texture2D(u_textureB, v_texCoord));
        gl_FragColor = mix(colA, colB, u_blend);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Quad geometry: positions & flipped tex coords for video
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,  0.0, 1.0,
         1.0, -1.0,  1.0, 1.0,
        -1.0,  1.0,  0.0, 0.0,
         1.0,  1.0,  1.0, 0.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    const aTexCoord = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    const uThreshold = gl.getUniformLocation(program, "u_threshold");
    const uSmoothing = gl.getUniformLocation(program, "u_smoothing");
    const uBlend = gl.getUniformLocation(program, "u_blend");
    const uTextureA = gl.getUniformLocation(program, "u_textureA");
    const uTextureB = gl.getUniformLocation(program, "u_textureB");

    gl.uniform1f(uThreshold, 0.06);
    gl.uniform1f(uSmoothing, 0.10);
    gl.uniform1i(uTextureA, 0);
    gl.uniform1i(uTextureB, 1);

    const setupTexture = (texUnit: number) => {
      const tex = gl!.createTexture();
      gl!.activeTexture(texUnit);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      return tex;
    };

    textureA = setupTexture(gl.TEXTURE0);
    textureB = setupTexture(gl.TEXTURE1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let currentLead: "A" | "B" = "A";
    let blend = 0.0;

    const render = () => {
      if (gl && program && textureA && textureB) {
        // Dual-buffer loop scheduler
        if (currentLead === "A") {
          const tA = videoA.currentTime;
          if (tA >= LOOP_END - CROSSFADE_TIME) {
            const p = (tA - (LOOP_END - CROSSFADE_TIME)) / CROSSFADE_TIME;
            blend = Math.max(0, Math.min(1, p));

            if (videoB.paused) {
              videoB.currentTime = LOOP_START;
              videoB.muted = true;
              videoB.play().catch(() => {});
            }

            if (tA >= LOOP_END || p >= 1.0) {
              videoA.pause();
              videoA.currentTime = LOOP_START;
              currentLead = "B";
              blend = 1.0;
            }
          } else {
            blend = 0.0;
          }
        } else {
          // currentLead === "B"
          const tB = videoB.currentTime;
          if (tB >= LOOP_END - CROSSFADE_TIME) {
            const p = (tB - (LOOP_END - CROSSFADE_TIME)) / CROSSFADE_TIME;
            blend = 1.0 - Math.max(0, Math.min(1, p));

            if (videoA.paused) {
              videoA.currentTime = LOOP_START;
              videoA.muted = true;
              videoA.play().catch(() => {});
            }

            if (tB >= LOOP_END || p >= 1.0) {
              videoB.pause();
              videoB.currentTime = LOOP_START;
              currentLead = "A";
              blend = 0.0;
            }
          } else {
            blend = 1.0;
          }
        }

        // Render frames into textures
        let hasFrame = false;
        if (blend < 1.0 && videoA.readyState >= 2) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textureA);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoA);
          hasFrame = true;
        }

        if (blend > 0.0 && videoB.readyState >= 2) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, textureB);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoB);
          hasFrame = true;
        }

        if (hasFrame) {
          if (!isVideoReady) setIsVideoReady(true);
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);

          gl.uniform1f(uBlend, blend);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        if (textureA) gl.deleteTexture(textureA);
        if (textureB) gl.deleteTexture(textureB);
        if (program) gl.deleteProgram(program);
      }
    };
  }, [isVideoReady]);

  return (
    <div className="relative flex flex-col items-center justify-end w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto select-none group">
      {/* Dual Offscreen Video Sources for Seamless Zero-Stutter Loop */}
      <video
        ref={videoRefA}
        src="/videos/architect-character.mp4"
        crossOrigin="anonymous"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="fixed -top-[9999px] -left-[9999px] w-4 h-4 opacity-0 pointer-events-none"
      />
      <video
        ref={videoRefB}
        src="/videos/architect-character.mp4"
        crossOrigin="anonymous"
        muted
        playsInline
        preload="auto"
        className="fixed -top-[9999px] -left-[9999px] w-4 h-4 opacity-0 pointer-events-none"
      />

      {/* Ambient Lighting & Rings behind Character */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        {/* Soft amber radial glow */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-500/15 via-orange-500/5 to-transparent blur-3xl transform -translate-y-6" />
        {/* Subtle circular geometric ring */}
        <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-amber-500/10 pointer-events-none" />
        <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-white/[0.03] pointer-events-none" />
      </div>

      {/* Top Floating Speech Bubble */}
      <div className="w-full mb-2 sm:mb-3 px-2 relative z-20 transition-all duration-300">
        <div className="relative rounded-2xl bg-[#0c0e14]/90 border border-white/[0.12] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-mono font-medium text-amber-200 tracking-tight">
                AI Architect Companion
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Live Agent</span>
          </div>

          <p className="text-xs text-zinc-300 font-normal leading-relaxed min-h-[36px] flex items-center">
            {ARCHITECT_TIPS[tipIndex]}
          </p>

          {/* Speech bubble pointer arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0c0e14] border-r border-b border-white/[0.12] rotate-45" />
        </div>
      </div>

      {/* Character Canvas Stage */}
      <div className="relative w-full aspect-[9/16] max-h-[460px] sm:max-h-[500px] flex items-center justify-center">
        {/* Pre-rendered fallback poster while video initializes */}
        <img
          src="/videos/architect-poster.png"
          alt="AI Software Architect"
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-500 ${
            isVideoReady ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Real-time Chroma-Key Canvas */}
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          className={`w-full h-full object-contain relative z-10 transition-opacity duration-500 drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Grounding Floor Shadow & Reflection Base */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/80 blur-lg rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-2 bg-amber-500/20 blur-sm rounded-full pointer-events-none -z-10" />
      </div>
    </div>
  );
}
