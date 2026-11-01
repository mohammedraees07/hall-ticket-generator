import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET() {
  try {
    const summary = await dataStore.getDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard summary" }, { status: 500 });
  }
}
