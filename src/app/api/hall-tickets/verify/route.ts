import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { verifyTicketSchema } from "@/lib/validation/hall-ticket.schema";
import { handleApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || "";

    const validated = verifyTicketSchema.parse({ code });
    const result = await dataStore.verifyHallTicket(validated.code);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
