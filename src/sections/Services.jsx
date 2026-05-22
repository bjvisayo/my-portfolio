import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, fadeUp, stagger } from "../components/Motion.jsx";
import Link from "../components/Link.jsx";
import { services } from "../data/siteData.js";

export default function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,.16),transparent_34%)]" />
      <div className="container-xl relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Our services</span>
          <h2 className="section-title">What we can do for you</h2>
          <p className="section-copy mx-auto">
            From concept to launch, we provide end-to-end web solutions that drive growth and deliver measurable results.
          </p>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map(({ icon: Icon, title, description, features }) => (
            <motion.article variants={fadeUp} key={title} className="premium-card min-h-[300px]">
              <span className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                <Icon size={22} />
              </span>
              <h3 className="text-xl font-extrabold">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Check size={16} className="text-cyan-300" /> {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
          <motion.article
            variants={fadeUp}
            className="flex min-h-[300px] flex-col justify-center rounded-[1.5rem] border border-blue-300/30 bg-gradient-to-br from-blue-500/25 to-purple-500/20 p-8 text-center shadow-glow"
          >
            <h3 className="text-2xl font-extrabold">Need something custom?</h3>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Tell us what you are building and we will shape a smart scope around your goals.
            </p>
            <Link href="/contact" className="blue-button mx-auto mt-7">
              Get in Touch <ArrowRight size={17} />
            </Link>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
