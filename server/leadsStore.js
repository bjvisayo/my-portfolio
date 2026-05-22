import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.js";

export async function listLeadRecords() {
  if (usesSupabase()) return supabaseListLeads();
  return readJsonLeads();
}

export async function createLeadRecord(lead) {
  if (usesSupabase()) return supabaseCreateLead(lead);

  const leads = await readJsonLeads();
  leads.unshift(lead);
  await writeJsonLeads(leads);
  return lead;
}

export async function updateLeadRecord(id, updates) {
  if (usesSupabase()) return supabaseUpdateLead(id, updates);

  const leads = await readJsonLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return null;

  leads[index] = { ...leads[index], ...updates };
  await writeJsonLeads(leads);
  return leads[index];
}

export async function deleteLeadRecord(id) {
  if (usesSupabase()) return supabaseDeleteLead(id);

  const leads = await readJsonLeads();
  const nextLeads = leads.filter((lead) => lead.id !== id);
  if (nextLeads.length === leads.length) return false;
  await writeJsonLeads(nextLeads);
  return true;
}

function usesSupabase() {
  return config.storageDriver === "supabase";
}

async function readJsonLeads() {
  await ensureDataFile();
  const content = await readFile(config.leadsFile, "utf8");

  try {
    const parsed = JSON.parse(content || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const backup = `${config.leadsFile}.corrupt-${Date.now()}`;
    await rename(config.leadsFile, backup);
    await writeFile(config.leadsFile, "[]\n", "utf8");
    return [];
  }
}

async function writeJsonLeads(leads) {
  await ensureDataFile();
  const tempFile = `${config.leadsFile}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
  await rename(tempFile, config.leadsFile);
}

async function ensureDataFile() {
  await mkdir(dirname(config.leadsFile), { recursive: true });
  try {
    await stat(config.leadsFile);
  } catch {
    await writeFile(config.leadsFile, "[]\n", "utf8");
  }
}

async function supabaseListLeads() {
  assertSupabaseConfigured();
  const data = await supabaseRequest("", {
    method: "GET",
    query: "select=*&order=created_at.desc",
  });
  return data.map(fromSupabaseRow);
}

async function supabaseCreateLead(lead) {
  assertSupabaseConfigured();
  const data = await supabaseRequest("", {
    method: "POST",
    body: toSupabaseRow(lead),
    headers: { Prefer: "return=representation" },
  });
  return fromSupabaseRow(data[0]);
}

async function supabaseUpdateLead(id, updates) {
  assertSupabaseConfigured();
  const data = await supabaseRequest("", {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(id)}`,
    body: toSupabaseRow(updates),
    headers: { Prefer: "return=representation" },
  });
  return data[0] ? fromSupabaseRow(data[0]) : null;
}

async function supabaseDeleteLead(id) {
  assertSupabaseConfigured();
  const data = await supabaseRequest("", {
    method: "DELETE",
    query: `id=eq.${encodeURIComponent(id)}`,
    headers: { Prefer: "return=representation" },
  });
  return Array.isArray(data) && data.length > 0;
}

async function supabaseRequest(path, options = {}) {
  const query = options.query ? `?${options.query}` : "";
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.supabaseLeadsTable}${path}${query}`, {
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
    const text = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${text}`);
  }

  if (response.status === 204) return [];
  return response.json();
}

function assertSupabaseConfigured() {
  if (!config.isSupabaseConfigured) {
    throw new Error("Supabase storage selected but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
  }
}

function toSupabaseRow(lead) {
  const row = {};
  const map = {
    id: "id",
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    phone: "phone",
    service: "service",
    details: "details",
    source: "source",
    status: "status",
    amountPaid: "amount_paid",
    notes: "notes",
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

  for (const [key, column] of Object.entries(map)) {
    if (lead[key] !== undefined) row[column] = lead[key];
  }

  return row;
}

function fromSupabaseRow(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone || "",
    service: row.service,
    details: row.details,
    source: row.source || "Website contact form",
    status: row.status || "New",
    amountPaid: Number(row.amount_paid || 0),
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
