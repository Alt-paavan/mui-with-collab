import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/visit-count
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure server-side route handler that fetches cumulative page visits
 * from the official Vercel Web Analytics API.
 *
 * Requirements (set in .env.local or Vercel Environment Variables):
 *   - VERCEL_ANALYTICS_TOKEN : Vercel Access Token (Bearer)
 *   - VERCEL_PROJECT_ID      : Vercel Project ID (e.g. prj_...)
 *   - VERCEL_TEAM_ID         : Optional Vercel Team ID (if team-owned)
 */
export async function GET() {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
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
      return NextResponse.json(
        { error: "Unable to retrieve analytics data." },
        { status: response.status }
      );
    }

    const data: { total?: number } = await response.json();

    if (typeof data.total !== "number") {
      return NextResponse.json(
        { error: "Invalid analytics response structure." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { count: data.total },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal error processing visit count." },
      { status: 500 }
    );
  }
}
