"use client";

/**
 * Campaign State Machine — Complete Continuous Flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 1 (snap):
 *   SnapReveal — full-viewport reality collapse opening
 *
 * Phase 2 & 3 (Continuous Single-Page Scroll):
 *   InfiniteTendrilsCanvas (subtle ambient background fluid converging to Registration)
 *   CampaignNav (fixed top magnetic dock)
 *   FloatingLiveCount (fixed bottom-right live counter)
 *   ClubEventHeader
 *   GameRules
 *   MiniGame (loaded on page open)
 *   GameResult (Score & XP)
 *   ManualSection
 *   RegistrationCTA (with Reality Stone formation & background illumination)
 *   FooterVisitCounter (bottom page count)
 *
 * Score → XP flow:
 *   MiniGame ──onGameComplete(score)──► scoreToXP() in siteConfig.ts ──► xp state
 *   xp is passed to RegistrationCTA & GameResult
 */

import { useState, useEffect } from "react";

// Phase 1
import { SnapReveal } from "@/components/campaign/SnapReveal";

// Phase 2
import { CampaignNav }            from "@/components/campaign/CampaignNav";
import { ClubEventHeader }        from "@/components/campaign/ClubEventHeader";
import { GameRules }              from "@/components/campaign/GameRules";
import { LightReveal }            from "@/components/campaign/LightReveal";
import { MiniGame }               from "@/components/game/MiniGame";
import { GameResult }             from "@/components/campaign/GameResult";

// Phase 3 & Visual Additions
import { ManualSection }           from "@/components/campaign/ManualSection";
import { XPUnlockGuideCTA }         from "@/components/campaign/XPUnlockGuideCTA";
import { RegistrationCTA }         from "@/components/campaign/RegistrationCTA";
import { FooterVisitCounter }       from "@/components/campaign/FooterVisitCounter";
import { FloatingLiveCount }       from "@/components/campaign/FloatingLiveCount";
import { InfiniteTendrilsCanvas }  from "@/components/campaign/InfiniteTendrilsCanvas";

import type { GameCompletePayload } from "@/components/game/MiniGame";
import { scoreToXP } from "@/config/siteConfig";

type CampaignPhase = "snap" | "active";

export default function Home() {
  const [phase, setPhase] = useState<CampaignPhase>("snap");

  const [score, setScore] = useState(0);
  const [xp,    setXp]    = useState(0);

  /**
   * Light show: shown once when phase becomes "active".
   * Auto-unmounts after 1600ms (animation is 1400ms + 200ms fade buffer).
   */
  const [showLightReveal, setShowLightReveal] = useState(false);

  useEffect(() => {
    if (phase === "active") {
      setShowLightReveal(true);
      const t = setTimeout(() => setShowLightReveal(false), 1600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /** Called by MiniGame when player finishes 2 attempts — updates score & XP */
  const handleGameComplete = (payload: GameCompletePayload) => {
    setScore(payload.score);
    setXp(payload.xp);
  };

  const isPhase2OrLater = phase !== "snap";


  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-reality-base)",
        paddingTop: isPhase2OrLater ? "48px" : 0,
        position: "relative",
      }}
    >
      {/* ── Phase 1 — Reality snap. Unmounts completely after transition. ── */}
      {phase === "snap" && (
        <SnapReveal onTransitionComplete={() => setPhase("active")} />
      )}

      {/* ── Phase 2 & 3 — Continuous scrolling experience ─────────────── */}
      {isPhase2OrLater && (
        <>
          {/* Ambient Infinite Tendrils Canvas — full page background fluid */}
          <InfiniteTendrilsCanvas />

          {/* Floating Magnetic Dock Nav — anchors to all sections, fixed top */}
          <CampaignNav />

          {/* Floating live count — persistent at bottom-right */}
          <FloatingLiveCount />

          {/* Persistent ambient atmosphere base layer */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              background:
                "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(55,3,3,0.28) 0%, transparent 65%)",
            }}
          />

          {/* All sections in a single continuous scrolling layout */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Light show — fires once on page entry, auto-unmounts after 1.6s */}
            {showLightReveal && <LightReveal />}

            {/* Game rules — displayed directly below the light show */}
            <GameRules />

            {/* Mini-game — pre-loaded and ready */}
            <MiniGame onGameComplete={handleGameComplete} />

            {/* Score + XP result section */}
            <GameResult score={score} xp={xp} />

            {/* Club + Event identity (Moved immediately after Score / Result) */}
            <ClubEventHeader />

            {/* Earn XP & Unlock Free Guide CTA with button to #manual */}
            <XPUnlockGuideCTA />

            {/* Event manual / free guide section */}
            <ManualSection />

            {/* External registration CTA with Reality Stone crystallization */}
            <RegistrationCTA xp={xp} />

            {/* Page visit counter & footer */}
            <FooterVisitCounter />
          </div>
        </>
      )}
    </main>
  );
}
