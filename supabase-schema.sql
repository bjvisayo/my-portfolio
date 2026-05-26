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

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists projects_status_featured_idx on public.projects (status, is_featured, sort_order);
create index if not exists project_images_project_idx on public.project_images (project_id, is_hero, sort_order);
