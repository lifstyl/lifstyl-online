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

  // Local-dev fallback.
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), bytes);
  return `/uploads/${key}`;
}

export function isImageFile(file: unknown): file is File {
  return file instanceof File && file.size > 0 && file.type.startsWith("image/");
}
