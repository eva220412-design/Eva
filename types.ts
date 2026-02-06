
export interface Criterion {
  id: string;
  name: string;
  maxScore: number;
}

export interface RoundDefinition {
  id: number;
  title: string;
  description: string;
  totalMax: number;
  criteria: Criterion[];
}

export interface Contestant {
  id: string;
  name: string;
  image: string;
  title: string;
}

export interface ScoreSet {
  contestantId: string;
  roundId: number;
  judgeName: string;
  judgeIndex: number; // 0-4 for the 5 judges
  criteriaScores: Record<string, number>;
}

export interface SessionState {
  roomId: string;
  scores: ScoreSet[];
  activeJudges: string[];
}
