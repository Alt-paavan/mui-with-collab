"use client";

/**
 * InfiniteTendrilsCanvas — Controlled Fluid Energy Streams with Tapered Flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a small, configurable number of smooth, flowing liquid-energy streams.
 *
 * Stream Aesthetics:
 *   - No hard dots, blobs, or circular endpoint heads.
 *   - Natural energy density tapering: soft trailing tail, rich body, and
 *     a gently fading/narrowing leading head that dissolves into space.
 *   - Controlled parametric paths originating from outer conduits and
 *     converging toward the Reality Stone at Registration.
 */

import React, { useEffect, useRef } from "react";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

interface ControlledStream {
  id: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  progress: number;
  speed: number;
  points: { x: number; y: number }[];
  maxPoints: number;
  color: string;
  width: number;
  waveFreq: number;
  waveAmp: number;
  phase: number;
}

export function InfiniteTendrilsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const config = ANIMATION_CONFIG.tendrils;
    const numStreams = isMobile
      ? config.formationStreamsMobile
      : config.formationStreams;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mq.matches;

    // Defined origin conduits
    const conduitPositions = [
      { ox: -0.05, oy: 0.15 },
      { ox: 1.05,  oy: 0.20 },
      { ox: -0.05, oy: 0.50 },
      { ox: 1.05,  oy: 0.55 },
      { ox: 0.25,  oy: -0.05 },
      { ox: 0.75,  oy: -0.05 },
    ];

    const streams: ControlledStream[] = [];
    for (let i = 0; i < numStreams; i++) {
      const conduit = conduitPositions[i % conduitPositions.length];
      const isAltColor = i % 2 === 1;
      const startX = conduit.ox * width;
      const startY = conduit.oy * height;

      streams.push({
        id: i,
        originX: conduit.ox,
        originY: conduit.oy,
        x: startX,
        y: startY,
        progress: i / numStreams,
        speed: (0.0015 + (i % 3) * 0.0005) * config.streamSpeed,
        points: [{ x: startX, y: startY }],
        maxPoints: isMobile ? 14 : 24,
        color: isAltColor ? config.colorB : config.colorA,
        width: config.streamWidth * (0.9 + (i % 2) * 0.25),
        waveFreq: 1.5 + (i % 3) * 0.5,
        waveAmp: 25 + (i % 2) * 15,
        phase: (i * Math.PI) / 3,
      });
    }

    let scrollProgress = 0;
    let targetX = width / 2;
    let targetY = height * 0.75;

    function updateScrollProgress() {
      const regEl = document.getElementById("registration");
      if (!regEl) {
        scrollProgress = 0;
        return;
      }
      const rect = regEl.getBoundingClientRect();
      const viewportH = window.innerHeight;

      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height * 0.32;

      const raw = (viewportH - rect.top) / (viewportH * 1.25);
      scrollProgress = Math.max(0, Math.min(1, raw));
    }

    function onResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      updateScrollProgress();
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    updateScrollProgress();

    function render() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, width, height);

      if (reducedMotion) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.02)";
        ctx.fillRect(0, 0, width, height);
        return;
      }

      const convergenceFactor =
        scrollProgress > config.formationStart
          ? Math.min(
              1,
              (scrollProgress - config.formationStart) /
                (1 - config.formationStart)
            ) * config.convergenceStrength
          : 0;

      for (let i = 0; i < streams.length; i++) {
        const s = streams[i];
        s.progress += s.speed;

        if (s.progress >= 1.0) {
          s.progress = 0;
          s.x = s.originX * width;
          s.y = s.originY * height;
          s.points = [{ x: s.x, y: s.y }];
        }

        const startX = s.originX * width;
        const startY = s.originY * height;

        const ambientDestX = width * (0.2 + (s.id / streams.length) * 0.6);
        const ambientDestY = height * (0.4 + (s.id % 2) * 0.3);

        const currentDestX =
          ambientDestX * (1 - Math.min(1, convergenceFactor)) +
          targetX * Math.min(1, convergenceFactor);
        const currentDestY =
          ambientDestY * (1 - Math.min(1, convergenceFactor)) +
          targetY * Math.min(1, convergenceFactor);

        const p = s.progress;
        const wave =
          Math.sin(p * Math.PI * s.waveFreq + s.phase) *
          s.waveAmp *
          (1 - p * 0.6);

        const currentX = (1 - p) * startX + p * currentDestX + wave;
        const currentY = (1 - p) * startY + p * currentDestY + wave * 0.5;

        s.x = currentX;
        s.y = currentY;

        s.points.push({ x: s.x, y: s.y });
        if (s.points.length > s.maxPoints) {
          s.points.shift();
        }

        const len = s.points.length;
        if (len > 3) {
          // Overall life cycle alpha for the entire stream
          const lifeAlpha = Math.sin(p * Math.PI);
          const baseStreamAlpha =
            (config.streamOpacity +
              convergenceFactor *
                (config.peakStreamOpacity - config.streamOpacity)) *
            lifeAlpha;

          // Render graduated segmented strokes for natural head & tail tapering
          for (let j = 0; j < len - 1; j++) {
            const p0 = s.points[j];
            const p1 = s.points[j + 1];

            // normalized position along the stream trail (0.0 = oldest tail, 1.0 = newest head)
            const t = j / (len - 1);

            // Tapering profile:
            // - Tail (t: 0 -> 0.3): smooth ramp up
            // - Body (t: 0.3 -> 0.75): full width and peak density
            // - Head (t: 0.75 -> 1.0): gently narrows down and fades out (NO blob/dot)
            let segmentAlpha = baseStreamAlpha;
            let segmentWidth = s.width;

            if (t < 0.3) {
              const tailRatio = t / 0.3;
              segmentAlpha *= Math.pow(tailRatio, 1.2);
              segmentWidth *= 0.4 + 0.6 * tailRatio;
            } else if (t > 0.75) {
              const headRatio = (1.0 - t) / 0.25;
              segmentAlpha *= Math.pow(headRatio, 1.4);
              segmentWidth *= 0.3 + 0.7 * headRatio;
            }

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);

            ctx.strokeStyle = s.color;
            ctx.globalAlpha = Math.max(0, Math.min(0.65, segmentAlpha));
            ctx.lineWidth = Math.max(0.4, segmentWidth);
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        mixBlendMode: "screen",
      }}
    />
  );
}
