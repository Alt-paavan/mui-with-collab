"use client";

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";
import { RESOURCE_LINKS } from "@/config/resourceLinks";

const { sections } = ANIMATION_CONFIG;
const { repositories } = RESOURCE_LINKS;

/**
 * RepositoryLinks — event repository and design resource links.
 *
 * Where do I change repository URLs?
 *   → src/config/resourceLinks.ts → RESOURCE_LINKS.repositories[n].url
 *   Also set `available: true` for each entry once the real URL is ready.
 */
export function RepositoryLinks() {
  return (
    <section
      id="repositories"
      className="w-full max-w-2xl mx-auto px-4 pt-4 pb-24"
      aria-label="Event Repositories"
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: sections.entranceDuration, ease: "easeOut" }}
        className="flex flex-col gap-4"
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.6)" }}
        >
          Resources
        </p>

        {repositories.map((repo, i) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: sections.entranceDuration,
              delay: sections.entranceDelay + i * sections.staggerDelay,
              ease: "easeOut",
            }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-5"
            style={{
              background: "rgba(30,3,3,0.4)",
              border: "1px solid rgba(220,38,38,0.12)",
            }}
          >
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-1"
                style={{ fontFamily: "var(--font-display)", color: "#fff" }}
              >
                {repo.label}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(252,165,165,0.55)" }}
              >
                {repo.description}
              </p>
            </div>

            <div className="shrink-0">
              {repo.available ? (
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-display)",
                    border: "1px solid rgba(220,38,38,0.35)",
                    color: "#fca5a5",
                  }}
                  aria-label={`Open ${repo.label}`}
                >
                  Open
                </a>
              ) : (
                <span
                  className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-widest cursor-not-allowed"
                  style={{
                    fontFamily: "var(--font-display)",
                    border: "1px solid rgba(220,38,38,0.12)",
                    color: "rgba(252,165,165,0.25)",
                  }}
                  title="Not yet available"
                >
                  Soon
                </span>
              )}
            </div>
          </motion.div>
        ))}


      </motion.div>
    </section>
  );
}
