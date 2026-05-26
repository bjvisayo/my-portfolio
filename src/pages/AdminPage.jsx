import { useEffect, useMemo, useState } from "react";
import {
  Download,
  DollarSign,
  ImagePlus,
  Lock,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

const emptyCredentials = { username: "", password: "" };
const leadStatuses = ["New", "Contacted", "Quoted", "Paid", "Completed", "Archived"];
const projectTemplate = {
  title: "",
  category: "",
  description: "",
  projectUrl: "",
  status: "draft",
  isFeatured: true,
  sortOrder: 0,
};

export default function AdminPage() {
  const [credentials, setCredentials] = useState(() => {
    const saved = window.localStorage.getItem("xk-admin-auth");
    return saved ? JSON.parse(saved) : emptyCredentials;
  });
  const [draftCredentials, setDraftCredentials] = useState(credentials);
  const [activeTab, setActiveTab] = useState("projects");
  const [message, setMessage] = useState("");

  const authHeader = useMemo(() => {
    if (!credentials.username || !credentials.password) return "";
    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }, [credentials]);

  const login = (event) => {
    event.preventDefault();
    setCredentials(draftCredentials);
    window.localStorage.setItem("xk-admin-auth", JSON.stringify(draftCredentials));
  };

  const logout = () => {
    setCredentials(emptyCredentials);
    setDraftCredentials(emptyCredentials);
    window.localStorage.removeItem("xk-admin-auth");
  };

  return (
    <section className="min-h-screen bg-[#07111F] pt-32">
      <div className="container-xl pb-24">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="eyebrow">Admin</span>
            <h1 className="section-title">Xander Kreativ Admin</h1>
            <p className="section-copy">Manage leads, payments, completed projects, and project images.</p>
          </div>
          {authHeader && (
            <div className="flex flex-wrap gap-3">
              <button className={tabClass(activeTab === "projects")} onClick={() => setActiveTab("projects")} type="button">
                <ImagePlus size={17} /> Projects
              </button>
              <button className={tabClass(activeTab === "leads")} onClick={() => setActiveTab("leads")} type="button">
                <DollarSign size={17} /> Leads
              </button>
              <button className="ghost-button" onClick={logout} type="button">
                Log out
              </button>
            </div>
          )}
        </div>

        {!authHeader ? (
          <LoginForm draftCredentials={draftCredentials} setDraftCredentials={setDraftCredentials} login={login} />
        ) : (
          <>
            {message && <p className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-200">{message}</p>}
            {activeTab === "projects" ? (
              <ProjectsAdmin authHeader={authHeader} setMessage={setMessage} />
            ) : (
              <LeadsAdmin authHeader={authHeader} setMessage={setMessage} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function LoginForm({ draftCredentials, setDraftCredentials, login }) {
  return (
    <form onSubmit={login} className="glass-card mx-auto max-w-md rounded-[1.75rem] p-7">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/20 text-blue-200">
        <Lock size={24} />
      </div>
      <h2 className="text-2xl font-black">Admin Login</h2>
      <p className="mt-2 text-sm leading-7 text-slate-400">Default local credentials are owner / secret. Change them with environment variables before publishing.</p>
      <AdminField icon={UserRound} label="Username" value={draftCredentials.username} onChange={(value) => setDraftCredentials((current) => ({ ...current, username: value }))} />
      <AdminField icon={ShieldCheck} label="Password" type="password" value={draftCredentials.password} onChange={(value) => setDraftCredentials((current) => ({ ...current, password: value }))} />
      <button className="blue-button mt-6 w-full" type="submit">Open Dashboard</button>
    </form>
  );
}

function ProjectsAdmin({ authHeader, setMessage }) {
  const [projects, setProjects] = useState([]);
  const [draft, setDraft] = useState(projectTemplate);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/projects", { headers: { Authorization: authHeader } });
      if (!response.ok) throw new Error(await readApiError(response, "Unable to load projects"));
      const data = await readApiJson(response);
      setProjects(data.projects || []);
    } catch (error) {
      setMessage(error.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [authHeader]);

  const createProject = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Unable to create project"));
      const data = await readApiJson(response);
      setProjects((current) => [data.project, ...current]);
      setDraft(projectTemplate);
      setMessage("Project created. Add a hero image next.");
    } catch (error) {
      setMessage(error.message || "Could not create project.");
    }
  };

  const updateProject = async (project) => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error("Unable to update project");
      setMessage("Project updated.");
      await loadProjects();
    } catch {
      setMessage("Could not update project.");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE", headers: { Authorization: authHeader } });
      if (!response.ok) throw new Error("Unable to delete project");
      setProjects((current) => current.filter((project) => project.id !== id));
      setMessage("Project deleted.");
    } catch {
      setMessage("Could not delete project.");
    }
  };

  const uploadImage = async (project, file, isHero) => {
    if (!file) return;
    try {
      const payload = await fileToPayload(file);
      const response = await fetch(`/api/admin/projects/${project.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ ...payload, alt: project.title, isHero }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Unable to upload image"));
      setMessage(isHero ? "Hero image uploaded." : "Gallery image uploaded.");
      await loadProjects();
    } catch (error) {
      setMessage(error.message || "Could not upload image. Use JPG, PNG, or WebP under the configured size limit.");
    }
  };

  const deleteImage = async (projectId, imageId) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
      });
      if (!response.ok) throw new Error("Unable to delete image");
      setMessage("Image removed.");
      await loadProjects();
    } catch {
      setMessage("Could not remove image.");
    }
  };

  return (
    <div className="grid gap-8">
      <form onSubmit={createProject} className="glass-card rounded-[1.75rem] p-6">
        <h2 className="text-2xl font-black">Add completed project</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <TextInput label="Title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} />
          <TextInput label="Category" value={draft.category} onChange={(value) => setDraft((current) => ({ ...current, category: value }))} />
          <TextInput label="Project URL" value={draft.projectUrl} onChange={(value) => setDraft((current) => ({ ...current, projectUrl: value }))} />
          <TextInput label="Sort Order" type="number" value={draft.sortOrder} onChange={(value) => setDraft((current) => ({ ...current, sortOrder: value }))} />
          <label className="lg:col-span-2">
            <span className="mb-2 block text-sm font-bold">Description</span>
            <textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows="4" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" required />
          </label>
          <Toggle label="Published" checked={draft.status === "published"} onChange={(checked) => setDraft((current) => ({ ...current, status: checked ? "published" : "draft" }))} />
          <Toggle label="Featured on site" checked={draft.isFeatured} onChange={(checked) => setDraft((current) => ({ ...current, isFeatured: checked }))} />
        </div>
        <button className="blue-button mt-6" type="submit">
          <Save size={16} /> Create Project
        </button>
      </form>

      {loading && <div className="premium-card">Loading projects...</div>}
      {projects.map((project) => (
        <ProjectEditor
          key={project.id}
          project={project}
          setProjects={setProjects}
          updateProject={updateProject}
          deleteProject={deleteProject}
          uploadImage={uploadImage}
          deleteImage={deleteImage}
        />
      ))}
    </div>
  );
}

function ProjectEditor({ project, setProjects, updateProject, deleteProject, uploadImage, deleteImage }) {
  const hero = project.images?.find((image) => image.isHero);
  const updateLocal = (field, value) => {
    setProjects((current) => current.map((item) => (item.id === project.id ? { ...item, [field]: value } : item)));
  };

  return (
    <article className="glass-card rounded-[1.75rem] p-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextInput label="Title" value={project.title} onChange={(value) => updateLocal("title", value)} />
            <TextInput label="Category" value={project.category} onChange={(value) => updateLocal("category", value)} />
            <TextInput label="Project URL" value={project.projectUrl || ""} onChange={(value) => updateLocal("projectUrl", value)} />
            <TextInput label="Sort Order" type="number" value={project.sortOrder || 0} onChange={(value) => updateLocal("sortOrder", value)} />
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-bold">Description</span>
              <textarea value={project.description} onChange={(event) => updateLocal("description", event.target.value)} rows="4" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" />
            </label>
            <Toggle label="Published" checked={project.status === "published"} onChange={(checked) => updateLocal("status", checked ? "published" : "draft")} />
            <Toggle label="Featured on site" checked={project.isFeatured} onChange={(checked) => updateLocal("isFeatured", checked)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="blue-button" type="button" onClick={() => updateProject(project)}>
              <Save size={16} /> Save
            </button>
            <button className="ghost-button border-red-300/25 text-red-200" type="button" onClick={() => deleteProject(project.id)}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            {hero ? (
              <img src={hero.url} alt={hero.alt || project.title} className="h-64 w-full object-cover" />
            ) : (
              <div className="grid h-64 place-items-center text-sm font-semibold text-slate-400">No hero image yet</div>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FileButton label="Upload Hero" icon={Upload} onFile={(file) => uploadImage(project, file, true)} />
            <FileButton label="Add Gallery" icon={ImagePlus} onFile={(file) => uploadImage(project, file, false)} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(project.images || []).map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-2xl border border-white/10">
                <img src={image.url} alt={image.alt || project.title} className="h-24 w-full object-cover" />
                {image.isHero && <Star className="absolute left-2 top-2 text-amber-300" size={15} fill="currentColor" />}
                <button type="button" onClick={() => deleteImage(project.id, image.id)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500/90 opacity-0 transition group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function LeadsAdmin({ authHeader, setMessage }) {
  const [leads, setLeads] = useState([]);
  const [edits, setEdits] = useState({});
  const [filters, setFilters] = useState({ q: "", status: "" });
  const [loading, setLoading] = useState(false);

  const totals = useMemo(() => {
    const amountPaid = leads.reduce((sum, lead) => sum + Number(lead.amountPaid || 0), 0);
    return { leads: leads.length, paid: leads.filter((lead) => Number(lead.amountPaid || 0) > 0).length, amountPaid };
  }, [leads]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      const response = await fetch(`/api/leads?${params.toString()}`, { headers: { Authorization: authHeader } });
      if (!response.ok) throw new Error(await readApiError(response, "Unable to load leads"));
      const data = await readApiJson(response);
      setLeads(data.leads || []);
      setEdits(Object.fromEntries((data.leads || []).map((lead) => [lead.id, lead])));
    } catch {
      setMessage("Could not load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [authHeader]);

  const updateEdit = (id, field, value) => setEdits((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));

  const saveLead = async (id) => {
    const draft = edits[id];
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ status: draft.status, amountPaid: Number(draft.amountPaid || 0), notes: draft.notes || "" }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Unable to save lead"));
      const data = await readApiJson(response);
      setLeads((current) => current.map((lead) => (lead.id === id ? data.lead : lead)));
      setMessage("Lead updated.");
    } catch {
      setMessage("Could not update lead.");
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      const response = await fetch(`/api/leads/${id}`, { method: "DELETE", headers: { Authorization: authHeader } });
      if (!response.ok) throw new Error("Unable to delete lead");
      setLeads((current) => current.filter((lead) => lead.id !== id));
      setMessage("Lead deleted.");
    } catch {
      setMessage("Could not delete lead.");
    }
  };

  const exportCsv = async () => {
    const response = await fetch("/api/leads/export.csv", { headers: { Authorization: authHeader } });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xander-kreativ-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <button className="ghost-button" type="button" onClick={exportCsv}><Download size={17} /> Export CSV</button>
        <button className="ghost-button" type="button" onClick={loadLeads}><RefreshCw size={17} /> Refresh</button>
      </div>
      <div className="glass-card mb-8 grid gap-4 rounded-[1.75rem] p-4 md:grid-cols-[1fr_220px_auto]">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search leads" className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none" />
        </label>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none">
          <option className="bg-panel" value="">All statuses</option>
          {leadStatuses.map((status) => <option className="bg-panel" key={status}>{status}</option>)}
        </select>
        <button className="blue-button h-12 px-6 py-0" type="button" onClick={loadLeads}>Apply</button>
      </div>
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <Metric label="Total Leads" value={totals.leads} />
        <Metric label="Paid Clients" value={totals.paid} />
        <Metric label="Amount Paid" value={`$${totals.amountPaid.toLocaleString()}`} />
      </div>
      <div className="grid gap-5">
        {loading && <div className="premium-card">Loading leads...</div>}
        {!loading && leads.length === 0 && <div className="premium-card">No leads yet.</div>}
        {leads.map((lead) => {
          const draft = edits[lead.id] || lead;
          return (
            <article key={lead.id} className="glass-card rounded-[1.75rem] p-5 sm:p-6">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                <div>
                  <h2 className="text-2xl font-black">{lead.firstName} {lead.lastName}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-300">{lead.email}</p>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">{lead.details}</p>
                </div>
                <div className="grid gap-4">
                  <select value={draft.status || "New"} onChange={(event) => updateEdit(lead.id, "status", event.target.value)} className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none">
                    {leadStatuses.map((status) => <option className="bg-panel" key={status}>{status}</option>)}
                  </select>
                  <input type="number" min="0" value={draft.amountPaid || 0} onChange={(event) => updateEdit(lead.id, "amountPaid", event.target.value)} className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none" />
                  <textarea value={draft.notes || ""} onChange={(event) => updateEdit(lead.id, "notes", event.target.value)} rows="3" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button className="blue-button" type="button" onClick={() => saveLead(lead.id)}><Save size={16} /> Save</button>
                    <button className="ghost-button border-red-300/25 text-red-200" type="button" onClick={() => deleteLead(lead.id)}><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="premium-card">
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function AdminField({ icon: Icon, label, type = "text", value, onChange }) {
  return (
    <label className="mt-5 block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none focus:border-blue-300" required />
      </span>
    </label>
  );
}

function TextInput({ label, type = "text", value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none" required={label !== "Project URL"} />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function FileButton({ label, icon: Icon, onFile }) {
  return (
    <label className="ghost-button cursor-pointer">
      <Icon size={16} /> {label}
      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
    </label>
  );
}

function tabClass(active) {
  return active ? "blue-button" : "ghost-button";
}

function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve({
        fileName: file.name,
        contentType: file.type,
        data: result.split(",")[1],
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readApiError(response, fallback) {
  const text = await response.text().catch(() => "");
  if (text.trim().startsWith("<")) {
    return "The API returned the website HTML instead of JSON. Redeploy after updating vercel.json so /api routes reach the serverless function.";
  }
  try {
    const data = JSON.parse(text);
    return data.error || fallback;
  } catch {
    return text || fallback;
  }
}

async function readApiJson(response) {
  const text = await response.text();
  if (text.trim().startsWith("<")) {
    throw new Error("The API returned the website HTML instead of JSON. Redeploy after updating vercel.json so /api routes reach the serverless function.");
  }
  return JSON.parse(text);
}
