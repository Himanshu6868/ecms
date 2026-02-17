import { env } from "@/lib/env";
import { supabase } from "@/lib/db";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const ticketUploadConfig = {
  maxFileBytes: env.TICKET_UPLOAD_MAX_BYTES,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  bucket: env.SUPABASE_STORAGE_BUCKET,
} as const;

const INVALID_FILE_CHARS = /[^a-zA-Z0-9._-]/g;

export function sanitizeFileName(original: string): string {
  const trimmed = original.trim().replaceAll(" ", "_");
  const cleaned = trimmed.replace(INVALID_FILE_CHARS, "").replace(/_+/g, "_");
  const parts = cleaned.split(".");
  if (parts.length === 1) {
    return cleaned.slice(0, 80) || "file";
  }
  const extension = parts.pop()?.toLowerCase() ?? "";
  const stem = parts.join(".").slice(0, 72) || "file";
  return `${stem}.${extension}`;
}

export function assertUploadableFile(file: File): void {
  if (!ticketUploadConfig.allowedMimeTypes.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.name}`);
  }
  if (file.size > ticketUploadConfig.maxFileBytes) {
    throw new Error(`File exceeds ${Math.floor(ticketUploadConfig.maxFileBytes / (1024 * 1024))}MB limit: ${file.name}`);
  }
}

export function buildObjectKey(ticketId: string, originalName: string): string {
  const safeName = sanitizeFileName(originalName);
  const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
  const base = safeName.replace(/\.[^./]+$/, "");
  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  return `tickets/${ticketId}/${base}-${uniqueSuffix}.${ext}`;
}

export async function uploadTicketFile(ticketId: string, file: File): Promise<{ objectKey: string; signedUrl: string }> {
  assertUploadableFile(file);

  const objectKey = buildObjectKey(ticketId, file.name);
  const uploadResult = await supabase.storage
    .from(ticketUploadConfig.bucket)
    .upload(objectKey, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadResult.error) {
    throw new Error(`Upload failed for ${file.name}: ${uploadResult.error.message}`);
  }

  const signedResult = await supabase.storage
    .from(ticketUploadConfig.bucket)
    .createSignedUrl(objectKey, env.TICKET_UPLOAD_SIGNED_URL_TTL_SECONDS);

  if (signedResult.error) {
    throw new Error(`Failed to generate signed URL for ${file.name}: ${signedResult.error.message}`);
  }

  return { objectKey, signedUrl: signedResult.data.signedUrl };
}

export async function createSignedTicketObjectUrl(objectKey: string): Promise<string> {
  const signedResult = await supabase.storage
    .from(ticketUploadConfig.bucket)
    .createSignedUrl(objectKey, env.TICKET_UPLOAD_SIGNED_URL_TTL_SECONDS);

  if (signedResult.error) {
    return "";
  }

  return signedResult.data.signedUrl;
}

export async function removeUploadedTicketFiles(objectKeys: string[]): Promise<void> {
  if (!objectKeys.length) {
    return;
  }
  await supabase.storage.from(ticketUploadConfig.bucket).remove(objectKeys);
}
