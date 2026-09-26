"use client";

/**
 * CampaignNav — Fixed Magnetic Dock Navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Combines the fixed top viewport positioning with an interactive Magnetic Dock.
 *
 * Preserves all section anchors:
 *   #rules → GameRules
 *   #game → MiniGame
 *   #result → GameResult (Score & XP)
 *   #manual → ManualSection
 *   #registration → RegistrationCTA
 *
 * zIndex is locked at 1000 for continuous availability.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dock, DockItem } from "@/components/ui/magnetic-dock";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

const NAV_ITEMS = [
  { label: "Rules",     shortLabel: "Rules",  href: "#rules" },
  { label: "Challenge", shortLabel: "Game",   href: "#game" },
  { label: "Score",     shortLabel: "XP",     href: "#result" },
  { label: "Resources", shortLabel: "Res",    href: "#manual" },
  { label: "Register",  shortLabel: "Reg",    href: "#registration" },
] as const;

export function CampaignNav() {
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((n) => n.href.slice(1));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveHref(`#${id}`);
          }
        },
        { rootMargin: "-25% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const { sections } = ANIMATION_CONFIG;

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: sections.entranceDuration, delay: 0.1 }}
      aria-label="Campaign Navigation"
      style={{
        position: "fixed",
        top: "clamp(0.6rem, 2vh, 1.25rem)",
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none", // Allows clicks through the empty space around the dock
        padding: "0 1rem",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <Dock>
          {NAV_ITEMS.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <DockItem
                key={item.href}
                href={item.href}
                isActive={isActive}
                mouseX={undefined as any} // Injected by Dock parent cloneElement
                ariaLabel={`Navigate to ${item.label}`}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(0.62rem, 1.4vw, 0.74rem)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </span>
              </DockItem>
            );
          })}
        </Dock>
      </div>
    </motion.header>
  );
}
