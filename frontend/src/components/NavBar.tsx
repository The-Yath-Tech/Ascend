"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/players", label: "Players" },
  { href: "/dashboard/sessions", label: "Sessions" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-kingdom-navy px-6 py-4 text-white">
      <span className="text-lg font-bold text-kingdom-gold">⚽ ASCEND</span>
      <div className="flex gap-6 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "font-semibold text-kingdom-gold" : "text-slate-200"}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => {
          clearToken();
          router.push("/login");
        }}
        className="text-sm text-slate-300 hover:text-white"
      >
        Sign out
      </button>
    </nav>
  );
}
