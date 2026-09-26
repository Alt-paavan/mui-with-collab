"use client";

/**
 * FooterVisitCounter — Page footer with visit count integration point
 * ─────────────────────────────────────────────────────────────────────────────
 * The visit counter shows REAL data only.
 * No random numbers. No fake counts. No hardcoded values.
 *
 * How to connect a real backend:
 *   1. Set RESOURCE_LINKS.visitCounter.endpoint to your API URL.
 *   2. The endpoint must respond with JSON: { count: number }
 *   3. The component will fetch and display the live count.
 *
 * Until configured, a neutral "—" placeholder is shown.
 */

import { useEffect, useState } from "react";
import { RESOURCE_LINKS } from "@/config/resourceLinks";
import { SITE_CONFIG } from "@/config/siteConfig";

export function FooterVisitCounter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const { endpoint } = RESOURCE_LINKS.visitCounter;

  useEffect(() => {
    if (!endpoint) return; // No endpoint configured — show neutral placeholder

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
        // Silently fail — don't show broken state, show neutral placeholder
        setFetchError(true);
      });

    return () => controller.abort();
  }, [endpoint]);

  /**
   * What to display:
   *   - No endpoint configured → "—" (neutral, not misleading)
   *   - Fetch succeeded        → formatted count
   *   - Fetch failed           → "—" (fail silently, not a broken error state)
   */
  const displayCount =
    visitCount !== null ? visitCount.toLocaleString() : "—";

  const showCount = endpoint !== null && !fetchError && visitCount !== null;

  return (
    <footer
      aria-label="Site footer"
      style={{
        width: "100%",
        padding: "clamp(2.5rem, 6vh, 4rem) 1.5rem clamp(2rem, 5vh, 3rem)",
        borderTop: "1px solid rgba(220,38,38,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* Visit counter block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(239,68,68,0.35)",
          }}
        >
          {/* Label adapts based on whether the counter is live */}
          {showCount ? "Realities Breached" : "Visitors"}
        </span>

        <span
          aria-label={
            showCount
              ? `${displayCount} visitors`
              : "Visit count not yet available"
          }
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            fontWeight: 700,
            color: showCount ? "var(--color-reality-primary)" : "rgba(220,38,38,0.20)",
            letterSpacing: "0.1em",
            textShadow: showCount ? "0 0 16px rgba(239,68,68,0.3)" : "none",
          }}
        >
          {displayCount}
        </span>

        {!endpoint && (
          /* Dev-visible note — not shown to regular users as a broken state */
          <span
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(220,38,38,0.18)",
            }}
          >
            {/* Connect: resourceLinks.ts → visitCounter.endpoint */}
            counter pending
          </span>
        )}
      </div>

      {/* Thin divider */}
      <div
        aria-hidden="true"
        style={{
          width: "clamp(40px, 10vw, 80px)",
          height: "1px",
          background: "rgba(220,38,38,0.18)",
        }}
      />

      {/* Organizer credits */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(0.7rem, 2vw, 0.85rem)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(252,165,165,0.35)",
            margin: 0,
          }}
        >
          {SITE_CONFIG.eventName} · {SITE_CONFIG.eventYear}
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.65rem, 1.8vw, 0.75rem)",
            color: "rgba(252,165,165,0.20)",
            margin: 0,
          }}
        >
          {SITE_CONFIG.clubName}
        </p>
      </div>
    </footer>
  );
}
