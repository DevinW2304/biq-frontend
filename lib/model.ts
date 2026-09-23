import type { ModelSummary } from './types';

/**
 * The leaderboard's qualification rule in words. Early in a season the games
 * gate is scaled down, and the copy says so rather than quoting a full-season
 * number no one has reached yet.
 */
export function describeGate(model: ModelSummary): string {
  const minutes = Math.round(model.minMinutes);
  if (model.minGames < model.minGamesFullSeason) {
    return `at least ${model.minGames} of the first ${model.gamesIntoSeason} games at ${minutes}+ minutes a night (the full-season bar of ${model.minGamesFullSeason} games, scaled to how much has been played)`;
  }
  return `${model.minGames}+ games at ${minutes}+ minutes a night`;
}
