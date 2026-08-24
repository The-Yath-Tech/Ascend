export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-kingdom-navy">Coach Overview</h1>
      <p className="mt-2 text-slate-500">
        Log a session, complete a quest, and let the Assistant Coach draft
        feedback and parent reports for you.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a href="/dashboard/sessions" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="font-semibold text-kingdom-navy">Start a Mission</h2>
          <p className="mt-1 text-sm text-slate-500">Log today's training session and quest.</p>
        </a>
        <a href="/dashboard/players" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="font-semibold text-kingdom-navy">Player Passports</h2>
          <p className="mt-1 text-sm text-slate-500">View XP, badges, and Player DNA.</p>
        </a>
        <a href="/dashboard/leaderboard" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="font-semibold text-kingdom-navy">Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-500">See who's earned the most XP this season.</p>
        </a>
      </div>
    </div>
  );
}
