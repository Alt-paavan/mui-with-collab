"use client";

/**
 * RealityStoneArtifact — Pure Transparent Reality Stone Integration
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the clean, transparent Reality Stone asset with natural vertical sizing,
 * optimal Next.js image loading, and zero glassmorphism or frosted borders.
 */

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

export function RealityStoneArtifact() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const { tendrils } = ANIMATION_CONFIG;

  useEffect(() => {
    function calculateProgress() {
      const regEl = document.getElementById("registration");
      if (!regEl) return;
      const rect = regEl.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Progress: 0.0 when entering viewport bottom → 1.0 when centered
      const raw = (viewportH - rect.top) / (viewportH * 0.95);
      setScrollProgress(Math.max(0, Math.min(1, raw)));
    }

    window.addEventListener("scroll", calculateProgress, { passive: true });
    calculateProgress();
    return () => window.removeEventListener("scroll", calculateProgress);
  }, []);

  // Formation curves
  const stoneOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.45) * 2.2));
  const stoneScale = (0.85 + Math.min(0.15, Math.max(0, (scrollProgress - 0.45) * 0.4))) * tendrils.stoneScale;
  const isFormed = scrollProgress >= tendrils.formationComplete;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        margin: "-0.5rem 0 0.5rem 0",
        zIndex: 0,
        userSelect: "none",
      }}
    >
      {/* ── [1] Clean, Transparent Reality Stone Image with Natural Proportions ── */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: stoneOpacity,
          transform: `scale(${stoneScale})`,
          transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
          width: "clamp(105px, 20vw, 150px)",
          height: "clamp(142px, 27vw, 205px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            animation: isFormed ? "reality-pulse 4s ease-in-out infinite" : "none",
          }}
        >
          <Image
            src={tendrils.stoneImage}
            alt="Reality Stone"
            fill
            sizes="(max-width: 768px) 130px, 160px"
            className="object-contain"
            priority={false}
          />
        </div>
      </motion.div>

      {/* ── [2] Subtle Formation Label ── */}
      <div
        style={{
          marginTop: "0.4rem",
          opacity: Math.max(0, Math.min(0.7, (scrollProgress - 0.65) * 2.8)),
          transition: "opacity 0.3s ease-out",
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(248, 113, 113, 0.75)",
          textAlign: "center",
          textShadow: "0 0 8px rgba(239, 68, 68, 0.4)",
          zIndex: 1,
        }}
      >
        Reality Stone Formed
      </div>
    </div>
  );
}
