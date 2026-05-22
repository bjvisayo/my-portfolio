import crypto from "node:crypto";
import { addProjectImageRecord, createProjectRecord, deleteProjectImageRecord, deleteProjectRecord, listProjectRecords, updateProjectRecord } from "./projectsStore.js";
import { storeProjectImage } from "./projectImages.js";

export async function listProjects({ admin = false, featuredOnly = false } = {}) {
  const projects = await listProjectRecords();
  const filtered = projects
    .filter((project) => admin || project.status === "published")
    .filter((project) => !featuredOnly || project.isFeatured)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  return { projects: filtered };
}

export async function createProject(body) {
  const validation = validateProject(body);
  if (!validation.ok) return { statusCode: 400, payload: { error: validation.error } };

  const now = new Date().toISOString();
  const project = {
    id: crypto.randomUUID(),
    title: clean(body.title, 120),
    slug: slugify(body.slug || body.title),
    category: clean(body.category, 120),
    description: clean(body.description, 1200),
    projectUrl: clean(body.projectUrl, 500),
    status: body.status === "published" ? "published" : "draft",
    isFeatured: Boolean(body.isFeatured),
    sortOrder: Number(body.sortOrder || 0),
    images: [],
    createdAt: now,
    updatedAt: now,
  };

  const savedProject = await createProjectRecord(project);
  return { statusCode: 201, payload: { project: savedProject } };
}

export async function updateProject(id, body) {
  const updates = {
    title: body.title !== undefined ? clean(body.title, 120) : undefined,
    slug: body.slug !== undefined ? slugify(body.slug) : undefined,
    category: body.category !== undefined ? clean(body.category, 120) : undefined,
    description: body.description !== undefined ? clean(body.description, 1200) : undefined,
    projectUrl: body.projectUrl !== undefined ? clean(body.projectUrl, 500) : undefined,
    status: body.status === "published" ? "published" : "draft",
    isFeatured: Boolean(body.isFeatured),
    sortOrder: Number(body.sortOrder || 0),
    updatedAt: new Date().toISOString(),
  };

  const project = await updateProjectRecord(id, removeUndefined(updates));
  if (!project) return { statusCode: 404, payload: { error: "Project not found" } };
  return { statusCode: 200, payload: { project } };
}

export async function deleteProject(id) {
  const deleted = await deleteProjectRecord(id);
  if (!deleted) return { statusCode: 404, payload: { error: "Project not found" } };
  return { statusCode: 200, payload: { ok: true } };
}

export async function uploadProjectImage(projectId, body) {
  const projects = await listProjectRecords();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return { statusCode: 404, payload: { error: "Project not found" } };

  if (!body.data || !body.contentType) {
    return { statusCode: 400, payload: { error: "Missing image data" } };
  }

  const stored = await storeProjectImage({
    projectId,
    fileName: body.fileName || "project-image",
    contentType: body.contentType,
    data: body.data,
  });

  if (!stored.ok) return { statusCode: 400, payload: { error: stored.error } };

  const image = {
    id: crypto.randomUUID(),
    url: stored.url,
    storagePath: stored.storagePath,
    alt: clean(body.alt || project.title, 180),
    isHero: Boolean(body.isHero),
    sortOrder: Number(body.sortOrder || 0),
    createdAt: new Date().toISOString(),
  };

  const savedImage = await addProjectImageRecord(projectId, image);
  return { statusCode: 201, payload: { image: savedImage } };
}

export async function deleteProjectImage(projectId, imageId) {
  const deleted = await deleteProjectImageRecord(projectId, imageId);
  if (!deleted) return { statusCode: 404, payload: { error: "Project image not found" } };
  return { statusCode: 200, payload: { ok: true } };
}

function validateProject(body) {
  const required = ["title", "category", "description"];
  const missing = required.filter((field) => !clean(body[field], 1200));
  if (missing.length) return { ok: false, error: `Missing fields: ${missing.join(", ")}` };
  return { ok: true };
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function slugify(value) {
  return clean(value, 140)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || crypto.randomUUID();
}

function removeUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
