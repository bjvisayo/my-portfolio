import { config } from "./config.js";
import { isAuthorized, unauthorized } from "./auth.js";
import { createLead, deleteLead, exportLeadsCsv, getLead, listLeads, updateLead } from "./leadsService.js";
import { createProject, deleteProject, deleteProjectImage, listProjects, updateProject, uploadProjectImage } from "./projectsService.js";
import { readJson, sendJson } from "./http.js";

const rateLimit = new Map();

export async function handleApiRequest(request, response) {
  setSecurityHeaders(response);

  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

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
      const result = await createLead(await readJson(request));
      return sendJson(response, result.statusCode, result.payload);
    }

    if (url.pathname === "/api/projects" && request.method === "GET") {
      const result = await listProjects({ featuredOnly: url.searchParams.get("featured") === "true" });
      return sendJson(response, 200, result);
    }

    if (url.pathname === "/api/admin/projects" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      return sendJson(response, 200, await listProjects({ admin: true }));
    }

    if (url.pathname === "/api/admin/projects" && request.method === "POST") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await createProject(await readJson(request));
      return sendJson(response, result.statusCode, result.payload);
    }

    const projectImageMatch = url.pathname.match(/^\/api\/admin\/projects\/([a-zA-Z0-9-]+)\/images(?:\/([a-zA-Z0-9-]+))?$/);
    if (projectImageMatch && request.method === "POST") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await uploadProjectImage(projectImageMatch[1], await readJson(request));
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
      const result = await updateProject(projectMatch[1], await readJson(request));
      return sendJson(response, result.statusCode, result.payload);
    }

    if (projectMatch && request.method === "DELETE") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await deleteProject(projectMatch[1]);
      return sendJson(response, result.statusCode, result.payload);
    }

    if (url.pathname === "/api/leads" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      return sendJson(response, 200, await listLeads(Object.fromEntries(url.searchParams.entries())));
    }

    if (url.pathname === "/api/leads/export.csv" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      response.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"xander-kreativ-leads.csv\"",
      });
      response.end(await exportLeadsCsv());
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
      const result = await updateLead(leadMatch[1], await readJson(request));
      return sendJson(response, result.statusCode, result.payload);
    }

    if (leadMatch && request.method === "DELETE") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await deleteLead(leadMatch[1]);
      return sendJson(response, result.statusCode, result.payload);
    }

    return sendJson(response, 404, { error: "API route not found" });
  } catch (error) {
    console.error(error);
    return sendJson(response, error.statusCode || 500, { error: config.isProduction ? "Server error" : error.message });
  }
}

function allowPublicSubmission(request) {
  const forwarded = request.headers["x-forwarded-for"];
  const ip = String(forwarded || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (rateLimit.get(ip) || []).filter((timestamp) => now - timestamp < 60_000);
  recent.push(now);
  rateLimit.set(ip, recent);
  return recent.length <= 5;
}

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}
