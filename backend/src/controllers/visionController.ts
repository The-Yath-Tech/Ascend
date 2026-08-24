import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";
import { analyzeVideo } from "@/services/visionIngestService";

const schema = z.object({
  sessionId: z.string(),
  videoUrl: z.string().url(),
});

/**
 * Kicks off (mock) computer-vision analysis of a training video and returns
 * per-player stats. Does not auto-award XP yet — intended to feed a coach
 * review step before anything is applied, unlike the trusted voice-note flow.
 */
export const analyzeSessionVideo = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, videoUrl } = schema.parse(req.body);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { attendances: { include: { player: true } } },
  });
  if (!session) throw new ApiError(404, "Session not found");

  const rosterNames = session.attendances.map((a) => a.player.name);
  const analysis = await analyzeVideo(videoUrl, rosterNames);

  res.json(analysis);
});
