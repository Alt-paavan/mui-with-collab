"use client";

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

const { sections } = ANIMATION_CONFIG;

const rules = [
  {
    number: "01",
    title: "What Is This",
    body: "Endless Grapple — an aerial momentum challenge across the dusk skyline. Catch lines, swing between anchor points, and stay airborne.",
  },
  {
    number: "02",
    title: "How To Grapple",
    body: "Desktop: Press & hold SPACE or click/hold to grapple overhead anchors; release to launch. Mobile: Touch and hold to attach, release to fly.",
  },
  {
    number: "03",
    title: "Bounce Platforms & Hazards",
    body: "Touchdown on teal bounce platforms to recharge vertical momentum. Steer clear of red barrier shards and airborne drones.",
  },
  {
    number: "04",
    title: "90s Window & 2 Attempts",
    body: "Each attempt grants a 90-second flight window. You get a maximum of 2 attempts. Attempt 1 has a retry; Attempt 2 is locked permanently.",
  },
  {
    number: "05",
    title: "Best Distance & XP",
    body: "Your furthest distance across attempts is your final score. Every 10m traveled earns 1 XP (up to 1,000 XP max) to unlock the Event Guide.",
  },
];


export function GameRules() {
  const handleScrollToGame = () => {
    const gameElement = document.getElementById("game");
    if (gameElement) {
      gameElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="rules"
      className="w-full max-w-2xl mx-auto px-4 py-16 sm:py-24"
      aria-label="Game Rules"
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: sections.entranceDuration, ease: "easeOut" }}
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(239,68,68,0.6)" }}
          >
            Pre-Event Challenge
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-display)",
              color: "#fff",
              textShadow: "0 0 30px rgba(220,38,38,0.3)",
            }}
          >
            The Rules
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.7), transparent)" }}
          />
        </div>

        {/* Rules list */}
        <ol className="flex flex-col gap-6">
          {rules.map((rule, i) => (
            <motion.li
              key={rule.number}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: sections.entranceDuration,
                delay: sections.entranceDelay + i * sections.staggerDelay,
                ease: "easeOut",
              }}
              className="flex gap-5 items-start"
            >
              <span
                className="shrink-0 text-sm font-bold tabular-nums mt-0.5"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-reality-primary)" }}
              >
                {rule.number}
              </span>
              <div>
                <h3
                  className="text-sm font-bold uppercase tracking-wider mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "#fff" }}
                >
                  {rule.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(252,165,165,0.7)" }}
                >
                  {rule.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* CTA: Smooth scrolls to the pre-loaded game */}
        <motion.div
          className="mt-14 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sections.entranceDelay + rules.length * sections.staggerDelay + 0.2, duration: 0.5 }}
        >
          <button
            onClick={handleScrollToGame}
            className="group relative px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] overflow-hidden transition-all duration-300"
            style={{ fontFamily: "var(--font-display)", cursor: "pointer" }}
            aria-label="Scroll to the Reality Breach challenge"
          >
            {/* Button border glow */}
            <span
              className="absolute inset-0"
              style={{ border: "1px solid rgba(220,38,38,0.5)", boxShadow: "0 0 20px rgba(220,38,38,0.15)" }}
            />
            {/* Hover fill */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(180,20,20,0.25)" }}
            />
            <span className="relative" style={{ color: "#fca5a5" }}>
              Begin Endless Grapple ↓
            </span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

