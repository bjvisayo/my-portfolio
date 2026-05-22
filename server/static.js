import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { config } from "./config.js";
import { sendText } from "./http.js";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

export async function serveStatic(pathname, response) {
  if (pathname.startsWith("/uploads/")) {
    return serveUpload(pathname, response);
  }

  const requested = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(config.distDir, safePath);

  if (!filePath.startsWith(config.distDir)) return sendText(response, 403, "Forbidden");

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
      return;
    }
  } catch {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(join(config.distDir, "index.html")).pipe(response);
  }
}

async function serveUpload(pathname, response) {
  const safePath = normalize(pathname.replace(/^\/uploads\//, "")).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(config.uploadsDir, safePath);

  if (!filePath.startsWith(config.uploadsDir)) return sendText(response, 403, "Forbidden");

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
      return;
    }
  } catch {
    return sendText(response, 404, "Not found");
  }
}
