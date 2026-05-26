import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.js";
import { getProjectImageProxyUrl } from "./projectImages.js";

export async function listProjectRecords() {
  if (usesSupabase()) return supabaseListProjects();
  return readJsonProjects();
}

export async function createProjectRecord(project) {
  if (usesSupabase()) return supabaseCreateProject(project);
  const projects = await readJsonProjects();
  projects.unshift(project);
  await writeJsonProjects(projects);
  return project;
}

export async function updateProjectRecord(id, updates) {
  if (usesSupabase()) return supabaseUpdateProject(id, updates);
  const projects = await readJsonProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) return null;
  projects[index] = { ...projects[index], ...updates };
  await writeJsonProjects(projects);
  return projects[index];
}

export async function deleteProjectRecord(id) {
  if (usesSupabase()) return supabaseDeleteProject(id);
  const projects = await readJsonProjects();
  const nextProjects = projects.filter((project) => project.id !== id);
  if (nextProjects.length === projects.length) return false;
  await writeJsonProjects(nextProjects);
  return true;
}

export async function addProjectImageRecord(projectId, image) {
  if (usesSupabase()) return supabaseCreateImage(projectId, image);
  const projects = await readJsonProjects();
  const index = projects.findIndex((project) => project.id === projectId);
  if (index === -1) return null;
  const images = image.isHero
    ? (projects[index].images || []).map((item) => ({ ...item, isHero: false }))
    : projects[index].images || [];
  projects[index] = { ...projects[index], images: [...images, image], updatedAt: new Date().toISOString() };
  await writeJsonProjects(projects);
  return image;
}

export async function deleteProjectImageRecord(projectId, imageId) {
  if (usesSupabase()) return supabaseDeleteImage(imageId);
  const projects = await readJsonProjects();
  const index = projects.findIndex((project) => project.id === projectId);
  if (index === -1) return false;
  const nextImages = (projects[index].images || []).filter((image) => image.id !== imageId);
  if (nextImages.length === (projects[index].images || []).length) return false;
  projects[index] = { ...projects[index], images: nextImages, updatedAt: new Date().toISOString() };
  await writeJsonProjects(projects);
  return true;
}

function usesSupabase() {
  return config.storageDriver === "supabase";
}

async function readJsonProjects() {
  await ensureDataFile();
  const content = await readFile(config.projectsFile, "utf8");
  try {
    const parsed = JSON.parse(content || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const backup = `${config.projectsFile}.corrupt-${Date.now()}`;
    await rename(config.projectsFile, backup);
    await writeFile(config.projectsFile, "[]\n", "utf8");
    return [];
  }
}

async function writeJsonProjects(projects) {
  await ensureDataFile();
  const tempFile = `${config.projectsFile}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
  await rename(tempFile, config.projectsFile);
}

async function ensureDataFile() {
  await mkdir(dirname(config.projectsFile), { recursive: true });
  try {
    await stat(config.projectsFile);
  } catch {
    await writeFile(config.projectsFile, "[]\n", "utf8");
  }
}

async function supabaseListProjects() {
  const [projects, images] = await Promise.all([
    supabaseRequest(config.supabaseProjectsTable, "select=*&order=sort_order.asc,created_at.desc"),
    supabaseRequest(config.supabaseProjectImagesTable, "select=*&order=sort_order.asc,created_at.asc"),
  ]);
  return projects.map((project) => ({
    ...fromProjectRow(project),
    images: images.filter((image) => image.project_id === project.id).map(fromImageRow),
  }));
}

async function supabaseCreateProject(project) {
  const data = await supabaseRequest(config.supabaseProjectsTable, "", {
    method: "POST",
    body: toProjectRow(project),
    headers: { Prefer: "return=representation" },
  });
  return { ...fromProjectRow(data[0]), images: [] };
}

async function supabaseUpdateProject(id, updates) {
  const data = await supabaseRequest(config.supabaseProjectsTable, `id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: toProjectRow(updates),
    headers: { Prefer: "return=representation" },
  });
  return data[0] ? { ...fromProjectRow(data[0]), images: [] } : null;
}

async function supabaseDeleteProject(id) {
  const data = await supabaseRequest(config.supabaseProjectsTable, `id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  return Array.isArray(data) && data.length > 0;
}

async function supabaseCreateImage(projectId, image) {
  const data = await supabaseRequest(config.supabaseProjectImagesTable, "", {
    method: "POST",
    body: toImageRow(projectId, image),
    headers: { Prefer: "return=representation" },
  });
  return fromImageRow(data[0]);
}

async function supabaseDeleteImage(imageId) {
  const data = await supabaseRequest(config.supabaseProjectImagesTable, `id=eq.${encodeURIComponent(imageId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  return Array.isArray(data) && data.length > 0;
}

async function supabaseRequest(table, query = "", options = {}) {
  if (!config.isSupabaseConfigured) {
    throw new Error("Supabase selected but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
  }
  const suffix = query ? `?${query}` : "";
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}${suffix}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }
  if (response.status === 204) return [];
  return response.json();
}

function toProjectRow(project) {
  const map = {
    id: "id",
    title: "title",
    slug: "slug",
    category: "category",
    description: "description",
    projectUrl: "project_url",
    status: "status",
    isFeatured: "is_featured",
    sortOrder: "sort_order",
    createdAt: "created_at",
    updatedAt: "updated_at",
  };
  return mapKeys(project, map);
}

function toImageRow(projectId, image) {
  return {
    ...mapKeys(image, {
      id: "id",
      url: "url",
      storagePath: "storage_path",
      alt: "alt",
      isHero: "is_hero",
      sortOrder: "sort_order",
      createdAt: "created_at",
    }),
    project_id: projectId,
  };
}

function fromProjectRow(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    description: row.description,
    projectUrl: row.project_url || "",
    status: row.status || "draft",
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromImageRow(row) {
  return {
    id: row.id,
    url: getProjectImageProxyUrl(row.storage_path),
    storagePath: row.storage_path,
    alt: row.alt || "",
    isHero: Boolean(row.is_hero),
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at,
  };
}

function mapKeys(source, map) {
  const output = {};
  for (const [key, mappedKey] of Object.entries(map)) {
    if (source[key] !== undefined) output[mappedKey] = source[key];
  }
  return output;
}
