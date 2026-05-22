import Link from "./Link.jsx";

export default function Logo({ compact = false }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-blue-300/30 bg-blue-500/15 shadow-glow">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,.55),transparent_38%)]" />
        <span className="relative font-display text-lg font-bold tracking-tight text-white">XK</span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          xander<span className="text-blue-300">kreativ</span>
        </span>
      )}
    </Link>
  );
}
