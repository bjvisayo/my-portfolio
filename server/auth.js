import crypto from "node:crypto";
import { config } from "./config.js";

export function isAuthorized(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.replace("Basic ", ""), "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  return secureCompare(username, config.adminUsername) && secureCompare(password, config.adminPassword);
}

export function unauthorized(response) {
  response.writeHead(401, {
    "Content-Type": "application/json; charset=utf-8",
    "WWW-Authenticate": "Basic realm=\"Xander Kreativ Admin\"",
  });
  response.end(JSON.stringify({ error: "Unauthorized" }));
}

function secureCompare(value, expected) {
  const valueBuffer = Buffer.from(String(value));
  const expectedBuffer = Buffer.from(String(expected));
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}
