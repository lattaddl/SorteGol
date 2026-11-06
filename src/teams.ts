import type { LeagueId, Team } from './types'

export const LEAGUES: { id: LeagueId; name: string }[] = [
  { id: 'EPL', name: 'Premier League' },
  { id: 'LAL', name: 'La Liga' },
  { id: 'HYP', name: 'La Liga Hypermotion' },
  { id: 'SEA', name: 'Serie A' },
  { id: 'LI1', name: 'Ligue 1' },
  { id: 'BUN', name: 'Bundesliga' },
  { id: 'ARG', name: 'Liga Argentina' },
  { id: 'NED', name: 'Eredivisie' },
  { id: 'POR', name: 'Liga Portugal' },
  { id: 'BRA', name: 'Brasileirão' },
  { id: 'MLS', name: 'MLS' },
  { id: 'SAU', name: 'Liga Saudí' },
  { id: 'OTR', name: 'Otras ligas' },
]

export const LEAGUE_NAME = Object.fromEntries(LEAGUES.map((l) => [l.id, l.name])) as Record<LeagueId, string>

/*
 * Valoraciones (ovr) aproximadas del FC 26. No son oficiales:
 * editá los números a gusto, el sorteo se adapta solo.
 * Formato: [nombre, liga, valoración]
 */
