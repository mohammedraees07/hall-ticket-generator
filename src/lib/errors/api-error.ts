import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleApiError(error: unknown): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";

  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const formatted = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return NextResponse.json(
      {
        error: "Validation failed",
        statusCode: 422,
        issues: formatted,
        ...(isDev ? { stack: error.stack } : {}),
      },
      { status: 422 }
    );
  }

  // 2. Custom Handled API Errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        statusCode: error.statusCode,
        ...(error.details ? { details: error.details } : {}),
        ...(isDev ? { stack: error.stack } : {}),
      },
      { status: error.statusCode }
    );
  }

  // 3. Generic / Uncaught Server Errors
  const genericMessage = isDev && error instanceof Error ? error.message : "Internal server error";
  const stack = isDev && error instanceof Error ? error.stack : undefined;

  console.error("[API_ERROR_HANDLER]:", error);

  return NextResponse.json(
    {
      error: genericMessage,
      statusCode: 500,
      ...(stack ? { stack } : {}),
    },
    { status: 500 }
  );
}
