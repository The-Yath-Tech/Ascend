import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";

const teamSchema = z.object({
  name: z.string().min(2),
  ageGroup: z.string().min(1),
  clubId: z.string(),
  seasonId: z.string().optional(),
  coachId: z.string().optional(),
});

export const listTeams = asyncHandler(async (req: Request, res: Response) => {
  const teams = await prisma.team.findMany({
    include: { players: true, coach: { include: { user: true } } },
    orderBy: { name: "asc" },
  });
  res.json(teams);
});

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: { players: true, sessions: { orderBy: { date: "desc" }, take: 10 }, matches: true },
  });
  if (!team) throw new ApiError(404, "Team not found");
  res.json(team);
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const input = teamSchema.parse(req.body);
  const team = await prisma.team.create({ data: input });
  res.status(201).json(team);
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const input = teamSchema.partial().parse(req.body);
  const team = await prisma.team.update({ where: { id: req.params.id }, data: input });
  res.json(team);
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  await prisma.team.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
