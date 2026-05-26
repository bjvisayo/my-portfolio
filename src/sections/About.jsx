import { Heart, Star } from "lucide-react";
import { Reveal } from "../components/Motion.jsx";

const aboutStats = [
  { value: "5+", label: "Years Experience" },
  { value: "50+", label: "Projects Done" },
  { value: "100%", label: "Satisfaction" },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="absolute left-0 top-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="container-xl relative grid items-center gap-14 lg:grid-cols-[.9fr_1fr]">
        <Reveal>
          <span className="eyebrow">About us</span>
          <h2 className="section-title">I'm Xander Kreativ</h2>
          <div className="mt-6 space-y-5 text-sm leading-8 text-slate-300 sm:text-base">
            <p>
              I am a modern web design and development agency dedicated to helping businesses succeed online with
              premium digital experiences that look sharp, load fast, and convert.
            </p>
            <p>
              Our approach combines clean aesthetics, thoughtful strategy, and reliable development. Every pixel is intentional,
              every interaction has a job, and every page is shaped to make your business easier to trust.
            </p>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-4">
            {aboutStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-blue-300">{stat.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <div className="absolute -inset-8 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/35 backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-[#eef4ff] p-6 text-slate-950">
              <div className="mb-12 flex items-center justify-between text-xs font-black uppercase tracking-widest">
                <span>DSGN.</span>
                <span className="text-blue-600">Home</span>
                <span>Catalogue</span>
              </div>
              <div className="grid items-end gap-5 sm:grid-cols-[.85fr_1fr]">
                <div>
                  <div className="mb-4 h-3 w-24 rounded-full bg-blue-500" />
                  <div className="font-display text-6xl font-black leading-none text-slate-950 sm:text-7xl">
                    DSGN<span className="text-orange-500">*</span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="h-2 rounded-full bg-slate-300" />
                    <div className="h-2 w-4/5 rounded-full bg-slate-300" />
                    <div className="h-2 w-2/3 rounded-full bg-slate-300" />
                  </div>
                </div>
                <div className="relative h-72 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-200 to-slate-400">
                  <div className="absolute bottom-0 left-1/2 h-56 w-36 -translate-x-1/2 rounded-t-full bg-slate-900" />
                  <div className="absolute left-1/2 top-12 h-24 w-24 -translate-x-1/2 rounded-full bg-slate-300" />
                  <div className="absolute bottom-7 left-1/2 h-24 w-48 -translate-x-1/2 rounded-t-[3rem] border border-white/30 bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-2 top-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500 text-white">
              <Heart size={19} fill="currentColor" />
            </span>
            <span>
              <span className="block text-sm font-black">100+ Reviews</span>
              <span className="flex items-center gap-1 text-xs text-slate-300">
                <Star size={12} fill="currentColor" className="text-amber-300" /> 5-star rated
              </span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
