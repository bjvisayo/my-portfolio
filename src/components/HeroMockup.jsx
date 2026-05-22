import { motion } from "framer-motion";
import { CheckCircle2, Gauge, MonitorSmartphone, Sparkles } from "lucide-react";

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
          <div className="mockup-screen overflow-hidden rounded-2xl p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_.8fr]">
              <div>
                <div className="mb-3 h-3 w-24 rounded-full bg-blue-300/80" />
                <div className="mb-2 h-8 w-full max-w-52 rounded-lg bg-white/90" />
                <div className="mb-6 h-8 w-40 rounded-lg bg-white/75" />
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-slate-300/40" />
                  <div className="h-2 w-4/5 rounded-full bg-slate-300/30" />
                  <div className="h-2 w-2/3 rounded-full bg-slate-300/20" />
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-9 w-28 rounded-full bg-blue-500" />
                  <div className="h-9 w-20 rounded-full border border-white/20" />
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles size={14} className="text-cyan-300" /> Live Preview
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-20 rounded-xl bg-blue-400/30" />
                    <div className="h-20 rounded-xl bg-purple-400/30" />
                    <div className="col-span-2 h-12 rounded-xl bg-white/15" />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <span>Conversions</span>
                    <span className="text-emerald-300">+42%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" />
                  </div>
                </div>
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
