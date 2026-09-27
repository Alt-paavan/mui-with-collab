"use client";

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";
import { RESOURCE_LINKS } from "@/config/resourceLinks";

const { sections } = ANIMATION_CONFIG;
const { manual } = RESOURCE_LINKS;

/**
 * ManualSection — Event Guide & Manual Poster with Direct Download.
 *
 * The poster image and download paths are managed from one centralized place:
 *   → src/config/resourceLinks.ts → RESOURCE_LINKS.manual
 */
export function ManualSection() {
  return (
    <section
      id="manual"
      className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16"
      aria-label="Event Manual and Free Guide"
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: sections.entranceDuration, ease: "easeOut" }}
        className="flex flex-col items-center text-center gap-6"
      >
        {/* Section Header */}
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.6)" }}
          >
            
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {manual.title}
          </h2>
          <p
            className="text-xs sm:text-sm max-w-lg leading-relaxed text-red-200/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {manual.description}
          </p>
        </div>

        {/* Clickable Poster — Direct Native File Download */}
        <motion.div
          whileHover={{ scale: 1.018 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-sm sm:max-w-md mx-auto"
        >
          <a
            href={manual.downloadUrl}
            download={manual.downloadFilename}
            aria-label={`Download ${manual.title} PDF`}
            className="group relative block w-full rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080000] cursor-pointer transition-shadow duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_40px_rgba(239,68,68,0.35)]"
          >
            {/* Poster Image */}
            <img
              src={manual.poster}
              alt={manual.title}
              width={600}
              height={850}
              className="w-full h-auto object-cover block rounded-xl border border-red-950/60 group-hover:border-red-600/40 transition-colors duration-300"
              loading="lazy"
            />

            {/* Subtle Interactive Crimson Sheen on Hover */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
              style={{
                background: "radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
          </a>
        </motion.div>

        {/* Action / Interaction Caption */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse"
            aria-hidden="true"
          />
          <span
            className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-mono text-red-300/70"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Click poster to download manual (PDF)
          </span>
        </div>
      </motion.div>
    </section>
  );
}
