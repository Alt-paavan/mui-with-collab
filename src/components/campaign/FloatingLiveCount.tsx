"use client";

/**
 * FloatingLiveCount — Persistent bottom-right visit count badge
 * ─────────────────────────────────────────────────────────────────────────────
 * Stays fixed to the bottom-right of the viewport as the user scrolls.
 * Uses the exact same data source as FooterVisitCounter.
 *
 * Real data only:
 *   - Fetches from RESOURCE_LINKS.visitCounter.endpoint if configured.
 *   - Shows "—" placeholder if unconfigured or offline (no fake numbers).
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RESOURCE_LINKS } from "@/config/resourceLinks";

export function FloatingLiveCount() {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const { endpoint } = RESOURCE_LINKS.visitCounter;

  useEffect(() => {
    if (!endpoint) return;

    const controller = new AbortController();

    fetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Non-OK response");
        return res.json();
      })
      .then((data: { count: number }) => {
        if (typeof data.count === "number") {
          setVisitCount(data.count);
        } else {
          setFetchError(true);
        }
      })
      .catch(() => {
        setFetchError(true);
      });

    return () => controller.abort();
  }, [endpoint]);

  const displayCount =
    visitCount !== null ? visitCount.toLocaleString() : "—";

  const isLive = endpoint !== null && !fetchError && visitCount !== null;

  return (
    <motion.aside
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      aria-label="Live visitors count"
      style={{
        position: "fixed",
        bottom: "clamp(1rem, 3vw, 1.5rem)",
        right: "clamp(1rem, 3vw, 1.5rem)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        gap: "0.55rem",
        padding: "0.45rem 0.85rem",
        background: "rgba(10, 0, 0, 0.88)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(220, 38, 38, 0.28)",
        borderRadius: "9999px",
        boxShadow: "0 0 20px rgba(220, 38, 38, 0.15), 0 4px 12px rgba(0, 0, 0, 0.6)",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      {/* Status indicator dot */}
      <span
        style={{
          position: "relative",
          display: "flex",
          width: "0.5rem",
          height: "0.5rem",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: isLive ? "var(--color-reality-primary)" : "rgba(220,38,38,0.4)",
            animation: "reality-pulse 2.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "relative",
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "50%",
            background: isLive ? "#ef4444" : "rgba(220,38,38,0.5)",
          }}
        />
      </span>

      {/* Counter label & number */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(252, 165, 165, 0.75)",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        <span style={{ color: "rgba(239, 68, 68, 0.65)" }}>VISITS:</span>
        <span
          style={{
            fontWeight: 700,
            color: isLive ? "#fff" : "rgba(252, 165, 165, 0.5)",
          }}
        >
          {displayCount}
        </span>
      </span>
    </motion.aside>
  );
}
