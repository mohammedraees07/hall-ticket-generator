import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    // RBAC: Candidate or Staff/Admin can upload passport images
    const roleCheck = assertRole(auth, ["ADMIN", "STAFF", "STUDENT"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Unauthorized to upload media", 403);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const purpose = formData.get("purpose") as string | null;

    if (!file) {
      throw new ApiError("No file provided for upload", 400);
    }
    if (purpose !== "photo" && purpose !== "receipt") {
      throw new ApiError("Upload purpose must be photo or receipt", 400);
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (file.type && !validTypes.includes(file.type)) {
      throw new ApiError("Invalid file format. Allowed formats: JPEG, PNG, WebP", 400);
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError("File size exceeds 5MB limit", 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase credentials are configured, upload to Supabase Storage S3
    if (supabaseUrl && supabaseKey) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
      const fileName = `${auth!.id}/${purpose}/${crypto.randomUUID()}.${extension}`;
      const bucket = "candidate-documents";

      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type || "image/jpeg",
        },
        body: buffer,
      });

      if (uploadRes.ok) {
        const signedUrlResponse = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${fileName}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ expiresIn: 3600 }),
        });
        if (!signedUrlResponse.ok) throw new ApiError("Upload succeeded but a secure file URL could not be created", 502);
        const signed = await signedUrlResponse.json() as { signedURL?: string };
        if (!signed.signedURL) throw new ApiError("Upload succeeded but storage returned no secure URL", 502);
        return NextResponse.json({ url: `${supabaseUrl}/storage/v1${signed.signedURL}`, fileName });
      }
    }

    throw new ApiError("Document storage is not configured", 503);
  } catch (error) {
    return handleApiError(error);
  }
}
