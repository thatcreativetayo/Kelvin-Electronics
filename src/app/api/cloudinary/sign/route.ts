import { NextResponse } from "next/server";
import { isCloudinaryConfigured, signUpload } from "@/lib/cloudinary";
import { cloudinaryEnv } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Signed Cloudinary upload for the Sanity Studio media input.
 *
 * The Studio sends the operator-provisioned CLOUDINARY_UPLOAD_TOKEN header.
 * The API secret never leaves the server; only a short-lived signature does.
 *
 * Production note: replace the shared token with a check against a Sanity
 * project member (a serverless function that verifies the editor's session).
 * The token is scoped to uploads only — it cannot delete or administer assets.
 */
export async function POST(request: Request) {
  const token = request.headers.get("x-upload-token");
  const expected = process.env.CLOUDINARY_UPLOAD_TOKEN?.trim();

  if (!expected) {
    return NextResponse.json(
      {
        error: "integration_not_configured",
        message: "Set CLOUDINARY_UPLOAD_TOKEN on the server to enable signed uploads.",
        missing: ["CLOUDINARY_UPLOAD_TOKEN"],
      },
      { status: 501 },
    );
  }

  if (!token || token !== expected) {
    return NextResponse.json({ error: "unauthorized", message: "Upload token is missing or invalid." }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error: "integration_not_configured",
        message: "Cloudinary credentials are incomplete.",
        missing: ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
        folder: cloudinaryEnv.uploadFolder,
      },
      { status: 501 },
    );
  }

  const signature = signUpload();
  if (!signature) {
    return NextResponse.json({ error: "sign_failed", message: "Could not sign the upload." }, { status: 500 });
  }

  return NextResponse.json(signature, { headers: { "cache-control": "no-store" } });
}
