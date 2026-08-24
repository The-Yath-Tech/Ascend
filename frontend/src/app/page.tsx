import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-kingdom-navy px-6 text-center text-white">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Agora Systems</p>
      <h1 className="mt-2 text-4xl font-bold text-kingdom-gold">⚽ ASCEND</h1>
      <p className="mt-1 text-sm text-slate-300">Global Youth Development Intelligence Platform</p>
      <p className="mt-4 max-w-xl text-lg text-slate-200">
        Football Quest turns training into an adventure. Every child becomes
        the hero of their own story — quests, XP, badges, and a Development
        Intelligence Score (DIS™) that tracks growth over a lifetime, not just goals scored.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-lg bg-kingdom-gold px-6 py-3 font-semibold text-kingdom-navy hover:opacity-90"
      >
        Enter the Kingdom
      </Link>
    </main>
  );
}
