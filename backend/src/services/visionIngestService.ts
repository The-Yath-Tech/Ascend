/**
 * VisionIngestService — future "AI observes training" mode.
 *
 * The idea: a coach props a phone on a tripod, records the session, and this
 * service turns the footage into structured per-player stats (passes,
 * touches, sprints, possession involvement) without any manual logging.
 *
 * This is a stub with a realistic interface so the rest of the platform
 * (XP, Player DNA, reports) can be wired against it today. Swap
 * `analyzeVideo` for a real computer-vision pipeline (e.g. pose + ball
 * tracking, jersey-number OCR for player ID) later — same return shape.
 */

export interface VisionPlayerStats {
  playerName: string;
  estimatedTouches: number;
  estimatedPasses: number;
  passingSuccessRatePercent: number;
  activeTimePercent: number; // % of session spent moving/engaged
  sprintCount: number;
}

export interface VisionSessionAnalysis {
  videoDurationSeconds: number;
  processedAt: string;
  players: VisionPlayerStats[];
  note: string;
}

/**
 * `videoUrl` would point at uploaded footage (e.g. S3). `rosterNames` scopes
 * the (future) player-identification step. Right now this returns
 * plausible, clearly-labeled mock data so the API contract can be built
 * against immediately.
 */
export async function analyzeVideo(videoUrl: string, rosterNames: string[]): Promise<VisionSessionAnalysis> {
  const players: VisionPlayerStats[] = rosterNames.map((playerName) => {
    const touches = 40 + Math.floor(Math.random() * 60);
    const passes = Math.floor(touches * (0.4 + Math.random() * 0.3));
    return {
      playerName,
      estimatedTouches: touches,
      estimatedPasses: passes,
      passingSuccessRatePercent: 55 + Math.floor(Math.random() * 35),
      activeTimePercent: 40 + Math.floor(Math.random() * 40),
      sprintCount: 3 + Math.floor(Math.random() * 12),
    };
  });

  return {
    videoDurationSeconds: 5400,
    processedAt: new Date().toISOString(),
    players,
    note: `Mock analysis for ${videoUrl} — replace with a real CV pipeline for production use.`,
  };
}
