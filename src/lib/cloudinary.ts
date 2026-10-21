import { v2 as cloudinary } from "cloudinary";
import { cloudinaryEnv } from "@/lib/env";

let configured = false;

function configure() {
  if (configured) return true;
  if (!cloudinaryEnv.cloudName || !cloudinaryEnv.apiKey || !cloudinaryEnv.apiSecret) return false;
  cloudinary.config({
    cloud_name: cloudinaryEnv.cloudName,
    api_key: cloudinaryEnv.apiKey,
    api_secret: cloudinaryEnv.apiSecret,
    secure: true,
  });
  configured = true;
  return true;
}

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/** Server-only. Produces the short-lived signature a Studio upload uses. */
export function signUpload(): SignedUpload | null {
  if (!configure()) return null;
  const timestamp = Math.round(Date.now() / 1000);
  const folder = cloudinaryEnv.uploadFolder!;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    cloudinaryEnv.apiSecret!,
  );
  return {
    cloudName: cloudinaryEnv.cloudName!,
    apiKey: cloudinaryEnv.apiKey!,
    timestamp,
    signature,
    folder,
  };
}

/**
 * Delivery URL for a stored public id. When Cloudinary is not configured we
 * fall back to the local product image so the storefront never links to a
 * broken remote asset.
 */
export function imageUrl(publicId: string | undefined, fallback: string, width = 1400): string {
  if (!publicId || !cloudinaryEnv.cloudName) return fallback;
  return `https://res.cloudinary.com/${cloudinaryEnv.cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.apiKey && cloudinaryEnv.apiSecret);
}
