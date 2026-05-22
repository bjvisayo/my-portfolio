import { Menu, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import Link from "./Link.jsx";
import Logo from "./Logo.jsx";
import { navLinks } from "../data/siteData.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const padding = useTransform(scrollY, [0, 120], [18, 10]);

  return (
    <motion.header
      style={{ paddingTop: padding, paddingBottom: padding }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-ink/55 backdrop-blur-2xl"
    >
      <nav className="container-xl flex items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-300 transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/contact" className="blue-button py-2.5">
            Get Your Website Quote
          </Link>
        </div>
        <button
          aria-label="Open navigation"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-xl mt-4 lg:hidden"
        >
          <div className="glass-card rounded-3xl p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="blue-button mt-3 w-full">
              Get Your Website Quote
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
