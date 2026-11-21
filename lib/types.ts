export type TrendPoint = {
  label: string;
  value: number;
};

export type StatCardData = {
  label: string;
  value: string;
  subtext?: string | null;
  description?: string | null;
  /**
   * Where the value sits among the league's rotation players, 0-100, always
   * oriented so higher is better. Absent when the stat isn't ranked.
   */
  percentile?: number | null;
};

export type SplitStat = {
  label: string;
  /** "N/A" when the player has no games in the split. */
  value: string;
  games?: number | null;
};

/** The season the API serves and how current its data is. */
export type SeasonInfo = {
  season: string;
  /** Date (YYYY-MM-DD) of the latest game the stored game logs cover. */
  dataThrough?: string | null;
  syncedAt?: string | null;
};

export type SearchPlayerResult = {
  id: number;
  name: string;
  team: string;
  position: string;
};

export type PlayerDirectoryEntry = SearchPlayerResult & {
  /** Games played this season; 0 means no stats yet. */
  gamesPlayed: number;
};

export type PlayerDirectoryPage = {
  season: string;
  total: number;
  offset: number;
  limit: number;
  items: PlayerDirectoryEntry[];
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

/** One shot zone. Shares and percentages are 0-1. */
export type ShotZone = {
  key: string;
  label: string;
  attempts: number;
  frequency: number;
  /** Absent with no attempts. */
  accuracy?: number | null;
  leagueFrequency?: number | null;
  leagueAccuracy?: number | null;
};

/** Team results per 100 possessions with the player on and off the floor. */
export type OnOffSplit = {
  onOffRating?: number | null;
  onDefRating?: number | null;
  onNet?: number | null;
  offNet?: number | null;
  /** On minus off. */
  diff?: number | null;
  onPossessions: number;
  offPossessions: number;
};

/** Play-by-play-derived detail; absent for seasons with box-score data only. */
export type PlayerAdvanced = {
  possessions: number;
  /** True when the sample is too small for the rates to mean much yet. */
  lowSample: boolean;
  per100: StatCardData[];
  efficiency: StatCardData[];
  shotProfile: ShotZone[];
  onOff?: OnOffSplit | null;
};

export type PlayerProfile = {
  id: number;
  name: string;
  team: string;
  position: string;
  season: string;
  /** Games played this season; the game log below is only the most recent. */
  gamesPlayed: number;
  stats: StatCardData[];
  recentTrend: TrendPoint[];
  insight: string;
  /** Null until the player has enough games for the score to mean something. */
  recentFormScore: number | null;
  consistencyScore: number | null;
  splits: SplitStat[];
  analyticsBlocks: PlayerAnalyticsBlock[];
  gameLog: GameLogRow[];
  biqScore: number;
  biqTier: string;
  biqBreakdown: BIQComponent[];
  advanced?: PlayerAdvanced | null;
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
  /** Season line and scores; absent for a player with no games yet. */
  gamesPlayed?: number;
  minutes?: number | null;
  points?: number | null;
  biqScore?: number | null;
  onOffDiff?: number | null;
};

/** One of the four factors (or the rating they add up to), on both ends. */
export type TeamFactor = {
  key: string;
  label: string;
  description: string;
  /** "pct" values are 0-1; "rating" values are points per 100 possessions. */
  format: 'pct' | 'rating' | string;
  offense?: number | null;
  /** League rank, 1 is best. */
  offenseRank?: number | null;
  /** What the team allows. */
  defense?: number | null;
  defenseRank?: number | null;
  lowerIsBetter: boolean;
};

export type TeamLineup = {
  players: { id: number; name: string }[];
  minutes: number;
  possessions: number;
  offRating?: number | null;
  defRating?: number | null;
  netRating?: number | null;
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
  season?: string;
  stats: StatCardData[];
  lineupInsight: string;
  /** Everyone who has played for the team this season, most minutes first. */
  rosterPreview?: TeamRosterPlayer[];
  /** Play-by-play-derived detail; empty for seasons with box-score data only. */
  fourFactors?: TeamFactor[];
  shotProfile?: ShotZone[];
  lineups?: TeamLineup[];
};

// The compare endpoint returns a deliberately narrower card than PlayerProfile
// — no splits, analytics blocks, game log, consistency score, or BIQ breakdown.
// Typing it as PlayerProfile made those read as safe when they are undefined.
export type ComparePlayerCard = {
  id: number;
  name: string;
  team: string;
  position: string;
  stats: StatCardData[];
  recentTrend: TrendPoint[];
  insight: string;
  biqScore: number;
  biqTier: string;
  recentFormScore: number | null;
};

export type CompareResponse = {
  playerA: ComparePlayerCard;
  playerB: ComparePlayerCard;
  summary: string;
};
export type ModelComponent = {
  label: string;
  weight: number;
  explanation: string;
};

export type ModelSummary = {
  components: ModelComponent[];
  rankBlend: ModelComponent[];
  tiers: { minScore: number; label: string }[];
  /**
   * Leaderboard qualification: both gates must be met. minGames is the
   * full-season gate scaled to how many games have been played so far.
   */
  minGames: number;
  minGamesFullSeason: number;
  gamesIntoSeason: number;
  minMinutes: number;
};
