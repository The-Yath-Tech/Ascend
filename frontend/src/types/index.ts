export interface Player {
  id: string;
  name: string;
  position?: string | null;
  photoUrl?: string | null;
  overallXP: number;
  level: "EXPLORER" | "WARRIOR" | "CAPTAIN" | "STRATEGIST" | "LEGEND";
  dna?: PlayerDNA | null;
}

export interface PlayerDNA {
  technical: number;
  decisionMaking: number;
  physical: number;
  leadership: number;
  confidence: number;
  creativity: number;
  resilience: number;
  teamwork: number;
  discipline: number;
}

export interface DISSnapshot {
  id: string;
  technical: number;
  tactical: number;
  physical: number;
  character: number;
  participation: number;
  learningProgression: number;
  overallScore: number;
  weightsUsed: Record<string, number>;
  computedAt: string;
}

export interface Session {
  id: string;
  theme: string;
  date: string;
  durationMinutes: number;
  coachNote?: string | null;
  aiSummary?: string | null;
}

export interface XPLogEntry {
  id: string;
  points: number;
  reason: string;
  source?: string | null;
  createdAt: string;
}

export interface PlayerBadgeEntry {
  id: string;
  earnedAt: string;
  badge: { id: string; title: string; icon?: string | null; description?: string | null };
}

export interface AttendanceEntry {
  id: string;
  present: boolean;
  standoutNote?: string | null;
  session: Session;
}

export interface QuestCompletionEntry {
  id: string;
  completed: boolean;
  valueAchieved?: number | null;
  completedAt?: string | null;
  quest: { id: string; title: string; type: string };
}

export interface HomeChallengeEntry {
  id: string;
  title: string;
  xpAwarded: number;
  createdAt: string;
  mediaUrl?: string | null;
}

export interface Assessment {
  id: string;
  period: "PRESEASON" | "MIDSEASON" | "POSTSEASON" | "ADHOC";
  summary?: string | null;
  createdAt: string;
}

export interface DevelopmentGoal {
  id: string;
  title: string;
  description?: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED" | "MISSED";
  targetDate?: string | null;
}

export interface CoachObservation {
  id: string;
  note: string;
  tags: string[];
  createdAt: string;
}

export interface PlayerPassport {
  id: string;
  name: string;
  dob: string;
  position?: string | null;
  photoUrl?: string | null;
  overallXP: number;
  level: Player["level"];
  dna?: PlayerDNA | null;
  team?: { id: string; name: string } | null;
  badges: PlayerBadgeEntry[];
  xpLogs: XPLogEntry[];
  attendances: AttendanceEntry[];
  questCompletions: QuestCompletionEntry[];
  homeChallenges: HomeChallengeEntry[];
  disSnapshots: DISSnapshot[];
  assessments: Assessment[];
  developmentGoals: DevelopmentGoal[];
  observations: CoachObservation[];
}
