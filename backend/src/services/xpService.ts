import { prisma } from "@/prismaClient";
import { levelForXP } from "@/utils/xp";
import { PlayerLevel } from "@prisma/client";

/**
 * Awards XP to a player, updates their running total, and re-evaluates
 * their level (Explorer -> Warrior -> Captain -> Strategist -> Legend).
 * Returns the updated player and whether they leveled up.
 */
export async function awardXP(playerId: string, points: number, reason: string, source = "coach") {
  const [, player] = await prisma.$transaction([
    prisma.xPLog.create({ data: { playerId, points, reason, source } }),
    prisma.player.update({
      where: { id: playerId },
      data: { overallXP: { increment: points } },
    }),
  ]);

  const newLevel = levelForXP(player.overallXP) as PlayerLevel;
  const leveledUp = newLevel !== player.level;

  const updated = leveledUp
    ? await prisma.player.update({ where: { id: playerId }, data: { level: newLevel } })
    : player;

  return { player: updated, leveledUp };
}
