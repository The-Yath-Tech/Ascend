import { Request, Response } from "express";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";
import {
  computeAndSaveDIS,
  getLatestOrComputeDIS,
  computeDISGrowth,
  DIS_WEIGHTS,
} from "@/services/disService";

/** GET /api/dis/:playerId — latest DIS snapshot (computes one if none exists). */
export const getLatestDIS = asyncHandler(async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({ where: { id: req.params.playerId } });
  if (!player) throw new ApiError(404, "Player not found");

  const snapshot = await getLatestOrComputeDIS(req.params.playerId);
  res.json(snapshot);
});

/** POST /api/dis/:playerId/recompute — coach-triggered recomputation, saved as a new snapshot. */
export const recomputeDIS = asyncHandler(async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({ where: { id: req.params.playerId } });
  if (!player) throw new ApiError(404, "Player not found");

  const snapshot = await computeAndSaveDIS(req.params.playerId);
  res.status(201).json(snapshot);
});

/** GET /api/dis/:playerId/history — full snapshot history for trend charts. */
export const getDISHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await prisma.dISSnapshot.findMany({
    where: { playerId: req.params.playerId },
    orderBy: { computedAt: "asc" },
  });
  res.json(history);
});

/** GET /api/dis/:playerId/growth — signature "DIS™ Growth" KPI. */
export const getDISGrowth = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 90;
  const growth = await computeDISGrowth(req.params.playerId, days);
  res.json(growth);
});

/** GET /api/dis/weights — exposes the current weighting for explainability. */
export const getWeights = asyncHandler(async (_req: Request, res: Response) => {
  res.json(DIS_WEIGHTS);
});
