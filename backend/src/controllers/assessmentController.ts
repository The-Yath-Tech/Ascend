import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";
import { computeAndSaveDIS } from "@/services/disService";

const assessmentSchema = z.object({
  playerId: z.string(),
  coachId: z.string(),
  period: z.enum(["PRESEASON", "MIDSEASON", "POSTSEASON", "ADHOC"]).optional(),
  technical: z.number().int().min(0).max(100),
  decisionMaking: z.number().int().min(0).max(100),
  physical: z.number().int().min(0).max(100),
  leadership: z.number().int().min(0).max(100),
  confidence: z.number().int().min(0).max(100),
  creativity: z.number().int().min(0).max(100),
  resilience: z.number().int().min(0).max(100),
  teamwork: z.number().int().min(0).max(100),
  discipline: z.number().int().min(0).max(100),
  summary: z.string().optional(),
});

export const listAssessments = asyncHandler(async (req: Request, res: Response) => {
  const { playerId } = req.query;
  const assessments = await prisma.assessment.findMany({
    where: playerId ? { playerId: String(playerId) } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(assessments);
});

/**
 * The recommended way to move a player's development profile: this is the
 * rubric-based path (vs directly PATCHing PlayerDNA). Creating an
 * assessment (1) records the evidence permanently, (2) updates the
 * player's current PlayerDNA to the submitted values, and (3) recomputes
 * and saves a fresh DIS™ snapshot so the score history reflects the change.
 */
export const createAssessment = asyncHandler(async (req: Request, res: Response) => {
  const input = assessmentSchema.parse(req.body);

  const player = await prisma.player.findUnique({ where: { id: input.playerId } });
  if (!player) throw new ApiError(404, "Player not found");

  const [assessment] = await prisma.$transaction([
    prisma.assessment.create({ data: input }),
    prisma.playerDNA.upsert({
      where: { playerId: input.playerId },
      update: {
        technical: input.technical,
        decisionMaking: input.decisionMaking,
        physical: input.physical,
        leadership: input.leadership,
        confidence: input.confidence,
        creativity: input.creativity,
        resilience: input.resilience,
        teamwork: input.teamwork,
        discipline: input.discipline,
      },
      create: {
        playerId: input.playerId,
        technical: input.technical,
        decisionMaking: input.decisionMaking,
        physical: input.physical,
        leadership: input.leadership,
        confidence: input.confidence,
        creativity: input.creativity,
        resilience: input.resilience,
        teamwork: input.teamwork,
        discipline: input.discipline,
      },
    }),
  ]);

  const disSnapshot = await computeAndSaveDIS(input.playerId);

  res.status(201).json({ assessment, disSnapshot });
});
