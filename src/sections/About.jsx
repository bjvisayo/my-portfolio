import { Heart, Star } from "lucide-react";
import { Reveal } from "../components/Motion.jsx";

const aboutImage =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85";

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
            <div className="relative h-[440px] overflow-hidden rounded-[1.5rem]">
              <img
                src={aboutImage}
                alt="Creative team collaborating around a laptop in a natural studio setting"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/15 bg-slate-950/55 p-5 backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Studio process</div>
                <div className="mt-2 font-display text-3xl font-bold text-white">Strategy, design, and clean execution.</div>
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
