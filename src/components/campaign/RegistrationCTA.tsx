"use client";

/**
 * RegistrationCTA — External Registration Call-to-Action with Reality Stone Formation
 * ─────────────────────────────────────────────────────────────────────────────
 * Hosts the final Reality Stone crystallization destination:
 *   - RealityStoneArtifact: Scroll-driven crystalline stone & background bloom.
 *   - Player's earned XP in context.
 *   - Event title & external registration CTA.
 */

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";
import { RESOURCE_LINKS } from "@/config/resourceLinks";
import { SITE_CONFIG } from "@/config/siteConfig";
import { RealityStoneArtifact } from "@/components/campaign/RealityStoneArtifact";

interface RegistrationCTAProps {
  /** The player's earned XP — displayed in context, passed to URL if configured. */
  xp: number;
}

const { sections } = ANIMATION_CONFIG;

export function RegistrationCTA({ xp }: RegistrationCTAProps) {
  const { registration } = RESOURCE_LINKS;

  /**
   * Build the registration URL.
   * If xpQueryParam is confirmed and registration is available,
   * append the XP as a query parameter.
   */
  const buildRegistrationUrl = (): string => {
    if (!registration.available || registration.url === "#") return "#";
    if (registration.xpQueryParam && xp > 0) {
      const url = new URL(registration.url);
      url.searchParams.set(registration.xpQueryParam, String(xp));
      return url.toString();
    }
    return registration.url;
  };

  const registrationUrl = buildRegistrationUrl();
  const isReady = registration.available && registrationUrl !== "#";

  return (
    <section
      id="registration"
      aria-label="External Registration"
      style={{
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        padding: "clamp(2rem, 6vh, 5rem) 1.5rem",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: sections.entranceDuration, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.75rem",
          padding: "clamp(2rem, 5vw, 3.5rem)",
          textAlign: "center",
          background: "radial-gradient(ellipse at center, rgba(80,5,5,0.30) 0%, rgba(10,0,0,0.60) 70%)",
          border: "1px solid rgba(220,38,38,0.20)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric top glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.6), transparent)",
          }}
        />

        {/* ── Reality Stone Artifact Formation & Background Illumination ── */}
        <RealityStoneArtifact />

        {/* XP context — shows the player's earned XP */}
        {xp > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem", zIndex: 2 }}
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
              Your XP
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(2.5rem, 8vw, 4rem)",
                fontWeight: 700,
                color: "var(--color-reality-primary)",
                textShadow: "0 0 30px rgba(239,68,68,0.4)",
                lineHeight: 1,
              }}
            >
              +{xp}
            </span>
          </motion.div>
        )}

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem", zIndex: 2 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#fff",
              textShadow: "0 0 20px rgba(220,38,38,0.25)",
              margin: 0,
            }}
          >
            {registration.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)",
              color: "var(--color-reality-muted)",
              maxWidth: "42ch",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {registration.description}
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(239,68,68,0.4)",
            }}
          >
            {SITE_CONFIG.eventName} · {SITE_CONFIG.eventYear}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ zIndex: 2 }}
        >
          {isReady ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Register for MasterChef UI on the official registration page"
              style={{
                display: "inline-block",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "#fff",
                background: "rgba(180,20,20,0.4)",
                border: "1px solid rgba(220,38,38,0.55)",
                padding: "clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 5vw, 3rem)",
                boxShadow: "0 0 30px rgba(220,38,38,0.20)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(220,38,38,0.5)";
                el.style.boxShadow = "0 0 40px rgba(220,38,38,0.40)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(180,20,20,0.4)";
                el.style.boxShadow = "0 0 30px rgba(220,38,38,0.20)";
              }}
            >
              Register Now ↗
            </a>
          ) : (
            /* Placeholder state — registration URL not yet configured */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <span
                aria-label="Registration not yet open"
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(252,165,165,0.3)",
                  background: "rgba(40,3,3,0.4)",
                  border: "1px solid rgba(220,38,38,0.15)",
                  padding: "clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 5vw, 3rem)",
                  cursor: "not-allowed",
                }}
              >
                Registration Opens Soon
              </span>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(220,38,38,0.25)",
                }}
              >
                Link pending configuration
              </p>
            </div>
          )}
        </motion.div>

        {/* Bottom atmospheric rule */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.25), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}
