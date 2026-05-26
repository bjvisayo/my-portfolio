import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import crypto from "node:crypto";
import { config } from "./config.js";

const extensionByType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function storeProjectImage({ projectId, fileName, contentType, data }) {
  if (!config.allowedProjectImageTypes.includes(contentType)) {
    return { ok: false, error: "Unsupported image type. Use JPG, PNG, or WebP." };
  }

  const buffer = Buffer.from(data, "base64");
  const maxBytes = config.maxProjectImageMb * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return { ok: false, error: `Image is too large. Maximum is ${config.maxProjectImageMb}MB.` };
  }

  const extension = extensionByType[contentType] || extname(fileName) || ".jpg";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const storagePath = `projects/${projectId}/${safeName}`;

  if (config.storageDriver === "supabase") {
    const result = await uploadToSupabase(storagePath, contentType, buffer);
    return { ok: true, url: result.url, storagePath };
  }

  const uploadDir = join(config.uploadsDir, "project-images", "projects", projectId);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, safeName), buffer);
  return { ok: true, url: `/uploads/project-images/${storagePath}`, storagePath };
}

async function uploadToSupabase(storagePath, contentType, buffer) {
  if (!config.isSupabaseConfigured) {
    throw new Error("Supabase storage selected but Supabase credentials are missing");
  }

  const response = await fetch(`${config.supabaseUrl}/storage/v1/object/${config.supabaseProjectImagesBucket}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`Supabase image upload failed: ${response.status} ${await response.text()}`);
  }

  return {
    url: getProjectImageProxyUrl(storagePath),
  };
}

export async function getProjectImageObject(storagePath) {
  if (!config.isSupabaseConfigured) {
    throw new Error("Supabase image delivery requires Supabase credentials");
  }

  const response = await fetch(`${config.supabaseUrl}/storage/v1/object/${config.supabaseProjectImagesBucket}/${encodeStoragePath(storagePath)}`, {
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase image fetch failed: ${response.status} ${await response.text()}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "application/octet-stream",
  };
}

export function getProjectImageProxyUrl(storagePath) {
  return `/api/project-images?path=${encodeURIComponent(storagePath)}`;
}

function encodeStoragePath(storagePath) {
  return String(storagePath).split("/").map(encodeURIComponent).join("/");
}
