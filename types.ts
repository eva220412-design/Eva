
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
  criteriaScores: Record<string, number>; // criterionId -> score
}

export interface AppState {
  judges: string[];
  currentJudge: string | null;
  scores: ScoreSet[];
}
