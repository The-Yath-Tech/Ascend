import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { awardXP } from "@/services/xpService";
import { XP_RULES } from "@/utils/xp";

const questSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  type: z
    .enum(["PASSING", "DRIBBLING", "SHOOTING", "DEFENDING", "TEAMWORK", "POSSESSION", "CUSTOM"])
    .optional(),
  targetValue: z.number().int().optional(),
  livesTotal: z.number().int().optional(),
});

export const listQuests = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.query;
  const quests = await prisma.quest.findMany({
    where: sessionId ? { sessionId: String(sessionId) } : undefined,
    include: { completions: true },
  });
  res.json(quests);
});

export const createQuest = asyncHandler(async (req: Request, res: Response) => {
  const input = questSchema.parse(req.body);
  const quest = await prisma.quest.create({ data: input });
  res.status(201).json(quest);
});

const completeSchema = z.object({
  playerId: z.string(),
  valueAchieved: z.number().int().optional(),
});

// Marks a quest complete for a player and awards the standard quest XP.
export const completeQuest = asyncHandler(async (req: Request, res: Response) => {
  const { playerId, valueAchieved } = completeSchema.parse(req.body);
  const questId = req.params.id;

  const completion = await prisma.questCompletion.upsert({
    where: { questId_playerId: { questId, playerId } },
    update: { completed: true, valueAchieved, completedAt: new Date() },
    create: { questId, playerId, completed: true, valueAchieved, completedAt: new Date() },
  });

  const xp = await awardXP(playerId, XP_RULES.QUEST_COMPLETED, "Quest completed", "coach");

  res.status(201).json({ completion, xp });
});
