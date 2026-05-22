import { MapPin, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Reveal } from "../components/Motion.jsx";
import { contactCards } from "../data/siteData.js";

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    service: "",
    details: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitLead = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending your message..." });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Unable to save lead");

      setForm({ firstName: "", lastName: "", email: "", service: "", details: "" });
      setStatus({ type: "success", message: "Message received. We will respond within 24 hours." });
    } catch {
      setStatus({
        type: "error",
        message: "Backend not reachable yet. Start the Node server or use WhatsApp for now.",
      });
    }
  };

  return (
    <section id="contact" className="relative border-t border-white/10 bg-[#0B1726] py-24 sm:py-32">
      <div className="container-xl">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span className="eyebrow">Get in touch</span>
          <h2 className="section-title">Let's build something that grows your business</h2>
          <p className="section-copy mx-auto">Tell us what you are building and we will help shape the right website for the next stage.</p>
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_.9fr]">
          <Reveal className="glass-card rounded-[1.75rem] p-6 sm:p-8">
            <h3 className="text-2xl font-extrabold">Send us a message</h3>
            <form className="mt-7 grid gap-5" onSubmit={submitLead}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="First Name" placeholder="John" value={form.firstName} onChange={updateField("firstName")} />
                <Field label="Last Name" placeholder="Doe" value={form.lastName} onChange={updateField("lastName")} />
              </div>
              <Field label="Email Address" placeholder="john@example.com" type="email" value={form.email} onChange={updateField("email")} />
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-white">Service Interested In</span>
                <select
                  value={form.service}
                  onChange={updateField("service")}
                  required
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white outline-none transition focus:border-blue-300"
                >
                  <option className="bg-panel" value="">Select a service</option>
                  <option className="bg-panel">Website Design</option>
                  <option className="bg-panel">Landing Pages</option>
                  <option className="bg-panel">Shopify Optimization</option>
                  <option className="bg-panel">Website Redesign</option>
                  <option className="bg-panel">Performance Optimization</option>
                  <option className="bg-panel">Custom Project</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-white">Project Details</span>
                <textarea
                  rows="5"
                  value={form.details}
                  onChange={updateField("details")}
                  required
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300"
                />
              </label>
              <button className="blue-button w-full disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={status.type === "loading"}>
                {status.type === "loading" ? "Sending..." : "Send Message"} <Send size={16} />
              </button>
              <p className={`text-center text-xs font-semibold ${status.type === "error" ? "text-red-300" : status.type === "success" ? "text-emerald-300" : "text-slate-400"}`}>
                {status.message || "We typically respond within 24 hours."}
              </p>
            </form>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5">
            <div className="glass-card rounded-[1.75rem] p-6 sm:p-8">
              <h3 className="text-xl font-extrabold">Quick Contact</h3>
              <div className="mt-6 space-y-4">
                {contactCards.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/20 text-blue-200">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-slate-400">{label}</span>
                      <span className="block text-sm font-extrabold text-white">{value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <a
              href="https://wa.me/14175609297"
              target="_blank"
              rel="noreferrer"
              className="block rounded-[1.75rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-400 to-emerald-600 p-8 text-center shadow-[0_0_60px_rgba(16,185,129,.25)] transition hover:-translate-y-1"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15">
                <MessageCircle size={27} />
              </span>
              <span className="mt-5 block text-2xl font-black">Chat on WhatsApp</span>
              <span className="mt-2 block text-sm font-semibold text-emerald-50">+1 417 560 9297</span>
            </a>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 text-center">
              <MapPin className="mx-auto text-blue-300" size={32} />
              <h3 className="mt-5 font-extrabold">Location Available on Request</h3>
              <p className="mt-2 text-sm text-slate-400">Remote-friendly agency with fast response times.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300"
      />
    </label>
  );
}
