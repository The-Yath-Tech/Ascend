import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";

const observationSchema = z.object({
  playerId: z.string(),
  coachId: z.string(),
  note: z.string().min(2),
  tags: z.array(z.string()).optional(),
});

export const listObservations = asyncHandler(async (req: Request, res: Response) => {
  const observations = await prisma.coachObservation.findMany({
    where: { playerId: req.params.playerId },
    orderBy: { createdAt: "desc" },
  });
  res.json(observations);
});

export const createObservation = asyncHandler(async (req: Request, res: Response) => {
  const input = observationSchema.parse(req.body);
  const observation = await prisma.coachObservation.create({
    data: { ...input, tags: input.tags ?? [] },
  });
  res.status(201).json(observation);
});
