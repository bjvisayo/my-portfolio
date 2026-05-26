# Xander Kreativ Backend

## Local commands

```bash
npm run build
npm run server
```

Open `http://127.0.0.1:3000/admin`.

For local API testing, do not use `npm run dev` by itself. Vite only serves the React frontend, so `/api/leads` will not exist and the contact form will show "Backend not reachable." Use one of these:

```bash
npm run build
npm run server
```

Or install/use the Vercel CLI and run:

```bash
vercel dev
```

## Vercel deployment

This project now includes:

- `api/[...path].js` for Vercel serverless API routes
- `vercel.json` to serve the React SPA correctly at `/admin`, `/projects`, `/contact`, and other client routes

Set these environment variables in Vercel Project Settings:

```bash
ADMIN_USERNAME=owner
ADMIN_PASSWORD=use-a-strong-password
STORAGE_DRIVER=supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_LEADS_TABLE=leads
SUPABASE_PROJECTS_TABLE=projects
SUPABASE_PROJECT_IMAGES_TABLE=project_images
SUPABASE_PROJECT_IMAGES_BUCKET=project-images
MAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
MAIL_FROM=Xander Kreativ <hello@xanderkreativ.com>
LEAD_NOTIFICATION_TO=hello@xanderkreativ.com
SEND_LEAD_AUTOREPLY=false
```

Vercel serverless functions have request size limits, so project image uploads default to `MAX_PROJECT_IMAGE_MB=3`.

## Environment variables

- `PORT`: server port, defaults to `3000`
- `ADMIN_USERNAME`: admin dashboard username
- `ADMIN_PASSWORD`: admin dashboard password
- `STORAGE_DRIVER`: `json` or `supabase`
- `DATA_DIR`: folder for JSON storage, defaults to `./data`
- `LEADS_FILE`: optional full path for the leads JSON file
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key. Keep this server-only.
- `SUPABASE_LEADS_TABLE`: leads table name, defaults to `leads`
- `SUPABASE_PROJECTS_TABLE`: projects table name, defaults to `projects`
- `SUPABASE_PROJECT_IMAGES_TABLE`: project images table name, defaults to `project_images`
- `SUPABASE_PROJECT_IMAGES_BUCKET`: Supabase Storage bucket, defaults to `project-images`
- `MAX_PROJECT_IMAGE_MB`: upload limit, defaults to `5`
- `ALLOWED_PROJECT_IMAGE_TYPES`: comma-separated image MIME types
- `MAIL_PROVIDER`: `none` or `resend`
- `RESEND_API_KEY`: Resend API key
- `MAIL_FROM`: verified sender, for example `Xander Kreativ <hello@xanderkreativ.com>`
- `LEAD_NOTIFICATION_TO`: inbox that receives new lead alerts
- `SEND_LEAD_AUTOREPLY`: set to `true` to email the client automatically

## API

- `GET /api/health`
- `POST /api/leads`
- `GET /api/leads` admin auth required
- `GET /api/leads/:id` admin auth required
- `PATCH /api/leads/:id` admin auth required
- `DELETE /api/leads/:id` admin auth required
- `GET /api/leads/export.csv` admin auth required
- `GET /api/projects`
- `GET /api/admin/projects` admin auth required
- `POST /api/admin/projects` admin auth required
- `PATCH /api/admin/projects/:id` admin auth required
- `DELETE /api/admin/projects/:id` admin auth required
- `POST /api/admin/projects/:id/images` admin auth required
- `DELETE /api/admin/projects/:id/images/:imageId` admin auth required

Admin routes use HTTP Basic auth. For production, set strong `ADMIN_USERNAME` and `ADMIN_PASSWORD` values.

## Production note

The default storage driver is JSON-file based. It is fine for local testing or a small VPS, but Vercel serverless storage is not durable. For production, set `STORAGE_DRIVER=supabase`.

## Supabase setup

Open Supabase, go to **SQL Editor**, paste the contents of `supabase-schema.sql`, and run it. That creates the `leads`, `projects`, and `project_images` tables.

The same SQL is shown below for reference:

```sql
create table if not exists public.leads (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  service text not null,
  details text not null,
  source text default 'Website contact form',
  status text default 'New',
  amount_paid numeric default 0,
  notes text default '',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

create table if not exists public.projects (
  id uuid primary key,
  title text not null,
  slug text unique not null,
  category text not null,
  description text not null,
  project_url text,
  status text not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.project_images (
  id uuid primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  storage_path text not null,
  alt text,
  is_hero boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null
);

create index if not exists projects_status_featured_idx on public.projects (status, is_featured, sort_order);
create index if not exists project_images_project_idx on public.project_images (project_id, is_hero, sort_order);
```

Create a public Supabase Storage bucket named `project-images`.

Then set:

```bash
STORAGE_DRIVER=supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_LEADS_TABLE=leads
SUPABASE_PROJECTS_TABLE=projects
SUPABASE_PROJECT_IMAGES_TABLE=project_images
SUPABASE_PROJECT_IMAGES_BUCKET=project-images
```

The backend uses the service role key server-side only. Do not expose it in frontend code.

## Email setup

The backend currently supports Resend without installing extra packages.

```bash
MAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
MAIL_FROM=Xander Kreativ <hello@xanderkreativ.com>
LEAD_NOTIFICATION_TO=hello@xanderkreativ.com
SEND_LEAD_AUTOREPLY=true
```

When a lead is created, the backend saves it first, then sends:

- an internal notification to `LEAD_NOTIFICATION_TO`
- an optional client confirmation when `SEND_LEAD_AUTOREPLY=true`
