"use client";

/**
 * ClubEventHeader — Club Name + Event Name display
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays the official club and event identity immediately after the snap
 * transition. This is the first thing the user sees in Phase 2.
 *
 * Content source: src/config/siteConfig.ts
 *   - clubName / clubFullName
 *   - eventName / eventSubtitle
 *
 * This section does NOT display the rulebook, link to a PDF,
 * or recreate rulebook contents.
 */

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";
import { SITE_CONFIG } from "@/config/siteConfig";

const { sections } = ANIMATION_CONFIG;

export function ClubEventHeader() {
  return (
    <section
      id="event-info"
      aria-label="Club and Event Information"
      style={{
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        padding: "clamp(3rem, 8vh, 6rem) 1.5rem clamp(2rem, 5vh, 4rem)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: sections.entranceDuration, ease: "easeOut" }}
        style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
      >
        {/* ── Top rule ── */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(220,38,38,0.5), transparent)",
          }}
        />

        {/* ── Club + Event grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
          }}
        >
          {/* Club block */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: sections.entranceDuration,
              delay: sections.entranceDelay,
              ease: "easeOut",
            }}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(239,68,68,0.55)",
              }}
            >
              IN COLLABORATION WITH CESA
            </span>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.1rem, 3.5vw, 1.6rem)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ffffff",
                lineHeight: 1.25,
              }}
            >
              {SITE_CONFIG.clubName}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.7rem, 2vw, 0.85rem)",
                color: "var(--color-reality-muted)",
                lineHeight: 1.6,
              }}
            >
              {SITE_CONFIG.clubFullName}
            </p>
          </motion.div>

          {/* Thin horizontal separator */}
          <div
            aria-hidden="true"
            style={{
              height: 1,
              background: "var(--color-reality-border)",
            }}
          />

          {/* Event block */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: sections.entranceDuration,
              delay: sections.entranceDelay + sections.staggerDelay,
              ease: "easeOut",
            }}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(239,68,68,0.55)",
              }}
            >
              Event
            </span>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 5vw, 2.4rem)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-reality-primary)",
                textShadow: "0 0 20px rgba(239,68,68,0.3)",
                lineHeight: 1.2,
              }}
            >
              {SITE_CONFIG.eventName}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.75rem, 2.5vw, 0.95rem)",
                color: "var(--color-reality-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {SITE_CONFIG.eventSubtitle}
            </p>
          </motion.div>
        </div>

        {/* ── Bottom rule ── */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(220,38,38,0.25), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}
