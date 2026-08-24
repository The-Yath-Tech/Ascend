import { Request, Response } from "express";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";
import { getLatestOrComputeDIS, computeDISGrowth } from "@/services/disService";

/**
 * Parent-facing monthly report: star ratings on Confidence, Leadership,
 * Decision Making, Teamwork, Respect (derived from Player DNA), plus
 * attendance rate and the Development Intelligence Score (DIS™) — not
 * goals scored.
 */
export const playerMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.playerId },
    include: { dna: true, attendances: true, badges: { include: { badge: true } }, team: true },
  });
  if (!player) throw new ApiError(404, "Player not found");

  const attendanceRate =
    player.attendances.length > 0
      ? Math.round((player.attendances.filter((a) => a.present).length / player.attendances.length) * 100)
      : null;

  const toStars = (v?: number) => (v ? Math.round(v / 20) : 0); // 0-100 -> 0-5 stars

  const [dis, disGrowth] = await Promise.all([
    getLatestOrComputeDIS(player.id),
    computeDISGrowth(player.id, 90),
  ]);

  res.json({
    player: { id: player.id, name: player.name, team: player.team?.name },
    period: "last_30_days",
    stars: {
      confidence: toStars(player.dna?.confidence),
      leadership: toStars(player.dna?.leadership),
      decisionMaking: toStars(player.dna?.decisionMaking),
      teamwork: toStars(player.dna?.teamwork),
      discipline: toStars(player.dna?.discipline),
    },
    attendanceRatePercent: attendanceRate,
    overallXP: player.overallXP,
    level: player.level,
    badgesEarned: player.badges.map((b) => b.badge.title),
    developmentIntelligenceScore: {
      overall: dis.overallScore,
      pillars: {
        technical: dis.technical,
        tactical: dis.tactical,
        physical: dis.physical,
        character: dis.character,
        participation: dis.participation,
        learningProgression: dis.learningProgression,
      },
      growthLast90Days: disGrowth.growth,
    },
  });
});

/** Long-term "digital player passport" — full history in one payload. */
export const playerPassport = asyncHandler(async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.playerId },
    include: {
      dna: true,
      badges: { include: { badge: true }, orderBy: { earnedAt: "asc" } },
      xpLogs: { orderBy: { createdAt: "asc" } },
      attendances: { include: { session: true }, orderBy: { session: { date: "asc" } } },
      questCompletions: { include: { quest: true } },
      homeChallenges: { orderBy: { createdAt: "asc" } },
      disSnapshots: { orderBy: { computedAt: "asc" } },
      assessments: { orderBy: { createdAt: "desc" } },
      developmentGoals: { orderBy: { createdAt: "desc" } },
      observations: { orderBy: { createdAt: "desc" }, take: 20 },
      team: true,
    },
  });
  if (!player) throw new ApiError(404, "Player not found");
  res.json(player);
});

/** Team-wide XP leaderboard + attendance summary for the coach dashboard. */
export const teamOverview = asyncHandler(async (req: Request, res: Response) => {
  const players = await prisma.player.findMany({
    where: { teamId: req.params.teamId },
    include: { dna: true, badges: true },
    orderBy: { overallXP: "desc" },
  });
  res.json({
    teamId: req.params.teamId,
    playerCount: players.length,
    leaderboard: players.map((p) => ({
      id: p.id,
      name: p.name,
      xp: p.overallXP,
      level: p.level,
      badgeCount: p.badges.length,
    })),
  });
});
