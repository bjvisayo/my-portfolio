import { join } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
try {
  loadEnvFile(join(root, ".env"));
} catch {
  // Vercel and other hosts inject env vars directly.
}
const hasSupabaseCredentials = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const config = {
  root,
  distDir: join(root, "dist"),
  dataDir: process.env.DATA_DIR || join(root, "data"),
  leadsFile: process.env.LEADS_FILE || join(process.env.DATA_DIR || join(root, "data"), "leads.json"),
  projectsFile: process.env.PROJECTS_FILE || join(process.env.DATA_DIR || join(root, "data"), "projects.json"),
  uploadsDir: process.env.UPLOADS_DIR || join(root, "uploads"),
  port: Number(process.env.PORT || 3000),
  adminUsername: process.env.ADMIN_USERNAME || "owner",
  adminPassword: process.env.ADMIN_PASSWORD || "secret",
  storageDriver: process.env.STORAGE_DRIVER || (hasSupabaseCredentials ? "supabase" : "json"),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseLeadsTable: process.env.SUPABASE_LEADS_TABLE || "leads",
  supabaseProjectsTable: process.env.SUPABASE_PROJECTS_TABLE || "projects",
  supabaseProjectImagesTable: process.env.SUPABASE_PROJECT_IMAGES_TABLE || "project_images",
  supabaseProjectImagesBucket: process.env.SUPABASE_PROJECT_IMAGES_BUCKET || "project-images",
  maxProjectImageMb: Number(process.env.MAX_PROJECT_IMAGE_MB || 3),
  allowedProjectImageTypes: (process.env.ALLOWED_PROJECT_IMAGE_TYPES || "image/jpeg,image/png,image/webp").split(",").map((type) => type.trim()),
  mailProvider: process.env.MAIL_PROVIDER || "none",
  resendApiKey: process.env.RESEND_API_KEY || "",
  mailFrom: process.env.MAIL_FROM || "Xander Kreativ <hello@xanderkreativ.com>",
  leadNotificationTo: process.env.LEAD_NOTIFICATION_TO || "",
  sendLeadAutoreply: process.env.SEND_LEAD_AUTOREPLY === "true",
  isProduction: process.env.NODE_ENV === "production",
  get usesDefaultAdminCredentials() {
    return this.adminUsername === "owner" && this.adminPassword === "secret";
  },
  get isSupabaseConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseServiceRoleKey);
  },
  get isMailConfigured() {
    if (this.mailProvider === "none") return false;
    if (this.mailProvider === "resend") return Boolean(this.resendApiKey && this.mailFrom);
    return false;
  },
};
