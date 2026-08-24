import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";

const clubSchema = z.object({
  name: z.string().min(2),
  city: z.string().optional(),
});

export const listClubs = asyncHandler(async (_req: Request, res: Response) => {
  const clubs = await prisma.club.findMany({ include: { teams: true, coaches: true } });
  res.json(clubs);
});

export const getClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await prisma.club.findUnique({
    where: { id: req.params.id },
    include: { teams: true, coaches: { include: { user: true } }, seasons: true },
  });
  if (!club) throw new ApiError(404, "Club not found");
  res.json(club);
});

export const createClub = asyncHandler(async (req: Request, res: Response) => {
  const input = clubSchema.parse(req.body);
  const club = await prisma.club.create({ data: input });
  res.status(201).json(club);
});

export const updateClub = asyncHandler(async (req: Request, res: Response) => {
  const input = clubSchema.partial().parse(req.body);
  const club = await prisma.club.update({ where: { id: req.params.id }, data: input });
  res.json(club);
});

export const deleteClub = asyncHandler(async (req: Request, res: Response) => {
  await prisma.club.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
