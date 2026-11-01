import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { collegeSettingsSchema } from "@/lib/validation/settings.schema";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";

export async function GET() {
  try {
    const settings = await dataStore.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const roleCheck = assertRole(auth, ["ADMIN"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden: Only administrators can update settings", 403);
    }

    const body = await req.json();
    const validated = collegeSettingsSchema.partial().parse(body);

    const updated = await dataStore.updateSettings(validated);
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

