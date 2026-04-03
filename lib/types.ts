export type TrendPoint = {
  label: string;
  value: number;
};

export type StatCardData = {
  label: string;
  value: string;
  subtext?: string | null;
  description?: string | null;
};

export type SplitStat = {
  label: string;
  value: string;
};

export type SearchPlayerResult = {
  id: number;
  name: string;
  team: string;
  position: string;
};

export type FeaturedPlayer = {
  id: number;
  name: string;
  team: string;
  position: string;
  statLabel: string;
  statValue: string;
  context: string;
};

export type BIQLeaderboardEntry = {
  id: number;
  name: string;
  team: string;
  position: string;
  biqScore: number;
  biqRankScore: number;
  biqTier: string;
  reason: string;
  engineScore: number;
  burdenScore: number;
  creationScore: number;
  efficiencyScore: number;
  impactScore: number;
  availabilityScore: number;
  starScore: number;
};

export type GameLogRow = {
  gameDate: string;
  matchup: string;
  result: string;
  minutes: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  plusMinus: number;
};

export type PlayerAnalyticsBlock = {
  title: string;
  stats: StatCardData[];
};

export type BIQComponent = {
  label: string;
  score: number;
  weight: number;
  explanation: string;
};

export type PlayerProfile = {
  id: number;
  name: string;
  team: string;
  position: string;
  stats: StatCardData[];
  recentTrend: TrendPoint[];
  insight: string;
  recentFormScore: number;
  consistencyScore: number;
  splits: SplitStat[];
  analyticsBlocks: PlayerAnalyticsBlock[];
  gameLog: GameLogRow[];
  biqScore: number;
  biqTier: string;
  biqBreakdown: BIQComponent[];
};

export type TeamSearchResult = {
  id: number;
  name: string;
  abbreviation: string;
  conference: string;
  division: string;
};

export type TeamRosterPlayer = {
  id: number;
  name: string;
  number: string;
  position: string;
};

export type TeamLeaderboardEntry = {
  id: number;
  name: string;
  abbreviation: string;
  conference: string;
  division: string;
  wins: number;
  losses: number;
  winPct: number;
  netRating: number;
  offRating: number;
  defRating: number;
  pace: number;
  reason: string;
};

export type TeamProfile = {
  id: number;
  name: string;
  abbreviation?: string;
  conference: string;
  division?: string;
  stats: StatCardData[];
  lineupInsight: string;
  rosterPreview?: TeamRosterPlayer[];
};

export type CompareResponse = {
  playerA: PlayerProfile;
  playerB: PlayerProfile;
  summary: string;
};