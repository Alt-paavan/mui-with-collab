"use client";

/**
 * SnapReveal — Full-Screen Opening Reality Scene
 * ─────────────────────────────────────────────────────────────────────────────
 * The ENTIRE viewport is the subject of the snap — not just the logo.
 *
 * Layer order:
 *   [1] Atmospheric background (dark, deep crimson radial)
 *   [2] Ambient glow orbs (organic energy feel)
 *   [3] GDGC logo — ONE complete image, never split
 *   [4] Opening text
 *
 * All of [1-4] are wrapped in SceneSnapEffect, which:
 *   – Drifts + blurs the full scene as one unit
 *   – Spawns a FIXED full-viewport particle field (via portal)
 *   – Flashes a chromatic overlay across the full screen
 *
 * Timing values → src/config/animationConfig.ts
 * Colors        → src/styles/variables.css + animationConfig.ts
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SceneSnapEffect } from "../ui/thanos-snap-effect";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

interface SnapRevealProps {
  onTransitionComplete: () => void;
}

const { opening } = ANIMATION_CONFIG;

export function SnapReveal({ onTransitionComplete }: SnapRevealProps) {
  const [shouldSnap, setShouldSnap] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    // All timing from animationConfig — do not add inline values here
    const t = setTimeout(() => setShouldSnap(true), opening.logoDisplayDuration);
    return () => clearTimeout(t);
  }, []);

  const handleComplete = () => {
    setIsComplete(true);
    onTransitionComplete();
  };

  // After scene fully collapses, remove from DOM to free memory
  if (isComplete) return null;

  const scene = <OpeningScene />;

  if (reducedMotion) {
    return (
      <div
        style={{
          opacity: shouldSnap ? 0 : 1,
          transition: `opacity ${opening.reducedMotionFadeDuration}s ease`,
        }}
        onTransitionEnd={() => { if (shouldSnap) handleComplete(); }}
      >
        {scene}
      </div>
    );
  }

  return (
    <SceneSnapEffect
      trigger={shouldSnap}
      onComplete={handleComplete}
    >
      {scene}
    </SceneSnapEffect>
  );
}

/** ─── The Opening Scene ────────────────────────────────────────────────────
 * This is the complete visual reality that gets snapped away.
 * Background → glow orbs → logo → text are all one scene.
 */
function OpeningScene() {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh", width: "100%", background: "var(--color-reality-base)" }}
    >
      {/* ── [1] Deep radial atmosphere — bleeds edge to edge ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(100,5,5,0.55) 0%, rgba(40,2,2,0.75) 45%, #080000 80%)",
          pointerEvents: "none",
        }}
      />

      {/* ── [2] Organic floating glow orbs ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "55vw",
          height: "55vw",
          maxWidth: 480,
          maxHeight: 480,
          background:
            "radial-gradient(circle, rgba(160,15,15,0.14) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "8%",
          width: "45vw",
          height: "45vw",
          maxWidth: 380,
          maxHeight: 380,
          background:
            "radial-gradient(circle, rgba(90,5,5,0.10) 0%, transparent 70%)",
          filter: "blur(110px)",
          pointerEvents: "none",
        }}
      />
      {/* Top-edge energy bleed */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "25%",
          right: "25%",
          height: "30vh",
          background:
            "radial-gradient(ellipse at top, rgba(200,30,30,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* ── [3] Horizontal scan-line texture (reality grid feel) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(180,20,20,0.025) 4px)",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* ── [4] Centered content — GDGC logo + text ── */}
      <div
        className="relative z-10 flex flex-col items-center gap-1 sm:gap-1 px-4"
        style={{ textAlign: "center" }}
      >
        {/* Logo entrance fade-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ position: "relative", width: "clamp(140px, 28vw, 220px)", height :"200px" }}
        >
          {/*
           * GDGC logo — treated as ONE SINGLE IMAGE OBJECT.
           * Never split into pieces. Never recreated with CSS.
           */}
          <Image
            src="/gdgc-pccoe-logo-new.png"
            alt="GDGC Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-3"
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 4.5vw, 2.6rem)",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#fff",
              textShadow:
                "0 0 24px rgba(220,38,38,0.55), 0 0 60px rgba(180,20,20,0.30)",
            }}
          >
            Reality Initializing
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(239,68,68,0.55)",
            }}
          >
            MasterChef UI  2026
          </p>
        </motion.div>
      </div>

      {/* ── Corner energy accents ── */}
      {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
        (pos, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              width: "clamp(40px, 8vw, 80px)",
              height: "clamp(40px, 8vw, 80px)",
              borderTop:
                i < 2 ? "1px solid rgba(220,38,38,0.25)" : undefined,
              borderBottom:
                i >= 2 ? "1px solid rgba(220,38,38,0.25)" : undefined,
              borderLeft:
                i % 2 === 0 ? "1px solid rgba(220,38,38,0.25)" : undefined,
              borderRight:
                i % 2 === 1 ? "1px solid rgba(220,38,38,0.25)" : undefined,
              top: pos.includes("top") ? 24 : undefined,
              bottom: pos.includes("bottom") ? 24 : undefined,
              left: pos.includes("left") ? 24 : undefined,
              right: pos.includes("right") ? 24 : undefined,
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
        )
      )}
    </div>
  );
}
