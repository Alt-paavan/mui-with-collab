/**
 * ANIMATION_CONFIG — Single Source of Truth
 * ─────────────────────────────────────────────────────────────────────────────
 * Developer quick-reference:
 *   Timing          → opening.*
 *   Snap distortion → snap.*
 *   Particles       → particles.*
 *   Section reveals → sections.*
 *   Game & delays   → game.*
 *   Tendrils & Stone→ tendrils.*
 *
 * NOTHING in this config should appear as a visible UI control.
 */

export const ANIMATION_CONFIG = {
  opening: {
    logoDisplayDuration: 1600,
    reducedMotionFadeDuration: 2.2,
  },

  snap: {
    snapDuration: 2.8,
    driftStrength: 1.0,
    blurAmount: 8,
    endScale: 0.94,
    chromaticSpread: 8,
  },

  particles: {
    densityDesktop: 600,
    densityMobile: 280,
    size: 2.5,
    speed: 1.3,
    color: "#f87171",          // red-400
    colorSecondary: "#fca5a5", // red-300
    colorHighlight: "#fbbf24", // amber-400
    opacity: 0.95,
    directionX: { min: 80,  max: 280 },
    directionY: { min: -140, max: -20 },
    viewportSpread: 1.0,
  },

  sections: {
    entranceDelay: 0.1,
    entranceDuration: 0.6,
    entranceSlide: 28,
    staggerDelay: 0.11,
  },

  game: {
    entranceDuration: 0.5,
    resultRevealDuration: 0.7,
    resultStaggerDelay: 0.15,
    completionTransitionDelay: 1000,
  },

  /**
   * Infinite Tendrils & Reality Stone Formation Configuration
   * ───────────────────────────────────────────────────────────────────────────
   * Controlled energy streams converging toward the Reality Stone at Registration.
   */
  tendrils: {
    enabled: true,

    /**
     * Reality Stone image file path (relative to the public folder or static assets).
     * Uses /reality-stone-v2.png to ensure clean cache busting.
     */
    stoneImage: "/reality-stone-v2.png",

    /** Number of persistent visible energy streams on desktop. */
    formationStreams: 20,
    /** Number of persistent visible energy streams on mobile. */
    formationStreamsMobile: 10,

    /** Base stream opacity (kept subtle so content is the visual priority). */
    streamOpacity: 0.18,
    /** Peak opacity when converging near the Reality Stone. */
    peakStreamOpacity: 0.5,
    /** Stroke width of each stream in px. */
    streamWidth: 1.6,
    /** Movement speed multiplier of the streams. */
    streamSpeed: 0.55,

    /** Primary crimson stream color. */
    colorA: "#f87171", // red-400
    /** Secondary warm amber/ember accent color. */
    colorB: "#fbbf24", // amber-400

    /** Gravitational convergence strength toward the stone. */
    convergenceStrength: 1.3,
    /** Scroll progress threshold (0.0–1.0) where convergence begins. */
    formationStart: 0.35,
    /** Scroll progress threshold (0.0–1.0) where the stone is fully formed. */
    formationComplete: 0.88,

    /** Reality Stone scale multiplier at final formation. */
    stoneScale: 1.0,
    /** Stone core glow intensity (0.0–1.0). */
    stoneGlow: 0.85,
    /** Radius in px of the soft radial ambient background illumination. */
    stoneIlluminationBloom: 400,
  },
} as const;

export type AnimationConfig = typeof ANIMATION_CONFIG;
