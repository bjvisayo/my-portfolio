import {
  ArrowUpRight,
  BarChart3,
  Blocks,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Cpu,
  ExternalLink,
  Gauge,
  Globe2,
  HeartHandshake,
  LayoutDashboard,
  Mail,
  MapPin,
  MonitorSmartphone,
  Palette,
  PenTool,
  Rocket,
  SearchCheck,
  Send,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  WandSparkles,
  Zap,
} from "lucide-react";

export const navLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "24/7", label: "Support Available" },
];

export const whyCards = [
  {
    icon: WandSparkles,
    title: "Modern UI/UX",
    body: "Sophisticated interfaces shaped around clarity, trust, and frictionless customer journeys.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    body: "Every layout is tuned for phones, tablets, laptops, and the moments buyers decide fast.",
  },
  {
    icon: Zap,
    title: "Fast Performance",
    body: "Lean builds, optimized assets, and smooth interactions that keep visitors engaged.",
  },
  {
    icon: Target,
    title: "Conversion Focused",
    body: "Strategic calls to action and messaging that turn traffic into qualified opportunities.",
  },
];

export const projects = [
  {
    title: "Luxe Boutique",
    category: "Ecommerce Design",
    description: "A polished retail storefront with refined product storytelling and seamless checkout paths.",
    visual: "project-visual-1",
  },
  {
    title: "CloudSync Pro",
    category: "SaaS Landing Page",
    description: "A conversion-led SaaS experience designed to explain value quickly and increase demos.",
    visual: "project-visual-2",
  },
  {
    title: "Ember & Oak",
    category: "Restaurant Website",
    description: "A warm, high-end hospitality site with reservations, menus, and local search foundations.",
    visual: "project-visual-3",
  },
  {
    title: "Horizon Properties",
    category: "Real Estate Platform",
    description: "A luxury property showcase with guided browsing, trust signals, and lead capture.",
    visual: "project-visual-4",
  },
];

export const services = [
  {
    icon: Palette,
    title: "Website Design",
    description: "Custom, visually striking websites tailored to your brand identity and business goals.",
    features: ["Custom layouts", "Brand consistency", "UX optimization"],
  },
  {
    icon: Rocket,
    title: "Landing Pages",
    description: "High-converting pages built for campaigns, launches, waitlists, and paid traffic.",
    features: ["A/B testing ready", "Lead capture forms", "Conversion copy flow"],
  },
  {
    icon: ShoppingBag,
    title: "Shopify Optimization",
    description: "Turn your Shopify store into a sharper conversion machine with premium refinements.",
    features: ["Custom themes", "Checkout optimization", "App integrations"],
  },
  {
    icon: PenTool,
    title: "Website Redesign",
    description: "Modernize your existing website with a fresh design that better serves your users.",
    features: ["UI/UX overhaul", "Content strategy", "SEO preservation"],
  },
  {
    icon: Gauge,
    title: "Performance Optimization",
    description: "Improve speed, stability, Core Web Vitals, and overall visitor experience.",
    features: ["Core Web Vitals", "Image optimization", "Code minification"],
  },
];

export const processSteps = [
  { icon: Compass, title: "Discovery", body: "We learn your goals, audience, offers, and what the site needs to achieve." },
  { icon: SearchCheck, title: "Strategy", body: "We map the structure, conversion flow, content priorities, and visual direction." },
  { icon: LayoutDashboard, title: "Design", body: "We craft modern mockups and prototypes that bring the brand experience to life." },
  { icon: Code2, title: "Development", body: "We build clean, responsive pages with performance and scalability in mind." },
  { icon: Rocket, title: "Launch", body: "We test, refine, launch, and support your site with care after go-live." },
];

export const contactCards = [
  { icon: Mail, label: "Email", value: "hello@xanderkreativ.com" },
  { icon: Bot, label: "WhatsApp", value: "Chat with us instantly" },
  { icon: Clock, label: "Business Hours", value: "Mon-Fri: 9AM - 6PM" },
];

export const footerSocials = [BriefcaseBusiness, Globe2, BarChart3, Blocks];
export const miscIcons = { ArrowUpRight, CheckCircle2, ExternalLink, HeartHandshake, MapPin, MonitorSmartphone, Send, Sparkles, Cpu };
