import { prisma } from "@/prismaClient";

/**
 * DISService — computes the Development Intelligence Score (DIS™).
 *
 * Per Volume I, Ch. 9: DIS™ is not a single opaque rating. It's a
 * transparent, weighted composite of six pillars:
 *   Technical · Tactical · Physical · Character · Participation · Learning Progression
 *
 * Every score this service returns includes the pillar breakdown and the
 * exact weights used, so any dashboard (coach, parent, club, federation)
 * can explain *why* a player's DIS moved — this is what "Explainability
 * Coverage" in the AI Performance Metrics chapter refers to.
 *
 * Snapshots are stored (DISSnapshot) rather than overwritten in place, so
 * "DIS™ Growth" trend charts have real history to draw from.
 */

export const DIS_WEIGHTS = {
  technical: 0.2,
  tactical: 0.15,
  physical: 0.15,
  character: 0.2,
  participation: 0.15,
  learningProgression: 0.15,
} as const;

export interface DISBreakdown {
  technical: number;
  tactical: number;
  physical: number;
  character: number;
  participation: number;
  learningProgression: number;
  overallScore: number;
  weightsUsed: typeof DIS_WEIGHTS;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Attendance rate over a player's full history, 0-100. */
async function computeParticipation(playerId: string): Promise<number> {
  const attendances = await prisma.attendance.findMany({ where: { playerId } });
  if (attendances.length === 0) return 50; // neutral default for brand-new players
  const present = attendances.filter((a) => a.present).length;
  return clamp((present / attendances.length) * 100);
}

/**
 * Learning progression blends two signals:
 *  - XP momentum: XP earned in the last 30 days vs the 30 days before that
 *    (rewards players who are actively improving, not just tenured ones).
 *  - Quest completion rate: share of assigned quests actually completed.
 */
async function computeLearningProgression(playerId: string): Promise<number> {
  const now = new Date();
  const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const day60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [recentLogs, priorLogs, completions] = await Promise.all([
    prisma.xPLog.findMany({ where: { playerId, createdAt: { gte: day30 } } }),
    prisma.xPLog.findMany({ where: { playerId, createdAt: { gte: day60, lt: day30 } } }),
    prisma.questCompletion.findMany({ where: { playerId } }),
  ]);

  const recentXP = recentLogs.reduce((s, l) => s + l.points, 0);
  const priorXP = priorLogs.reduce((s, l) => s + l.points, 0);

  // Momentum score: 50 = flat, >50 = accelerating, <50 = slowing down.
  let momentum: number;
  if (priorXP === 0 && recentXP === 0) momentum = 50;
  else if (priorXP === 0) momentum = 75; // new/renewed activity with nothing to compare against
  else momentum = clamp(50 + ((recentXP - priorXP) / Math.max(priorXP, 1)) * 50);

  const questRate =
    completions.length > 0
      ? clamp((completions.filter((c) => c.completed).length / completions.length) * 100)
      : 50;

  return clamp(momentum * 0.6 + questRate * 0.4);
}

function computeCharacter(dna: {
  leadership: number;
  confidence: number;
  creativity: number;
  resilience: number;
  teamwork: number;
  discipline: number;
}): number {
  const values = [dna.leadership, dna.confidence, dna.creativity, dna.resilience, dna.teamwork, dna.discipline];
  return clamp(values.reduce((s, v) => s + v, 0) / values.length);
}

/** Computes a fresh DIS breakdown for a player without persisting it. */
export async function computeDISBreakdown(playerId: string): Promise<DISBreakdown> {
  const dna = await prisma.playerDNA.findUnique({ where: { playerId } });
  if (!dna) {
    throw new Error(`No PlayerDNA found for player ${playerId} — cannot compute DIS`);
  }

  const [participation, learningProgression] = await Promise.all([
    computeParticipation(playerId),
    computeLearningProgression(playerId),
  ]);

  const technical = clamp(dna.technical);
  const tactical = clamp(dna.decisionMaking);
  const physical = clamp(dna.physical);
  const character = computeCharacter(dna);

  const overallScore = clamp(
    technical * DIS_WEIGHTS.technical +
      tactical * DIS_WEIGHTS.tactical +
      physical * DIS_WEIGHTS.physical +
      character * DIS_WEIGHTS.character +
      participation * DIS_WEIGHTS.participation +
      learningProgression * DIS_WEIGHTS.learningProgression
  );

  return {
    technical,
    tactical,
    physical,
    character,
    participation,
    learningProgression,
    overallScore,
    weightsUsed: DIS_WEIGHTS,
  };
}

/** Computes and persists a DIS snapshot (used for trend/history charts). */
export async function computeAndSaveDIS(playerId: string) {
  const breakdown = await computeDISBreakdown(playerId);
  const snapshot = await prisma.dISSnapshot.create({
    data: {
      playerId,
      technical: breakdown.technical,
      tactical: breakdown.tactical,
      physical: breakdown.physical,
      character: breakdown.character,
      participation: breakdown.participation,
      learningProgression: breakdown.learningProgression,
      overallScore: breakdown.overallScore,
      weightsUsed: breakdown.weightsUsed,
    },
  });
  return snapshot;
}

/** Latest snapshot, or a freshly computed (unsaved) one if none exist yet. */
export async function getLatestOrComputeDIS(playerId: string) {
  const latest = await prisma.dISSnapshot.findFirst({
    where: { playerId },
    orderBy: { computedAt: "desc" },
  });
  if (latest) return latest;
  return computeAndSaveDIS(playerId);
}

/** DIS™ Growth — the signature KPI from the Success Metrics chapter. */
export async function computeDISGrowth(playerId: string, sinceDays = 90) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const [earliest, latest] = await Promise.all([
    prisma.dISSnapshot.findFirst({
      where: { playerId, computedAt: { gte: since } },
      orderBy: { computedAt: "asc" },
    }),
    prisma.dISSnapshot.findFirst({ where: { playerId }, orderBy: { computedAt: "desc" } }),
  ]);

  if (!earliest || !latest) return { growth: null, from: null, to: null };

  return {
    growth: latest.overallScore - earliest.overallScore,
    from: earliest,
    to: latest,
  };
}
