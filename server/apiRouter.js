import { config } from "./config.js";
import { isAuthorized, unauthorized } from "./auth.js";
import { createLead, deleteLead, exportLeadsCsv, getLead, listLeads, updateLead } from "./leadsService.js";
import { createProject, deleteProject, deleteProjectImage, listProjects, updateProject, uploadProjectImage } from "./projectsService.js";
import { getProjectImageObject } from "./projectImages.js";
import { sendAdminTestEmail } from "./mailer.js";
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
        requestedStorage: config.requestedStorageDriver,
        supabaseConfigured: config.isSupabaseConfigured,
        tables: {
          leads: config.supabaseLeadsTable,
          projects: config.supabaseProjectsTable,
          projectImages: config.supabaseProjectImagesTable,
        },
        projectImagesBucket: config.supabaseProjectImagesBucket,
        mailConfigured: config.isMailConfigured,
        mail: config.mailDiagnostics,
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
      response.setHeader("Cache-Control", "no-store");
      return sendJson(response, 200, result);
    }

    if (url.pathname === "/api/project-images" && request.method === "GET") {
      const storagePath = url.searchParams.get("path");
      if (!storagePath) return sendJson(response, 400, { error: "Missing project image path" });
      const image = await getProjectImageObject(storagePath);
      response.writeHead(200, {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      response.end(image.buffer);
      return;
    }

    if (url.pathname === "/api/admin/projects" && request.method === "GET") {
      if (!isAuthorized(request)) return unauthorized(response);
      response.setHeader("Cache-Control", "no-store");
      return sendJson(response, 200, await listProjects({ admin: true }));
    }

    if (url.pathname === "/api/admin/mail-test" && request.method === "POST") {
      if (!isAuthorized(request)) return unauthorized(response);
      const result = await sendAdminTestEmail();
      return sendJson(response, result.statusCode, result.payload);
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
    return sendJson(response, error.statusCode || 500, { error: getPublicErrorMessage(error) });
  }
}

function getPublicErrorMessage(error) {
  const message = error?.message || "Server error";
  const safePrefixes = [
    "Supabase request failed:",
    "Supabase image upload failed:",
    "Supabase selected",
    "Supabase storage selected",
    "Resend email failed:",
  ];
  if (safePrefixes.some((prefix) => message.startsWith(prefix))) return message;
  return config.isProduction ? "Server error" : message;
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
