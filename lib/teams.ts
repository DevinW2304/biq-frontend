// Team nicknames for copy that reads better than an abbreviation
// ("Guard, Lakers"). Unknown abbreviations come back as given.
const NICKNAMES: Record<string, string> = {
  ATL: 'Hawks', BKN: 'Nets', BOS: 'Celtics', CHA: 'Hornets', CHI: 'Bulls',
  CLE: 'Cavaliers', DAL: 'Mavericks', DEN: 'Nuggets', DET: 'Pistons', GSW: 'Warriors',
  HOU: 'Rockets', IND: 'Pacers', LAC: 'Clippers', LAL: 'Lakers', MEM: 'Grizzlies',
  MIA: 'Heat', MIL: 'Bucks', MIN: 'Timberwolves', NOP: 'Pelicans', NYK: 'Knicks',
  OKC: 'Thunder', ORL: 'Magic', PHI: '76ers', PHX: 'Suns', POR: 'Trail Blazers',
  SAC: 'Kings', SAS: 'Spurs', TOR: 'Raptors', UTA: 'Jazz', WAS: 'Wizards',
};

export function teamNickname(abbreviation: string): string {
  return NICKNAMES[abbreviation.toUpperCase()] ?? abbreviation;
}
