import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";

const matchSchema = z.object({
  teamId: z.string(),
  opponent: z.string().min(1),
  date: z.coerce.date(),
  scoreFor: z.number().int().optional(),
  scoreAgainst: z.number().int().optional(),
  notes: z.string().optional(),
});

export const listMatches = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.query;
  const matches = await prisma.match.findMany({
    where: teamId ? { teamId: String(teamId) } : undefined,
    orderBy: { date: "desc" },
  });
  res.json(matches);
});

export const getMatch = asyncHandler(async (req: Request, res: Response) => {
  const match = await prisma.match.findUnique({ where: { id: req.params.id } });
  if (!match) throw new ApiError(404, "Match not found");
  res.json(match);
});

export const createMatch = asyncHandler(async (req: Request, res: Response) => {
  const input = matchSchema.parse(req.body);
  const match = await prisma.match.create({ data: input });
  res.status(201).json(match);
});

export const updateMatch = asyncHandler(async (req: Request, res: Response) => {
  const input = matchSchema.partial().parse(req.body);
  const match = await prisma.match.update({ where: { id: req.params.id }, data: input });
  res.json(match);
});
