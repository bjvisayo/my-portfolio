import { ArrowRight } from "lucide-react";
import Link from "../components/Link.jsx";
import Logo from "../components/Logo.jsx";
import { footerSocials, navLinks, services } from "../data/siteData.js";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07111F]">
      <div className="container-xl grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.9fr_.9fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            Premium web design and development for businesses that want a sharper, faster, more profitable digital presence.
          </p>
          <div className="mt-6 flex gap-3">
            {footerSocials.map((Icon, index) => (
              <Link
                key={index}
                href="/contact"
                aria-label="Social link"
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-blue-300/40 hover:text-white"
              >
                <Icon size={17} />
              </Link>
            ))}
          </div>
        </div>
        <FooterColumn title="Navigation" links={[{ label: "Home", href: "/" }, ...navLinks, { label: "Admin", href: "/admin" }]} />
        <FooterColumn title="Services" links={services.map((service) => ({ label: service.title, href: "/services" }))} />
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Get in Touch</h3>
          <div className="mt-5 space-y-3 text-sm font-semibold text-slate-400">
            <p>hello@xanderkreativ.com</p>
            <p>WhatsApp Chat</p>
            <p>Mon-Fri: 9AM - 6PM</p>
          </div>
          <Link href="/contact" className="blue-button mt-6 py-2.5">
            Get a Quote <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <div className="container-xl flex flex-col justify-between gap-4 text-xs font-semibold text-slate-500 sm:flex-row">
          <p>© 2026 Xander Kreativ. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <Link key={`${title}-${link.label}`} href={link.href} className="block text-sm font-semibold text-slate-400 transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
