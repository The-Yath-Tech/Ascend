"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface AiResult {
  summary: string;
  questCompletedGuess: boolean;
  playerResults: { playerName: string; sentiment: string; suggestedXP: number; parentMessage: string }[];
}

export default function SessionsPage() {
  // NOTE: in the seeded demo, replace with a real session id fetched from
  // GET /sessions (kept as a manual field here to keep the scaffold simple).
  const [sessionId, setSessionId] = useState("");
  const [note, setNote] = useState(
    "Training went well. James showed leadership. Mercy struggled with passing but improved toward the end. Everyone completed the Dragon Quest."
  );
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch<AiResult>("/ai/session-note", {
        method: "POST",
        body: JSON.stringify({ sessionId, note }),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-kingdom-navy">Assistant Coach</h1>
      <p className="mt-1 text-sm text-slate-500">
        A 60-second note replaces 30 minutes of paperwork. Paste or dictate what
        happened — XP, badges, and parent messages are generated automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Session ID</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Paste a session id from GET /api/sessions"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Coach's note</label>
          <textarea
            className="h-32 w-full rounded-md border border-slate-300 px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-kingdom-navy px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze & Apply"}
        </button>
      </form>

      {result && (
        <div className="mt-8 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-kingdom-navy">Summary</h2>
          <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
          <p className="mt-2 text-xs text-slate-400">
            Quest completed guess: {result.questCompletedGuess ? "Yes" : "No"}
          </p>

          <h3 className="mt-4 font-semibold text-kingdom-navy">Player feedback</h3>
          <ul className="mt-2 space-y-3">
            {result.playerResults.map((p, i) => (
              <li key={i} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-medium">
                  {p.playerName} — +{p.suggestedXP} XP ({p.sentiment})
                </p>
                <p className="mt-1 text-slate-500">{p.parentMessage}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
