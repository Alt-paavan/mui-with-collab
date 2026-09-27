"use client";

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

const { sections } = ANIMATION_CONFIG;

export function XPUnlockGuideCTA() {
  const handleScrollToManual = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const manualEl = document.getElementById("manual");
    if (manualEl) {
      manualEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="XP Guide Unlock"
      style={{
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        padding: "clamp(1.5rem, 4vh, 3rem) 1.5rem clamp(2.5rem, 6vh, 4rem)",
        textAlign: "center",
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
          gap: "1.5rem",
        }}
      >
        {/* Highlight Text */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1rem, 3.2vw, 1.45rem)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-reality-primary)",
            textShadow: "0 0 20px rgba(239,68,68,0.35)",
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          As Promised Here Is The Guide To Install Malware On My Friends PC
        </h3>

        {/* Action Button scrolling to manual / free guide */}
        <a
          href="#manual"
          onClick={handleScrollToManual}
          aria-label="Scroll to the Free Guide and Manual section"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(0.72rem, 2vw, 0.85rem)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "#fca5a5",
            background: "rgba(180,20,20,0.22)",
            border: "1px solid rgba(220,38,38,0.45)",
            boxShadow: "0 0 15px rgba(220,38,38,0.15)",
            padding: "0.85rem 2.25rem",
            transition: "all 0.25s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(220,38,38,0.35)";
            el.style.borderColor = "rgba(239,68,68,0.7)";
            el.style.color = "#ffffff";
            el.style.boxShadow = "0 0 24px rgba(239,68,68,0.35)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(180,20,20,0.22)";
            el.style.borderColor = "rgba(220,38,38,0.45)";
            el.style.color = "#fca5a5";
            el.style.boxShadow = "0 0 15px rgba(220,38,38,0.15)";
          }}
        >
          Access Free Guide ↓
        </a>
      </motion.div>
    </section>
  );
}
