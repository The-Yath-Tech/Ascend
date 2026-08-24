"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Row {
  id: string;
  name: string;
  overallXP: number;
  level: string;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Row[]>("/xp/leaderboard")
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-kingdom-navy">Leaderboard</h1>
      <p className="mt-1 text-sm text-slate-500">Every child earns XP — not just goals scored.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <table className="mt-6 w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-sm shadow-sm">
        <thead className="bg-kingdom-navy text-white">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Player</th>
            <th className="px-4 py-2">Level</th>
            <th className="px-4 py-2">XP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2 font-medium">{r.name}</td>
              <td className="px-4 py-2">{r.level}</td>
              <td className="px-4 py-2">{r.overallXP}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
