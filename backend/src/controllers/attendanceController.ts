import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";

const markSchema = z.object({
  sessionId: z.string(),
  playerId: z.string(),
  present: z.boolean().default(true),
  standoutNote: z.string().optional(),
});

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const input = markSchema.parse(req.body);
  const record = await prisma.attendance.upsert({
    where: { sessionId_playerId: { sessionId: input.sessionId, playerId: input.playerId } },
    update: { present: input.present, standoutNote: input.standoutNote },
    create: input,
  });
  res.status(201).json(record);
});

export const sessionAttendance = asyncHandler(async (req: Request, res: Response) => {
  const records = await prisma.attendance.findMany({
    where: { sessionId: req.params.sessionId },
    include: { player: true },
  });
  res.json(records);
});

export const playerAttendanceHistory = asyncHandler(async (req: Request, res: Response) => {
  const records = await prisma.attendance.findMany({
    where: { playerId: req.params.playerId },
    include: { session: true },
    orderBy: { session: { date: "desc" } },
  });
  const rate =
    records.length > 0
      ? Math.round((records.filter((r) => r.present).length / records.length) * 100)
      : 0;
  res.json({ records, attendanceRatePercent: rate });
});
