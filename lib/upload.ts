import "server-only";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Save an uploaded image and return its public URL.
 *
 *  • Production (Vercel): uses Vercel Blob (BLOB_READ_WRITE_TOKEN present).
 *  • Local dev without a Blob token: falls back to writing into
 *    /public/uploads so the whole flow can be verified offline. Vercel's
 *    filesystem is read-only, so the Blob path is required there.
 */
export async function saveImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const key = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`lifstyl/${key}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // `VERCEL` is set on every Vercel deployment (prod, preview, and `vercel dev`).
  // Its filesystem is read-only outside /tmp, so the disk fallback below would
  // fail there with a confusing ENOENT — fail loudly instead with the actual fix.
  if (process.env.VERCEL) {
    throw new Error(
      "Image upload failed: BLOB_READ_WRITE_TOKEN is not set. In the Vercel " +
        "dashboard, connect a Blob store to this project (Storage tab) and " +
        "redeploy — env var changes only take effect on the next deployment."
    );
  }

  // Local-dev fallback (no Blob token configured locally).
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), bytes);
  return `/uploads/${key}`;
}

export function isImageFile(file: unknown): file is File {
  return file instanceof File && file.size > 0 && file.type.startsWith("image/");
}
