import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/prismaClient";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/middleware/errorHandler";
import { analyzeSessionNote, draftParentMessage } from "@/services/aiFeedbackService";
import { awardXP } from "@/services/xpService";

const noteSchema = z.object({
  sessionId: z.string(),
  note: z.string().min(5),
});

/**
 * The "Assistant Coach" endpoint. Coach pastes/dictates a free-text note.
 * We (1) analyze it against the session roster, (2) award suggested XP per
 * mentioned player, (3) store an AI summary on the session, and
 * (4) queue parent notifications — all from one short note.
 */
export const analyzeAndApply = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, note } = noteSchema.parse(req.body);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { attendances: { include: { player: { include: { parent: true } } } } },
  });
  if (!session) throw new ApiError(404, "Session not found");

  const rosterNames = session.attendances.map((a) => a.player.name);
  const analysis = analyzeSessionNote(note, rosterNames);

  await prisma.session.update({ where: { id: sessionId }, data: { coachNote: note, aiSummary: analysis.summary } });

  const results = [];
  for (const mention of analysis.playerMentions) {
    const attendance = session.attendances.find(
      (a) => a.player.name.toLowerCase() === mention.playerName.toLowerCase()
    );
    if (!attendance) continue;

    const xpResult = await awardXP(attendance.playerId, mention.suggestedXP, `AI: ${mention.tags.join(", ")}`, "ai");

    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { standoutNote: mention.feedback },
    });

    const parentUserId = attendance.player.parent?.userId;
    const parentMessage = draftParentMessage(mention.playerName, mention);
    if (parentUserId) {
      await prisma.notification.create({ data: { userId: parentUserId, message: parentMessage } });
    }

    results.push({ ...mention, leveledUp: xpResult.leveledUp, parentMessage });
  }

  res.json({
    sessionId,
    summary: analysis.summary,
    questCompletedGuess: analysis.questCompletedGuess,
    playerResults: results,
  });
});
