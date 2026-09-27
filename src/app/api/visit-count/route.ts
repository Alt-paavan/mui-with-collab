import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/visit-count
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure server-side route handler that fetches cumulative page visits
 * from the official Vercel Web Analytics API.
 *
 * Requirements (set in .env.local or Vercel Environment Variables):
 *   - ANALYTICS_TOKEN    : Vercel Access Token (Bearer) — avoid VERCEL_ prefix
 *   - VERCEL_PROJECT_ID      : Vercel Project ID (e.g. prj_...)
 *   - VERCEL_TEAM_ID         : Optional Vercel Team ID (if team-owned)
 */
/** Base count offset — displayed count = BASE_COUNT + live Vercel total */
const BASE_COUNT = 100;

export async function GET() {
  const token = process.env.ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: "Visit counter service is not configured." },
      { status: 503 }
    );
  }

  try {
    const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
    url.searchParams.set("projectId", projectId);
    if (teamId) {
      url.searchParams.set("teamId", teamId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: "Unable to retrieve analytics data.", status: response.status, detail: errBody },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();

    // DEBUG — remove after inspecting
    return NextResponse.json({ debug_raw: data });
  } catch {
    return NextResponse.json(
      { error: "Internal error processing visit count." },
      { status: 500 }
    );
  }
}
