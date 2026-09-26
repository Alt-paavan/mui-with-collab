"use client";

/**
 * ThanosSnapEffect — Full-Viewport Reality Collapse Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * This component wraps an ENTIRE SCENE (not just a logo or card).
 * When triggered:
 *   1. The scene drifts + blurs + fades as one unified layer.
 *   2. A FIXED, FULL-VIEWPORT particle field spawns independently,
 *      so particles are never geometrically confined to the scene content.
 *   3. A chromatic-split overlay flashes across the whole screen.
 *
 * Architecture:
 *   ┌ fixed inset-0 particle canvas ┐  ← rendered into document.body portal
 *   │  scene children (drift+blur)  │  ← relative-positioned scene wrapper
 *   └───────────────────────────────┘
 *
 * All visual values (color, density, speed, direction) come from animationConfig.ts.
 * Do NOT hardcode any of them here.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

interface SceneSnapEffectProps {
  children: React.ReactNode;
  /** Set true to fire the collapse. */
  trigger?: boolean;
  /** Called after the full animation completes. */
  onComplete?: () => void;
}

interface Particle {
  id: number;
  /** vw — spawn position as viewport-width percentage for true full-screen spread */
  xPct: number;
  /** vh — spawn position as viewport-height percentage */
  yPct: number;
  /** final translated X in px */
  tx: number;
  /** final translated Y in px */
  ty: number;
  color: string;
  size: number;
  delay: number;
}

function pickParticleColor(index: number): string {
  const { color, colorSecondary, colorHighlight } = ANIMATION_CONFIG.particles;
  if (index % 8 === 0) return colorHighlight;
  if (index % 3 === 0) return colorSecondary;
  return color;
}

function buildParticles(count: number): Particle[] {
  const { speed, directionX, directionY, size } = ANIMATION_CONFIG.particles;
  return Array.from({ length: count }, (_, i) => {
    const rawTx =
      directionX.min + Math.random() * (directionX.max - directionX.min);
    const rawTy =
      directionY.min + Math.random() * (directionY.max - directionY.min);
    return {
      id: i,
      xPct: Math.random() * 100,
      yPct: Math.random() * 100,
      tx: rawTx * speed,
      ty: rawTy * speed,
      color: pickParticleColor(i),
      // Slight size variation so the field feels organic, not mechanical
      size: size * (0.7 + Math.random() * 0.8),
      delay: Math.random() * 0.4,
    };
  });
}

/** Renders a fixed full-viewport particle canvas into document.body via portal. */
function ParticleCanvas({
  particles,
  snapDuration,
}: {
  particles: Particle[];
  snapDuration: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: ANIMATION_CONFIG.particles.opacity, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.tx, y: p.ty, scale: 0 }}
          transition={{
            duration: snapDuration * 0.85,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            left: `${p.xPct}vw`,
            top: `${p.yPct}vh`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

export function SceneSnapEffect({ children, trigger = false, onComplete }: SceneSnapEffectProps) {
  const [snapped, setSnapped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const particles = useRef<Particle[]>([]);

  const { snap } = ANIMATION_CONFIG;

  // Determine particle count based on viewport width at trigger time
  const getParticleCount = useCallback(() => {
    if (typeof window === "undefined") return ANIMATION_CONFIG.particles.densityDesktop;
    return window.innerWidth < 768
      ? ANIMATION_CONFIG.particles.densityMobile
      : ANIMATION_CONFIG.particles.densityDesktop;
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!trigger) return;
    // Seed particles at trigger time (not on mount) so density adapts to current viewport
    particles.current = buildParticles(getParticleCount());
    setSnapped(true);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, snap.snapDuration * 1000 + 300);
    return () => clearTimeout(timer);
  }, [trigger, onComplete, snap.snapDuration, getParticleCount]);

  return (
    <>
      {/* ── Scene wrapper — the whole opening screen drifts + blurs away ── */}
      <motion.div
        style={{ width: "100%", minHeight: "100vh" }}
        animate={
          snapped
            ? {
                opacity: 0,
                scale: snap.endScale,
                filter: `blur(${snap.blurAmount}px)`,
                x: 80 * snap.driftStrength,
                y: -30 * snap.driftStrength,
              }
            : { opacity: 1, scale: 1, filter: "blur(0px)", x: 0, y: 0 }
        }
        transition={{ duration: snap.snapDuration, ease: [0.4, 0, 1, 1] }}
        className="will-change-transform"
      >
        {children}
      </motion.div>

      {/* ── Chromatic-split flash overlay — covers entire viewport ── */}
      <AnimatePresence>
        {snapped && (
          <motion.div
            key="chromatic"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: snap.snapDuration * 0.6, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9998,
              background: `radial-gradient(ellipse at 60% 40%,
                rgba(239,68,68,0.25) 0%,
                rgba(251,191,36,0.08) 40%,
                transparent 70%)`,
              filter: `blur(${snap.chromaticSpread}px)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Full-viewport particle field via portal ── */}
      {snapped && mounted && (
        <ParticleCanvas
          particles={particles.current}
          snapDuration={snap.snapDuration}
        />
      )}
    </>
  );
}
