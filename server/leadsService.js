import crypto from "node:crypto";
import { createLeadRecord, deleteLeadRecord, listLeadRecords, updateLeadRecord } from "./leadsStore.js";
import { sendLeadNotifications } from "./mailer.js";

const allowedStatuses = new Set(["New", "Contacted", "Quoted", "Paid", "Completed", "Archived"]);

export async function createLead(body) {
  const validation = validateLead(body);
  if (!validation.ok) return { statusCode: 400, payload: { error: validation.error } };

  const now = new Date().toISOString();
  const lead = {
    id: crypto.randomUUID(),
    firstName: clean(body.firstName, 80),
    lastName: clean(body.lastName, 80),
    email: clean(body.email, 160).toLowerCase(),
    phone: clean(body.phone, 60),
    service: clean(body.service, 120),
    details: clean(body.details, 5000),
    source: clean(body.source || "Website contact form", 120),
    status: "New",
    amountPaid: 0,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };

  const savedLead = await createLeadRecord(lead);
  await sendLeadNotifications(savedLead);
  return { statusCode: 201, payload: { lead: savedLead } };
}

export async function listLeads(filters = {}) {
  const leads = await listLeadRecords();
  const query = clean(filters.q || "", 120).toLowerCase();
  const status = clean(filters.status || "", 40);

  const filtered = leads.filter((lead) => {
    const matchesQuery = !query || [lead.firstName, lead.lastName, lead.email, lead.service, lead.details]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = !status || lead.status === status;
    return matchesQuery && matchesStatus;
  });

  const totalPaid = filtered.reduce((sum, lead) => sum + Number(lead.amountPaid || 0), 0);

  return {
    leads: filtered,
    summary: {
      totalLeads: filtered.length,
      paidClients: filtered.filter((lead) => Number(lead.amountPaid || 0) > 0).length,
      totalPaid,
    },
  };
}

export async function getLead(id) {
  const leads = await listLeadRecords();
  const lead = leads.find((item) => item.id === id);
  if (!lead) return { statusCode: 404, payload: { error: "Lead not found" } };
  return { statusCode: 200, payload: { lead } };
}

export async function updateLead(id, body) {
  const leads = await listLeadRecords();
  const existingLead = leads.find((lead) => lead.id === id);
  if (!existingLead) return { statusCode: 404, payload: { error: "Lead not found" } };

  const status = clean(body.status || existingLead.status, 40);
  if (!allowedStatuses.has(status)) {
    return { statusCode: 400, payload: { error: "Invalid lead status" } };
  }

  const amountPaid = Number(body.amountPaid || 0);
  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    return { statusCode: 400, payload: { error: "Amount paid must be a positive number" } };
  }

  const lead = await updateLeadRecord(id, {
    status,
    amountPaid,
    notes: clean(body.notes || "", 5000),
    updatedAt: new Date().toISOString(),
  });

  return { statusCode: 200, payload: { lead } };
}

export async function deleteLead(id) {
  const deleted = await deleteLeadRecord(id);
  if (!deleted) {
    return { statusCode: 404, payload: { error: "Lead not found" } };
  }
  return { statusCode: 200, payload: { ok: true } };
}

export async function exportLeadsCsv() {
  const leads = await listLeadRecords();
  const headers = ["createdAt", "firstName", "lastName", "email", "phone", "service", "status", "amountPaid", "details", "notes"];
  const rows = leads.map((lead) => headers.map((header) => csvValue(lead[header])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

function validateLead(body) {
  const required = ["firstName", "lastName", "email", "service", "details"];
  const missing = required.filter((field) => !clean(body[field], 5000));
  if (missing.length) return { ok: false, error: `Missing fields: ${missing.join(", ")}` };

  const email = clean(body.email, 160);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please provide a valid email address" };
  }

  return { ok: true };
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function csvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll("\"", "\"\"")}"`;
}
