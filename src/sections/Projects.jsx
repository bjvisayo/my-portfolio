import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Reveal, fadeUp, stagger } from "../components/Motion.jsx";
import Link from "../components/Link.jsx";
import { projects as fallbackProjects } from "../data/siteData.js";

export default function Projects({ revealMode = "viewport" }) {
  const [projects, setProjects] = useState(fallbackProjects);
  const shouldRevealImmediately = revealMode === "immediate";

  useEffect(() => {
    let active = true;
    fetch(`/api/projects?ts=${Date.now()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (active) setProjects(data.projects?.length ? data.projects : fallbackProjects);
      })
      .catch(() => {
        if (active) setProjects(fallbackProjects);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="projects" className="relative bg-[#0b1726] py-24 sm:py-32">
      <div className="container-xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <span className="eyebrow">Our work</span>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-copy">A curated selection of premium digital experiences built for trust, clarity, and conversion.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/contact" className="ghost-button">
              View All Projects <ArrowRight size={17} />
            </Link>
          </Reveal>
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={shouldRevealImmediately ? "show" : undefined}
          whileInView={shouldRevealImmediately ? undefined : "show"}
          viewport={shouldRevealImmediately ? undefined : { once: true, margin: "-80px" }}
          className="mt-12 grid gap-6 lg:grid-cols-2"
        >
          {projects.map((project) => (
            <motion.article
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              key={project.title}
              className="group relative min-h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel shadow-2xl shadow-black/25"
            >
              {getHeroImage(project) ? (
                <img
                  src={getHeroImage(project).url}
                  alt={getHeroImage(project).alt || project.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className={`absolute inset-0 ${project.visual} transition duration-700 group-hover:scale-105`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/55 to-transparent" />
              <div className="absolute left-5 right-5 top-5 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-3">
                  {(project.images?.filter((image) => !image.isHero).slice(0, 3) || []).map((image) => (
                    <img key={image.id} src={image.url} alt={image.alt || project.title} className="h-28 rounded-2xl object-cover" />
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (project.images?.filter((image) => !image.isHero).slice(0, 3).length || 0)) }).map((_, index) => (
                    <div key={index} className="h-28 rounded-2xl bg-white/20" />
                  ))}
                </div>
              </div>
              <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end p-6 sm:p-8">
                <span className="mb-3 w-fit rounded-full border border-blue-300/30 bg-blue-400/15 px-3 py-1 text-xs font-bold text-blue-100">
                  {project.category}
                </span>
                <h3 className="font-display text-3xl font-bold">{project.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">{project.description}</p>
                <a href={getProjectHref(project.projectUrl)} target={project.projectUrl ? "_blank" : undefined} rel={project.projectUrl ? "noreferrer" : undefined} className="blue-button mt-6 w-fit py-2.5">
                  Visit Project <ExternalLink size={15} />
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function getHeroImage(project) {
  return project.images?.find((image) => image.isHero) || project.images?.[0];
}

function getProjectHref(projectUrl) {
  const url = String(projectUrl || "").trim();
  if (!url) return "/contact";
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}