const RAW: [string, LeagueId, number][] = [
  // Premier League
  ['Arsenal', 'EPL', 89], ['Liverpool', 'EPL', 88], ['Manchester City', 'EPL', 89],
  ['Chelsea', 'EPL', 86], ['Newcastle United', 'EPL', 84], ['Tottenham', 'EPL', 85],
  ['Manchester United', 'EPL', 86], ['Aston Villa', 'EPL', 85], ['Brighton', 'EPL', 84],
  ['West Ham', 'EPL', 83], ['Crystal Palace', 'EPL', 83], ['Nottingham Forest', 'EPL', 83],
  ['Brentford', 'EPL', 81], ['Fulham', 'EPL', 83], ['Bournemouth', 'EPL', 81],
  ['Everton', 'EPL', 82], ['Wolverhampton', 'EPL', 82], ['Leeds United', 'EPL', 82],
  ['Burnley', 'EPL', 80], ['Sunderland', 'EPL', 80],
  // La Liga
  ['Real Madrid', 'LAL', 91], ['Barcelona', 'LAL', 90], ['Atlético de Madrid', 'LAL', 87],
  ['Athletic Club', 'LAL', 83], ['Real Sociedad', 'LAL', 81], ['Villarreal', 'LAL', 80],
  ['Real Betis', 'LAL', 83], ['Sevilla', 'LAL', 81], ['Valencia', 'LAL', 82],
  ['Girona', 'LAL', 82], ['Celta de Vigo', 'LAL', 77], ['Osasuna', 'LAL', 79],
  ['Getafe', 'LAL', 78], ['Rayo Vallecano', 'LAL', 79], ['Mallorca', 'LAL', 79],
  ['Espanyol', 'LAL', 78], ['Alavés', 'LAL', 80], ['Elche', 'LAL', 78],
  ['Levante', 'LAL', 77], ['Real Oviedo', 'LAL', 76],
  // La Liga Hypermotion
  ['Las Palmas', 'HYP', 70], ['Almería', 'HYP', 70], ['Deportivo La Coruña', 'HYP', 69],
  ['Málaga', 'HYP', 69], ['Granada', 'HYP', 69], ['Real Valladolid', 'HYP', 69],
  ['Racing de Santander', 'HYP', 68], ['Cádiz', 'HYP', 68], ['Real Zaragoza', 'HYP', 68],
  ['Sporting de Gijón', 'HYP', 68],
  // Serie A
  ['Inter', 'SEA', 88], ['Napoli', 'SEA', 85], ['Juventus', 'SEA', 85], ['Milan', 'SEA', 86],
  ['Atalanta', 'SEA', 81], ['Roma', 'SEA', 85], ['Lazio', 'SEA', 83], ['Fiorentina', 'SEA', 81],
  ['Bologna', 'SEA', 79], ['Como', 'SEA', 83], ['Torino', 'SEA', 79], ['Udinese', 'SEA', 77],
  ['Genoa', 'SEA', 76], ['Sassuolo', 'SEA', 78], ['Parma', 'SEA', 77], ['Cagliari', 'SEA', 77],
  ['Lecce', 'SEA', 76], ['Hellas Verona', 'SEA', 76], ['Cremonese', 'SEA', 75], ['Pisa', 'SEA', 74],
  // Ligue 1
  ['Paris Saint-Germain', 'LI1', 90], ['Monaco', 'LI1', 82], ['Marseille', 'LI1', 81],
  ['Lille', 'LI1', 81], ['Lyon', 'LI1', 82], ['Lens', 'LI1', 77], ['Nice', 'LI1', 77],
  ['Rennes', 'LI1', 79], ['Strasbourg', 'LI1', 82], ['Brest', 'LI1', 79], ['Toulouse', 'LI1', 76],
  ['Nantes', 'LI1', 79], ['Auxerre', 'LI1', 75], ['Le Havre', 'LI1', 76], ['Lorient', 'LI1', 75],
  ['Angers', 'LI1', 76], ['Paris FC', 'LI1', 76], ['Metz', 'LI1', 75],
  // Bundesliga
  ['Bayern Múnich', 'BUN', 89], ['Bayer Leverkusen', 'BUN', 86], ['Borussia Dortmund', 'BUN', 85],
  ['RB Leipzig', 'BUN', 81], ['Eintracht Fráncfort', 'BUN', 79], ['VfB Stuttgart', 'BUN', 78],
  ['Wolfsburgo', 'BUN', 76], ["Borussia M'gladbach", 'BUN', 76], ['Friburgo', 'BUN', 76],
  ['Hoffenheim', 'BUN', 76], ['Werder Bremen', 'BUN', 77], ['Unión Berlín', 'BUN', 77],
  ['Mainz 05', 'BUN', 77], ['Augsburgo', 'BUN', 77], ['Hamburgo', 'BUN', 76],
  ['FC Colonia', 'BUN', 75], ['St. Pauli', 'BUN', 77], ['Heidenheim', 'BUN', 74],
  // Liga Argentina
  ['River Plate', 'ARG', 81], ['Boca Juniors', 'ARG', 81], ['Racing Club', 'ARG', 78],
  ['Independiente', 'ARG', 78], ['Estudiantes', 'ARG', 76], ['Vélez Sarsfield', 'ARG', 76],
  ['San Lorenzo', 'ARG', 75], ['Talleres', 'ARG', 74], ['Lanús', 'ARG', 74],
  ['Rosario Central', 'ARG', 75], ['Argentinos Juniors', 'ARG', 76], ['Huracán', 'ARG', 74],
  ['Belgrano', 'ARG', 71], ["Newell's Old Boys", 'ARG', 70], ['Defensa y Justicia', 'ARG', 69],
  ['Gimnasia La Plata', 'ARG', 69], ['Banfield', 'ARG', 69], ['Godoy Cruz', 'ARG', 69],
  ['Independiente Rivadavia', 'ARG', 74], ['Tigre', 'ARG', 68], ['Platense', 'ARG', 74],
  ['Central Córdoba', 'ARG', 68], ['Instituto', 'ARG', 68], ['Barracas Central', 'ARG', 67],
  ['Aldosivi', 'ARG', 66],
  // Eredivisie
  ['PSV', 'NED', 79], ['Ajax', 'NED', 79], ['Feyenoord', 'NED', 77],
  // Liga Portugal
  ['Benfica', 'POR', 80], ['Porto', 'POR', 80], ['Sporting CP', 'POR', 80], ['Braga', 'POR', 75],
  // Brasileirão
  ['Flamengo', 'BRA', 78], ['Palmeiras', 'BRA', 79], ['Botafogo', 'BRA', 77], ['Fluminense', 'BRA', 76],
  // MLS
  ['Inter Miami', 'MLS', 78], ['LAFC', 'MLS', 72], ['LA Galaxy', 'MLS', 71],
  // Liga Saudí
  ['Al Hilal', 'SAU', 77], ['Al Nassr', 'SAU', 78], ['Al Ittihad', 'SAU', 75],
  // Otras ligas
  ['Galatasaray', 'OTR', 77], ['Fenerbahçe', 'OTR', 77], ['Beşiktaş', 'OTR', 74],
  ['Celtic', 'OTR', 74], ['Rangers', 'OTR', 72], ['Club Brugge', 'OTR', 75],
  ['Shakhtar Donetsk', 'OTR', 73], ['Red Bull Salzburgo', 'OTR', 74],
]

const slug = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const TEAMS: Team[] = RAW.map(([name, league, ovr]) => ({ id: `${league}-${slug(name)}`, name, league, ovr }))

export function starsFor(ovr: number): number {
  const s = Math.round(((ovr - 66) / 3.5) * 2) / 2
  return Math.max(0.5, Math.min(5, s))
}
