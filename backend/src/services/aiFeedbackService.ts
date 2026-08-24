/**
 * AIFeedbackService — the "Assistant Coach".
 *
 * Today this is a deterministic, dependency-free stub so the full pipeline
 * (session note -> per-player feedback -> XP -> parent report) works out of
 * the box. Swap the body of `analyzeSessionNote` for a real call to the
 * Anthropic API (see /mnt/skills or the messages endpoint) to get genuinely
 * intelligent extraction — same input/output contract, no other code changes
 * needed.
 */

export interface PlayerMention {
  playerName: string;
  sentiment: "positive" | "needs_support" | "neutral";
  tags: string[]; // e.g. ["leadership", "passing"]
  suggestedXP: number;
  feedback: string;
}

export interface SessionNoteAnalysis {
  summary: string;
  playerMentions: PlayerMention[];
  questCompletedGuess: boolean;
}

const POSITIVE_WORDS = [
  "great",
  "excellent",
  "improved",
  "showed leadership",
  "leadership",
  "well done",
  "confident",
  "strong",
];
const SUPPORT_WORDS = ["struggled", "needs", "difficulty", "low confidence", "shy", "hesitant"];

/**
 * Extremely lightweight NLP: split the note into clauses, look for a
 * capitalised name followed by sentiment keywords. Good enough to demo the
 * pipeline; replace with an LLM call for production quality.
 */
export function analyzeSessionNote(note: string, rosterNames: string[]): SessionNoteAnalysis {
  const clauses = note.split(/[.;\n]/).map((c) => c.trim()).filter(Boolean);
  const mentions: PlayerMention[] = [];

  for (const name of rosterNames) {
    const clause = clauses.find((c) => c.toLowerCase().includes(name.toLowerCase()));
    if (!clause) continue;

    const lower = clause.toLowerCase();
    const positive = POSITIVE_WORDS.some((w) => lower.includes(w));
    const needsSupport = SUPPORT_WORDS.some((w) => lower.includes(w));

    const tags: string[] = [];
    if (lower.includes("leader")) tags.push("leadership");
    if (lower.includes("pass")) tags.push("passing");
    if (lower.includes("confiden")) tags.push("confidence");
    if (lower.includes("weak foot")) tags.push("weak_foot");
    if (lower.includes("team")) tags.push("teamwork");

    let sentiment: PlayerMention["sentiment"] = "neutral";
    if (positive && !needsSupport) sentiment = "positive";
    else if (needsSupport) sentiment = "needs_support";

    const suggestedXP = sentiment === "positive" ? 20 : sentiment === "needs_support" ? 10 : 15;

    mentions.push({
      playerName: name,
      sentiment,
      tags: tags.length ? tags : ["general"],
      suggestedXP,
      feedback: clause,
    });
  }

  const questCompletedGuess = /quest|completed|finished|repaired the bridge/i.test(note);

  return {
    summary: note.length > 240 ? note.slice(0, 237) + "..." : note,
    playerMentions: mentions,
    questCompletedGuess,
  };
}

/** Turns an analysis into a short parent-facing message for one player. */
export function draftParentMessage(playerName: string, mention: PlayerMention): string {
  const tone =
    mention.sentiment === "positive"
      ? "Great session!"
      : mention.sentiment === "needs_support"
      ? "A quick coaching note:"
      : "Session update:";
  return `${tone} ${playerName} — ${mention.feedback}. Earned +${mention.suggestedXP} XP today.`;
}
