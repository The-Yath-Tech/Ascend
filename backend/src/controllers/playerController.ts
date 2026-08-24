import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";

const createPlayerSchema = z.object({
  name: z.string().min(2),
  dob: z.coerce.date(),
  position: z.string().optional(),
  photoUrl: z.string().url().optional(),
  teamId: z.string().optional(),
  parentId: z.string().optional(),
});

export const listPlayers = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.query;
  const players = await prisma.player.findMany({
    where: teamId ? { teamId: String(teamId) } : undefined,
    include: { dna: true, badges: { include: { badge: true } } },
    orderBy: { name: "asc" },
  });
  res.json(players);
});

export const getPlayer = asyncHandler(async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: {
      dna: true,
      badges: { include: { badge: true } },
      xpLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      attendances: { include: { session: true }, orderBy: { session: { date: "desc" } }, take: 20 },
      team: true,
    },
  });
  if (!player) throw new ApiError(404, "Player not found");
  res.json(player);
});

export const createPlayer = asyncHandler(async (req: Request, res: Response) => {
  const input = createPlayerSchema.parse(req.body);
  const player = await prisma.player.create({
    data: { ...input, dna: { create: {} } },
    include: { dna: true },
  });
  res.status(201).json(player);
});

export const updatePlayer = asyncHandler(async (req: Request, res: Response) => {
  const input = createPlayerSchema.partial().parse(req.body);
  const player = await prisma.player.update({ where: { id: req.params.id }, data: input });
  res.json(player);
});

export const deletePlayer = asyncHandler(async (req: Request, res: Response) => {
  await prisma.player.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// "Player DNA" — multidimensional development profile.
export const getPlayerDNA = asyncHandler(async (req: Request, res: Response) => {
  const dna = await prisma.playerDNA.findUnique({ where: { playerId: req.params.id } });
  if (!dna) throw new ApiError(404, "Player DNA not found");
  res.json(dna);
});

const dnaUpdateSchema = z.object({
  technical: z.number().min(0).max(100).optional(),
  decisionMaking: z.number().min(0).max(100).optional(),
  physical: z.number().min(0).max(100).optional(),
  leadership: z.number().min(0).max(100).optional(),
  confidence: z.number().min(0).max(100).optional(),
  creativity: z.number().min(0).max(100).optional(),
  resilience: z.number().min(0).max(100).optional(),
  teamwork: z.number().min(0).max(100).optional(),
  discipline: z.number().min(0).max(100).optional(),
});

export const updatePlayerDNA = asyncHandler(async (req: Request, res: Response) => {
  const input = dnaUpdateSchema.parse(req.body);
  const dna = await prisma.playerDNA.update({ where: { playerId: req.params.id }, data: input });
  res.json(dna);
});
