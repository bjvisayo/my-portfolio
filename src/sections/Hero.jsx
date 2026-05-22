import { ArrowRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import HeroMockup from "../components/HeroMockup.jsx";
import Link from "../components/Link.jsx";
import { fadeUp, stagger } from "../components/Motion.jsx";
import { stats } from "../data/siteData.js";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-32 sm:pt-36">
      <div className="absolute inset-0 bg-hero-grid bg-[length:44px_44px] opacity-70" />
      <div className="noise-overlay absolute inset-x-0 top-0 h-80" />
      <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute right-0 top-32 h-[30rem] w-[30rem] rounded-full bg-purple-500/15 blur-3xl" />
      <div className="container-xl relative grid min-h-[calc(100vh-9rem)] items-center gap-16 pb-20 lg:grid-cols-[1fr_.95fr]">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
          <motion.span variants={fadeUp} className="eyebrow">
            Premium web design agency
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            Premium websites built to help businesses{" "}
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              grow online
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            We craft modern, lightning-fast websites that convert visitors into customers. From stunning designs to
            seamless functionality, your digital presence, elevated.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/projects" className="blue-button">
              View Projects <ArrowRight size={17} />
            </Link>
            <Link href="/contact" className="ghost-button">
              <CalendarDays size={17} /> Book a Call
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-white/10 pt-7">
            {stats.map((item) => (
              <div key={item.label} className="border-r border-white/10 last:border-r-0">
                <div className="text-2xl font-black text-white sm:text-3xl">{item.value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <HeroMockup />
      </div>
    </section>
  );
}
