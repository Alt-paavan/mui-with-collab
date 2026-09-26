"use client";

/**
 * MagneticDock Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive dock with magnetic cursor proximity scaling powered by framer-motion.
 *
 * Physics:
 *   - Tracks mouse X coordinate relative to the dock container.
 *   - Calculates distance to each item's center.
 *   - Applies a smooth spring transformation to width/scale of nearby items.
 *   - Separates Normal, Hover, and Active (current section) states cleanly.
 *   - Blurs on pointer release to avoid sticky click focus.
 */

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

interface DockProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface DockItemProps {
  children: React.ReactNode;
  mouseX: MotionValue<number>;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export function Dock({ children, style }: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "clamp(0.4rem, 1.2vw, 0.85rem)",
        padding: "0.35rem 0.75rem",
        background: "rgba(12, 1, 1, 0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(220, 38, 38, 0.22)",
        borderRadius: "9999px",
        boxShadow: "0 0 25px rgba(220, 38, 38, 0.12), 0 4px 20px rgba(0, 0, 0, 0.7)",
        ...style,
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<any>(child)) {
          return React.cloneElement(child, { mouseX });
        }
        return child;
      })}
    </motion.nav>
  );
}

export function DockItem({
  children,
  mouseX,
  href,
  isActive = false,
  onClick,
  ariaLabel,
}: DockItemProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale curve: peaks at center (scale ~ 1.22), drops off at distance > 140px
  const scaleSync = useTransform(distance, [-140, 0, 140], [1, 1.22, 1]);
  const scale = useSpring(scaleSync, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Release focus so the item does not retain click focus styles when the mouse leaves
    e.currentTarget.blur();
    onClick?.();
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={handleClick}
      onPointerUp={(e) => (e.currentTarget as HTMLElement).blur()}
      style={{
        scale,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.4rem clamp(0.55rem, 1.5vw, 0.95rem)",
        borderRadius: "9999px",
        textDecoration: "none",
        // Distinct Normal vs Active text colors
        color: isActive
          ? "var(--color-reality-primary)"
          : "rgba(252, 165, 165, 0.55)",
        // Background remains transparent in Normal & Active states (no stuck hover background)
        background: "transparent",
        border: "1px solid transparent",
        transition: "color 0.2s ease, background-color 0.2s ease",
        outline: "none",
        userSelect: "none",
      }}
      whileHover={{
        color: "#ffffff",
        backgroundColor: "rgba(220, 38, 38, 0.16)",
      }}
      whileFocus={{
        boxShadow: "0 0 0 2px var(--color-reality-primary)",
      }}
      aria-label={ariaLabel}
      aria-current={isActive ? "location" : undefined}
    >
      {children}

      {/* Active section dot indicator */}
      {isActive && (
        <motion.span
          layoutId="active-indicator"
          style={{
            position: "absolute",
            bottom: "3px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "var(--color-reality-primary)",
            boxShadow: "0 0 6px var(--color-reality-primary)",
          }}
        />
      )}
    </motion.a>
  );
}
