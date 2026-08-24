"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { PlayerPassport } from "@/types";
import DnaBar from "@/components/DnaBar";

const LEVEL_LABEL: Record<string, string> = {
  EXPLORER: "⚽ Explorer",
  WARRIOR: "🛡 Warrior",
  CAPTAIN: "👑 Captain",
  STRATEGIST: "🧠 Strategist",
  LEGEND: "⭐ Legend",
};

export default function PlayerPassportPage() {
  const params = useParams<{ id: string }>();
  const [passport, setPassport] = useState<PlayerPassport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    apiFetch<PlayerPassport>(`/reports/player/${params.id}/passport`)
      .then(setPassport)
      .catch((e) => setError(e.message));
  }, [params?.id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!passport) return <p className="text-sm text-slate-400">Loading passport...</p>;

  const attendanceRate =
    passport.attendances.length > 0
      ? Math.round(
          (passport.attendances.filter((a) => a.present).length / passport.attendances.length) * 100
        )
      : null;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-kingdom-navy">{passport.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {passport.team?.name ?? "Unassigned"} · {passport.position ?? "Position TBD"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-kingdom-gold">{LEVEL_LABEL[passport.level]}</p>
          <p className="text-2xl font-bold text-kingdom-navy">{passport.overallXP} XP</p>
        </div>
      </div>

      {/* Development Intelligence Score (DIS™) */}
      {passport.disSnapshots.length > 0 && (() => {
        const latest = passport.disSnapshots[passport.disSnapshots.length - 1];
        const earliest = passport.disSnapshots[0];
        const growth = latest.overallScore - earliest.overallScore;
        return (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-kingdom-navy">Development Intelligence Score (DIS™)</h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-kingdom-navy">{latest.overallScore}</p>
                {passport.disSnapshots.length > 1 && (
                  <p className={`text-xs ${growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)} since first snapshot
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DnaBar label="Technical" value={latest.technical} />
              <DnaBar label="Tactical" value={latest.tactical} />
              <DnaBar label="Physical" value={latest.physical} />
              <DnaBar label="Character" value={latest.character} />
              <DnaBar label="Participation" value={latest.participation} />
              <DnaBar label="Learning Progression" value={latest.learningProgression} />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Weighted composite — technical 20%, character 20%, tactical 15%, physical 15%,
              participation 15%, learning progression 15%. Last computed{" "}
              {new Date(latest.computedAt).toLocaleDateString()}.
            </p>
          </div>
        );
      })()}

      {/* Player DNA */}
      {passport.dna && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-kingdom-navy">Player DNA</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DnaBar label="Technical" value={passport.dna.technical} />
            <DnaBar label="Decision Making" value={passport.dna.decisionMaking} />
            <DnaBar label="Physical" value={passport.dna.physical} />
            <DnaBar label="Leadership" value={passport.dna.leadership} />
            <DnaBar label="Confidence" value={passport.dna.confidence} />
            <DnaBar label="Creativity" value={passport.dna.creativity} />
            <DnaBar label="Resilience" value={passport.dna.resilience} />
            <DnaBar label="Teamwork" value={passport.dna.teamwork} />
            <DnaBar label="Discipline" value={passport.dna.discipline} />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-kingdom-navy">{passport.badges.length}</p>
          <p className="text-xs text-slate-500">Badges</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-kingdom-navy">
            {attendanceRate !== null ? `${attendanceRate}%` : "—"}
          </p>
          <p className="text-xs text-slate-500">Attendance</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-kingdom-navy">
            {passport.questCompletions.filter((q) => q.completed).length}
          </p>
          <p className="text-xs text-slate-500">Quests completed</p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-kingdom-navy">Badge cabinet</h2>
        {passport.badges.length === 0 ? (
          <p className="text-sm text-slate-400">No badges earned yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {passport.badges.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
                title={b.badge.description ?? undefined}
              >
                <span>{b.badge.icon ?? "🏅"}</span>
                <span>{b.badge.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XP timeline */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-kingdom-navy">XP timeline</h2>
        {passport.xpLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No XP logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {[...passport.xpLogs].reverse().slice(0, 15).map((log) => (
              <li key={log.id} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                <span className="text-slate-600">{log.reason}</span>
                <span className="font-medium text-kingdom-navy">+{log.points} XP</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Development goals */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-kingdom-navy">Development goals</h2>
        {passport.developmentGoals.length === 0 ? (
          <p className="text-sm text-slate-400">No goals set yet.</p>
        ) : (
          <ul className="space-y-2">
            {passport.developmentGoals.map((g) => (
              <li key={g.id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{g.title}</p>
                  {g.description && <p className="text-xs text-slate-500">{g.description}</p>}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    g.status === "ACHIEVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : g.status === "MISSED"
                      ? "bg-red-100 text-red-600"
                      : g.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {g.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Coach observations */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-kingdom-navy">Coach observations</h2>
        {passport.observations.length === 0 ? (
          <p className="text-sm text-slate-400">No observations logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {passport.observations.map((o) => (
              <li key={o.id} className="text-sm">
                <p className="text-slate-600">{o.note}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(o.createdAt).toLocaleDateString()}
                  {o.tags.length > 0 && ` · ${o.tags.join(", ")}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Home challenges */}
      <div className="mt-6 mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-kingdom-navy">Home challenges</h2>
        {passport.homeChallenges.length === 0 ? (
          <p className="text-sm text-slate-400">No home challenge submissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {passport.homeChallenges.map((h) => (
              <li key={h.id} className="flex justify-between text-sm">
                <span className="text-slate-600">{h.title}</span>
                <span className="font-medium text-kingdom-navy">+{h.xpAwarded} XP</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
