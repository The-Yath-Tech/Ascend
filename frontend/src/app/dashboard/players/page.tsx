"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Player } from "@/types";

const LEVEL_BADGE: Record<Player["level"], string> = {
  EXPLORER: "⚽ Explorer",
  WARRIOR: "🛡 Warrior",
  CAPTAIN: "👑 Captain",
  STRATEGIST: "🧠 Strategist",
  LEGEND: "⭐ Legend",
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Player[]>("/players")
      .then(setPlayers)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-kingdom-navy">Players</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <a
            key={p.id}
            href={`/dashboard/players/${p.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-kingdom-navy">{p.name}</h3>
              <span className="text-xs font-medium text-kingdom-gold">{LEVEL_BADGE[p.level]}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{p.overallXP} XP</p>

            {p.dna && (
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                <li>Leadership: {p.dna.leadership}%</li>
                <li>Confidence: {p.dna.confidence}%</li>
                <li>Teamwork: {p.dna.teamwork}%</li>
              </ul>
            )}
          </a>
        ))}
        {players.length === 0 && !error && (
          <p className="text-sm text-slate-400">No players yet — run the seed script or add one via the API.</p>
        )}
      </div>
    </div>
  );
}
