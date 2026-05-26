import { motion } from "framer-motion";
import { CheckCircle2, Gauge, MonitorSmartphone } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85";

export default function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative mx-auto w-full max-w-xl lg:mr-0"
    >
      <div className="absolute -inset-10 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-8 top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[2rem] border border-white/12 bg-white/[0.06] p-3 shadow-2xl shadow-blue-950/60 backdrop-blur-xl"
      >
        <div className="rounded-[1.35rem] border border-white/10 bg-slate-950 p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 h-6 flex-1 rounded-full bg-white/[0.06]" />
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-2xl">
            <img
              src={heroImage}
              alt="Natural modern workspace with laptop and warm daylight"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-950/20 to-blue-500/10" />
            <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/15 bg-slate-950/55 p-5 backdrop-blur-xl">
              <div className="mb-3 h-2 w-24 rounded-full bg-cyan-300" />
              <h3 className="font-display text-2xl font-bold text-white">Clean sites. Real business impact.</h3>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-16 rounded-2xl bg-white/15" />
                <div className="h-16 rounded-2xl bg-blue-400/25" />
                <div className="h-16 rounded-2xl bg-cyan-300/20" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <FloatingBadge className="-left-4 bottom-10" icon={MonitorSmartphone} title="Responsive" text="on all devices" delay={0.7} />
      <FloatingBadge className="-right-2 top-12" icon={Gauge} title="98+" text="Performance Score" delay={0.35} />
      <FloatingBadge className="left-12 -bottom-8 hidden sm:flex" icon={CheckCircle2} title="Launch-ready" text="built for growth" delay={1} />
    </motion.div>
  );
}

function FloatingBadge({ className, icon: Icon, title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`absolute z-10 flex items-center gap-3 rounded-2xl border border-white/12 bg-slate-950/75 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ${className}`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-200">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-sm font-extrabold text-white">{title}</span>
        <span className="block text-xs font-semibold text-slate-300">{text}</span>
      </span>
    </motion.div>
  );
}
