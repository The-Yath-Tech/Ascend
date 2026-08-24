// Centralised XP rules — matches the "XP instead of trophies" economy.
export const XP_RULES = {
  ATTENDANCE: 10,
  HELPING_TEAMMATE: 20,
  PERFECT_EFFORT: 15,
  CLEANING_EQUIPMENT: 10,
  LEADERSHIP: 25,
  TRYING_WEAK_FOOT: 15,
  QUEST_COMPLETED: 20,
  HOME_CHALLENGE: 10,
} as const;

// XP thresholds that promote a player through the five levels.
export const LEVEL_THRESHOLDS: { level: string; minXP: number }[] = [
  { level: "EXPLORER", minXP: 0 },
  { level: "WARRIOR", minXP: 300 },
  { level: "CAPTAIN", minXP: 800 },
  { level: "STRATEGIST", minXP: 1500 },
  { level: "LEGEND", minXP: 2500 },
];

export function levelForXP(xp: number): string {
  let current = LEVEL_THRESHOLDS[0].level;
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.minXP) current = t.level;
  }
  return current;
}
