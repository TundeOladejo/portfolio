/**
 * Cloudinary configuration and utilities.
 *
 * Uses Cloudinary's REST API directly — no SDK required.
 * All secrets stay server-side; the browser only receives a short-lived
 * signed upload signature.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME   — your cloud name
 *   CLOUDINARY_API_KEY      — your API key (safe to expose; not a secret)
 *   CLOUDINARY_API_SECRET   — your API secret (NEVER expose to the browser)
 *
 * No upload preset needed — we use signed uploads, which are authorized
 * by the server-generated signature rather than a preset.
 */

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

/**
 * Generates a signed upload signature for a direct browser-to-Cloudinary upload.
 *
 * Cloudinary's signing algorithm:
 *   1. Collect all upload params (excluding api_key, file, resource_type)
 *   2. Sort them alphabetically by key
 *   3. Join as "key=value&key=value"
 *   4. Append the API secret: "key=value&...API_SECRET"
 *   5. SHA-1 hash the resulting string
 *
 * The signature is sent to the browser. The browser includes it in the
 * FormData upload — Cloudinary verifies it server-side. The API secret
 * never leaves the server.
 *
 * @param folder  Cloudinary folder to upload into (e.g. 'covers', 'sections')
 */
export async function generateUploadSignature(folder: string): Promise<{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}> {
  const timestamp = Math.round(Date.now() / 1000);

  // All params that will be sent with the upload request (excluding api_key, file, resource_type)
  const params: Record<string, string | number> = {
    folder,
    timestamp,
  };

  // Step 1: Sort params alphabetically and build the string to sign
  const paramsString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  // Step 2: Append API secret (no separator — this is Cloudinary's spec)
  const stringToSign = paramsString + CLOUDINARY_API_SECRET;

  // Step 3: SHA-1 hash using Web Crypto API
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(stringToSign));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

/**
 * Applies Cloudinary URL transformations for automatic optimization.
 *
 * Inserts f_auto (auto format → WebP/AVIF) and q_auto (auto quality)
 * into the URL. These are free on all Cloudinary plans.
 *
 * Example:
 *   https://res.cloudinary.com/cloud/image/upload/v123/covers/photo.jpg
 *   → https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto/v123/covers/photo.jpg
 */
export function optimizeCloudinaryUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  }
): string {
  if (!url.includes('res.cloudinary.com')) return url;
  // Don't double-apply transformations
  if (url.includes('f_auto')) return url;

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
