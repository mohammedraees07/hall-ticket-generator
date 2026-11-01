import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await dataStore.getHallTicketById(Number(id));
    if (!ticket) {
      return NextResponse.json({ error: "Hall ticket not found" }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Get hall ticket error:", error);
    return NextResponse.json({ error: "Failed to get hall ticket" }, { status: 500 });
  }
}
