"use client";

/**
 * GameResult — Final score and XP display after the game ends.
 *
 * Data flow:
 *   MiniGame → onGameComplete(score) → page.tsx → <GameResult score={score} />
 *   XP is derived here via scoreToXP() from siteConfig.ts.
 *
 * Does NOT display XP-to-coin conversion. XP only.
 *
 * Where to change the XP formula?  → src/config/siteConfig.ts → scoreToXP()
 * Where to change timing?          → src/config/animationConfig.ts → game.*
 */

import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/config/animationConfig";
import { scoreToXP, getCompletionMessage } from "@/config/siteConfig";

interface GameResultProps {
  score: number;
  xp?: number;
}

const { game, sections } = ANIMATION_CONFIG;

export function GameResult({ score, xp: passedXp }: GameResultProps) {
  const xp = passedXp ?? scoreToXP(score);
  const message = getCompletionMessage(xp);

  return (
    <section
      id="result"
      aria-label="Game Result"
      style={{
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        padding: "clamp(3rem, 8vh, 5rem) 1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: sections.entranceSlide }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: game.resultRevealDuration, ease: "easeOut" }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", textAlign: "center" }}
      >
        {/* Section marker */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: game.resultStaggerDelay, duration: 0.6 }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(220,38,38,0.65)",
          }}
        >
          Flight Window Concluded
        </motion.p>

        {/* Completion message */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: game.resultStaggerDelay * 2, duration: 0.5 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
            fontWeight: 700,
            color: "#fff",
            textShadow: "0 0 24px rgba(220,38,38,0.30)",
            margin: 0,
          }}
        >
          {message}
        </motion.h2>

        {/* Stat cards — Best Distance and XP */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "1rem",
            width: "100%",
            justifyContent: "center",
            marginTop: "0.5rem",
          }}
        >
          {[
            { label: "Best Distance", value: `${score.toLocaleString()}m` },
            { label: "XP Earned",     value: `+${xp}` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: game.resultStaggerDelay * (i + 3),
                duration: game.resultRevealDuration,
              }}
              style={{
                flex: "1 1 180px",
                maxWidth: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.35rem",
                padding: "1.75rem 1.5rem",
                background: "rgba(60,4,4,0.25)",
                border: "1px solid rgba(220,38,38,0.15)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(2rem, 7vw, 3rem)",
                  fontWeight: 700,
                  color: "var(--color-reality-primary)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-reality-muted)",
                }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

