"use client";

/**
 * LightReveal
 * ─────────────────────────────────────────────────────────────────────────────
 * Overhead kitchen spotlight animation — two bulbs ignite and cast a warm
 * conical beam downward. Pure CSS animation (no framer-motion needed).
 *
 * Ported from D:\projects\MUI src\components\LightReveal\LightReveal.jsx
 * CSS lives in src/app/globals.css (light-reveal-* classes + keyframes).
 */
export function LightReveal() {
  return (
    <div className="light-reveal-screen" aria-hidden="true">
      {/* Overhead Kitchen Hood Downlight Fixtures */}
      <div className="light-hood-fixture">
        <div className="light-hood-bulb bulb-left" />
        <div className="light-hood-bulb bulb-right" />
      </div>

      {/* Downward Expanding Conical Light Beam */}
      <div className="light-beam-conical" />

      {/* Ambient Countertop Illumination */}
      <div className="light-countertop-glow" />
    </div>
  );
}
