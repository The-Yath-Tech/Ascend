import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { GoalStatus } from "@prisma/client";

const goalSchema = z.object({
  playerId: z.string(),
  setByCoachId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  targetDate: z.coerce.date().optional(),
});

const GOAL_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ACHIEVED", "MISSED"] as const;

export const listGoals = asyncHandler(async (req: Request, res: Response) => {
  const { playerId, status } = req.query;
  const parsedStatus =
    typeof status === "string" && (GOAL_STATUSES as readonly string[]).includes(status)
      ? (status as GoalStatus)
      : undefined;

  const goals = await prisma.developmentGoal.findMany({
    where: {
      ...(playerId ? { playerId: String(playerId) } : {}),
      ...(parsedStatus ? { status: parsedStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(goals);
});

export const createGoal = asyncHandler(async (req: Request, res: Response) => {
  const input = goalSchema.parse(req.body);
  const goal = await prisma.developmentGoal.create({ data: input });
  res.status(201).json(goal);
});

const statusSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "ACHIEVED", "MISSED"]),
});

export const updateGoalStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = statusSchema.parse(req.body);
  const goal = await prisma.developmentGoal.update({ where: { id: req.params.id }, data: { status } });
  res.json(goal);
});

export const deleteGoal = asyncHandler(async (req: Request, res: Response) => {
  await prisma.developmentGoal.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

/** Development Goal Achievement rate — named KPI in the Success Metrics chapter. */
export const goalAchievementRate = asyncHandler(async (req: Request, res: Response) => {
  const goals = await prisma.developmentGoal.findMany({ where: { playerId: req.params.playerId } });
  if (goals.length === 0) {
    return res.json({ playerId: req.params.playerId, totalGoals: 0, achievementRatePercent: null });
  }
  const achieved = goals.filter((g) => g.status === "ACHIEVED").length;
  res.json({
    playerId: req.params.playerId,
    totalGoals: goals.length,
    achieved,
    achievementRatePercent: Math.round((achieved / goals.length) * 100),
  });
});
