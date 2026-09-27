/**
 * RESOURCE_LINKS — All external URLs in one place
 * ─────────────────────────────────────────────────────────────────────────────
 * How to activate a link:
 *   1. Replace the placeholder `url` with the real URL.
 *   2. Set `available: true`.
 *   The UI updates automatically — no component edits needed.
 *
 * Developer quick-reference:
 *   Manual poster      → manual.poster
 *   Manual download    → manual.downloadUrl / manual.downloadFilename
 *   Registration URL   → registration.url
 *   XP param name      → registration.xpQueryParam
 *   Visit counter API  → visitCounter.endpoint
 */

export const RESOURCE_LINKS = {
  manual: {
    title: "A Guide to Install Malware on My Friends PC",
    description:
      "Official Event Guide & Manual authored by Team GDGC.",
    /** Centralized poster image path — update this one value to change the poster */
    poster: "/assets/manual-poster.jpeg",
    /** Centralized manual download path */
    downloadUrl: "/assets/a-guide-to-install-malware-on-my-friends-pc.pdf",
    /** Downloaded file name */
    downloadFilename: "a-guide-to-install-malware-on-my-friends-pc.pdf",
    available: true,
  },

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
    endpoint: "/api/visit-count" as string | null,
  },
} as const;

export type ResourceLinks = typeof RESOURCE_LINKS;
