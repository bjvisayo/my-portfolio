import { motion } from "framer-motion";
import { Reveal, fadeUp, stagger } from "../components/Motion.jsx";
import { whyCards } from "../data/siteData.js";

export default function WhyChooseUs() {
  return (
    <section className="relative border-y border-white/10 bg-[#091625] py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
      <div className="container-xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Why choose us</span>
          <h2 className="section-title">Everything you need to succeed online</h2>
          <p className="section-copy mx-auto">
            We combine high-end creative direction with technical excellence to deliver websites that drive real business results.
          </p>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {whyCards.map(({ icon: Icon, title, body }) => (
            <motion.article variants={fadeUp} key={title} className="premium-card group">
              <span className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-glow">
                <Icon size={24} />
              </span>
              <h3 className="text-xl font-extrabold">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
