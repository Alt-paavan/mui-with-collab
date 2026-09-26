"use client";

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";
import { RESOURCE_LINKS } from "@/config/resourceLinks";

const { sections } = ANIMATION_CONFIG;
const { manual } = RESOURCE_LINKS;

/**
 * ManualSection — event manual download slot.
 *
 * Where do I change the manual link?
 *   → src/config/resourceLinks.ts → RESOURCE_LINKS.manual.url
 *   Also set `available: true` once the real URL is ready.
 */
export function ManualSection() {
  return (
    <section
      id="manual"
      className="w-full max-w-2xl mx-auto px-4 py-12"
      aria-label="Event Manual"
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: sections.entranceDuration, ease: "easeOut" }}
        className="flex flex-col gap-5"
        style={{
          padding: "2rem",
          background: "rgba(40,3,3,0.4)",
          border: "1px solid rgba(220,38,38,0.15)",
        }}
      >
        {/* Label */}
        <p
          className="text-xs font-bold uppercase tracking-[0.3em]"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.6)" }}
        >
          Event Document
        </p>

        <h2
          className="text-xl sm:text-2xl font-bold uppercase tracking-wider"
          style={{ fontFamily: "var(--font-display)", color: "#fff" }}
        >
          {manual.title}
        </h2>

        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-body)", color: "rgba(252,165,165,0.6)" }}
        >
          {manual.description}
        </p>

        {/* Download button */}
        <div className="mt-2">
          {manual.available ? (
            <a
              href={manual.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: "var(--font-display)",
                background: "rgba(180,20,20,0.25)",
                border: "1px solid rgba(220,38,38,0.4)",
                color: "#fca5a5",
              }}
              aria-label={`Download ${manual.title}`}
            >
              Download Manual
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest cursor-not-allowed"
              style={{
                fontFamily: "var(--font-display)",
                background: "rgba(40,5,5,0.3)",
                border: "1px solid rgba(220,38,38,0.15)",
                color: "rgba(252,165,165,0.3)",
              }}
              title="Manual not yet available"
            >
              Coming Soon
            </span>
          )}
        </div>
      </motion.div>
    </section>
  );
}
