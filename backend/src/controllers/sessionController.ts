import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";
import { awardXP } from "@/services/xpService";
import { XP_RULES } from "@/utils/xp";

const createSessionSchema = z.object({
  teamId: z.string(),
  date: z.coerce.date().optional(),
  theme: z.string().min(2),
  durationMinutes: z.number().int().positive().optional(),
  coachNote: z.string().optional(),
  quest: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      type: z
        .enum(["PASSING", "DRIBBLING", "SHOOTING", "DEFENDING", "TEAMWORK", "POSSESSION", "CUSTOM"])
        .optional(),
      targetValue: z.number().int().optional(),
      livesTotal: z.number().int().optional(),
    })
    .optional(),
  presentPlayerIds: z.array(z.string()).optional(),
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.query;
  const sessions = await prisma.session.findMany({
    where: teamId ? { teamId: String(teamId) } : undefined,
    include: { quests: true, attendances: true },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: {
      quests: { include: { completions: true } },
      attendances: { include: { player: true } },
      team: true,
    },
  });
  if (!session) throw new ApiError(404, "Session not found");
  res.json(session);
});

/**
 * Creates a training session ("mission"), optionally its quest, and
 * attendance in one call, then auto-awards attendance XP to keep the coach's
 * post-session workflow to a couple of taps.
 */
export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const input = createSessionSchema.parse(req.body);

  const session = await prisma.session.create({
    data: {
      teamId: input.teamId,
      date: input.date,
      theme: input.theme,
      durationMinutes: input.durationMinutes,
      coachNote: input.coachNote,
      quests: input.quest ? { create: [input.quest] } : undefined,
    },
    include: { quests: true },
  });

  if (input.presentPlayerIds?.length) {
    await prisma.attendance.createMany({
      data: input.presentPlayerIds.map((playerId) => ({
        sessionId: session.id,
        playerId,
        present: true,
      })),
      skipDuplicates: true,
    });

    for (const playerId of input.presentPlayerIds) {
      await awardXP(playerId, XP_RULES.ATTENDANCE, "Attendance", "system");
    }
  }

  res.status(201).json(session);
});

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const input = createSessionSchema.partial().omit({ presentPlayerIds: true, quest: true }).parse(req.body);
  const session = await prisma.session.update({ where: { id: req.params.id }, data: input });
  res.json(session);
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  await prisma.session.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
