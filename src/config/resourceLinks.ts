/**
 * RESOURCE_LINKS — All external URLs in one place
 * ─────────────────────────────────────────────────────────────────────────────
 * How to activate a link:
 *   1. Replace the placeholder `url` with the real URL.
 *   2. Set `available: true`.
 *   The UI updates automatically — no component edits needed.
 *
 * Developer quick-reference:
 *   Manual URL         → manual.url
 *   Repository URLs    → repositories[n].url
 *   Registration URL   → registration.url
 *   XP param name      → registration.xpQueryParam
 *   Visit counter API  → visitCounter.endpoint
 */

export const RESOURCE_LINKS = {
  manual: {
    title: "MUI 2026 Event Manual",
    description:
      "Everything you need to know — schedule, challenges, judging criteria, and team guidelines.",
    /** Replace with the actual PDF/page URL when available. */
    url: "https://drive.google.com/file/d/1DK1hnZZTxbWDXQk9AYPbPzkUb4XE8JpE/view?usp=drivesdk",
    available: true,
  },

  repositories: [
    {
      id: "starter-kit",
      label: "Starter Kit Repository",
      description: "Base project template and boilerplate for the event.",
      url: "#",
      available: false,
    },
    {
      id: "design-resources",
      label: "Design Resources",
      description: "Figma files, asset packs, and style guides.",
      url: "#",
      available: false,
    },
  ],

  registration: {
    title: "Register for MasterChef UI",
    description:
      "Claim your place in the event. Bring your XP and your ideas.",
    /** Replace with the actual external registration URL when available. */
    url: "#",
    available: false,

    /**
     * XP query parameter name.
     * If the external registration system supports passing XP via query string,
     * set the confirmed parameter name here.
     *
     * Example: if the URL should be "https://register.example.com/?xp=850"
     * set xpQueryParam to "xp".
     *
     * Leave as null until the registration system confirms the parameter name.
     * Do NOT invent the parameter name.
     */
    xpQueryParam: null as string | null,
  },

  visitCounter: {
    /**
     * API endpoint for the real page visit counter.
     *
     * Set to a real URL to enable the live counter.
     * While null, the counter UI shows a neutral "—" placeholder.
     *
     * The endpoint should respond with JSON: { count: number }
     */
    endpoint: null as string | null,
  },
} as const;

export type ResourceLinks = typeof RESOURCE_LINKS;
