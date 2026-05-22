import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, fadeUp, stagger } from "../components/Motion.jsx";
import Link from "../components/Link.jsx";
import { processSteps } from "../data/siteData.js";

export default function Process() {
  return (
    <section id="process" className="relative border-y border-white/10 bg-[#0E1A2B] py-24 sm:py-32">
      <div className="container-xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Our process</span>
          <h2 className="section-title">How we work together</h2>
          <p className="section-copy mx-auto">A clear, proven methodology that keeps momentum high and decisions simple.</p>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative mt-16 grid gap-6 lg:grid-cols-5"
        >
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent lg:block" />
          {processSteps.map(({ icon: Icon, title, body }, index) => (
            <motion.article variants={fadeUp} key={title} className="relative text-center">
              <div className="relative z-10 mx-auto grid h-20 w-20 place-items-center rounded-full border border-blue-300/35 bg-ink shadow-glow">
                <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full border border-cyan-300/40 bg-blue-500/20 text-sm font-black text-cyan-100">
                  {index + 1}
                </span>
                <Icon size={25} className="text-blue-200" />
              </div>
              <h3 className="mt-6 text-lg font-extrabold">{title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-300">{body}</p>
            </motion.article>
          ))}
        </motion.div>
        <Reveal className="mt-12 text-center">
          <Link href="/contact" className="ghost-button">
            Learn more about our process <ArrowRight size={17} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
