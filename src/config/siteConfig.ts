/**
 * SITE_CONFIG — Club, Event, and Campaign Identity
 * ─────────────────────────────────────────────────────────────────────────────
 * Official names extracted from the event rulebook (reference-only).
 * Do NOT embed or display the rulebook — only these extracted identifiers.
 *
 * Where is XP calculated?  → scoreToXP() below.
 * Where is score set?      → MiniGame.tsx → onGameComplete(score).
 */

export const SITE_CONFIG = {
  /** Official organizing club — extracted from rulebook reference. */
  clubName: "ANANTYA GDGC",
  clubFullName:
    "Google Developer Groups on Campus",

  /** Official event name — extracted from rulebook reference. */
  eventName: "MasterChef UI",
  eventSubtitle: "UI/UX Designing Challenge",

  eventYear: 2026,
  tagline: "Reality Initializing",
} as const;

/**
 * XP CALCULATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts raw game distance score → XP.
 * 10m traveled = 1 XP (up to 1,000 XP max).
 */
export function scoreToXP(score: number): number {
  const XP_PER_DISTANCE = 0.1;
  return Math.min(1000, Math.max(0, Math.round(score * XP_PER_DISTANCE)));
}

/** Tier-based completion message shown on the result screen. */
export function getCompletionMessage(xp: number): string {
  if (xp >= 800) return "Master of the Skyline — Legendary Line Recorded.";
  if (xp >= 500) return "Aerial Prodigy — High Altitude Flight Achieved.";
  if (xp >= 200) return "Momentum Mastered — Strong Line Logged.";
  return "Dusk Sector Traversed — Distance Logged.";
}

