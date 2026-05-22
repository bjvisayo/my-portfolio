import { createServer } from "node:http";
import { config } from "./server/config.js";
import { isAuthorized, unauthorized } from "./server/auth.js";
import { createLead, deleteLead, exportLeadsCsv, getLead, listLeads, updateLead } from "./server/leadsService.js";
import { createProject, deleteProject, deleteProjectImage, listProjects, updateProject, uploadProjectImage } from "./server/projectsService.js";
import { readJson, sendJson } from "./server/http.js";
import { serveStatic } from "./server/static.js";

const rateLimit = new Map();

createServer(async (request, response) => {
  setSecurityHeaders(response);

  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return sendJson(response, 200, {
        ok: true,
        service: "xander-kreativ-backend",
        storage: config.storageDriver,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/api/leads" && request.method === "POST") {
      if (!allowPublicSubmission(request)) {
        return sendJson(response, 429, { error: "Too many submissions. Please try again shortly." });
      }

      const body = await readJson(request);
      const result = await createLead(body);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (url.pathname === "/api/projects" && request.method === "GET") {
      const result = await listProjects({ featuredOnly: url.searchParams.get("featured") === "true" });
      return sendJson(response, 200, result);
    }

    if (url.pathname === "/api/admin/projects" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await listProjects({ admin: true });
      return sendJson(response, 200, result);
    }

    if (url.pathname === "/api/admin/projects" && request.method === "POST") {
      if (!isAuthorized(request)) return unauthorized(response);
      const body = await readJson(request);
      const result = await createProject(body);
      return sendJson(response, result.statusCode, result.payload);
    }

    const projectImageMatch = url.pathname.match(/^\/api\/admin\/projects\/([a-zA-Z0-9-]+)\/images(?:\/([a-zA-Z0-9-]+))?$/);
    if (projectImageMatch && request.method === "POST") {
      if (!isAuthorized(request)) return unauthorized(response);
      const body = await readJson(request);
      const result = await uploadProjectImage(projectImageMatch[1], body);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (projectImageMatch && projectImageMatch[2] && request.method === "DELETE") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await deleteProjectImage(projectImageMatch[1], projectImageMatch[2]);
      return sendJson(response, result.statusCode, result.payload);
    }

    const projectMatch = url.pathname.match(/^\/api\/admin\/projects\/([a-zA-Z0-9-]+)$/);
    if (projectMatch && request.method === "PATCH") {
      if (!isAuthorized(request)) return unauthorized(response);
      const body = await readJson(request);
      const result = await updateProject(projectMatch[1], body);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (projectMatch && request.method === "DELETE") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await deleteProject(projectMatch[1]);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (url.pathname === "/api/leads" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await listLeads(Object.fromEntries(url.searchParams.entries()));
      return sendJson(response, 200, result);
    }

    if (url.pathname === "/api/leads/export.csv" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      const csv = await exportLeadsCsv();
      response.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"xander-kreativ-leads.csv\"",
      });
      response.end(csv);
      return;
    }

    const leadMatch = url.pathname.match(/^\/api\/leads\/([a-zA-Z0-9-]+)$/);
    if (leadMatch && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await getLead(leadMatch[1]);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (leadMatch && request.method === "PATCH") {
      if (!isAuthorized(request)) return unauthorized(response);
      const body = await readJson(request);
      const result = await updateLead(leadMatch[1], body);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (leadMatch && request.method === "DELETE") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await deleteLead(leadMatch[1]);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (url.pathname.startsWith("/api/")) {
      return sendJson(response, 404, { error: "API route not found" });
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    const message = config.isProduction ? "Server error" : error.message;
    console.error(error);
    return sendJson(response, error.statusCode || 500, { error: message });
  }
}).listen(config.port, () => {
  console.log(`Xander Kreativ server running at http://127.0.0.1:${config.port}`);
  console.log(`Admin dashboard: http://127.0.0.1:${config.port}/admin`);
  if (config.usesDefaultAdminCredentials) {
    console.warn("Using default admin credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD before deployment.");
  }
});

function allowPublicSubmission(request) {
  const forwarded = request.headers["x-forwarded-for"];
  const ip = String(forwarded || request.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 5;
  const bucket = rateLimit.get(ip) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  rateLimit.set(ip, recent);
  return recent.length <= maxRequests;
}

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}
