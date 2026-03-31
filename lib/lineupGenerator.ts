import { getPositionAbbreviations } from './types';

export interface Player {
  id: number;
  play: boolean;
  fourthQuarterLock: boolean;
  jerseyNumber: string;
  firstName: string;
  lastName: string;
  nickname: string;
  position1: string;
  position2: string;
}

export interface QuarterLineup {
  quarter: number;
  positions: Record<string, Player | null>;
}

export interface GeneratedLineup {
  quarters: QuarterLineup[];
  warnings: string[];
}

const MAX_PLAYERS_PER_QUARTER = 6;

export class LineupGenerator {
  private players: Player[];
  private activePlayers: Player[];
  private warnings: string[] = [];
  private positions: string[];

  constructor(players: Player[], positions?: string[]) {
    this.players = players;
    this.activePlayers = players.filter(p => p.play);
    this.positions = positions || getPositionAbbreviations();
  }

  generate(): GeneratedLineup {
    this.warnings = [];

    if (this.activePlayers.length === 0) {
      this.warnings.push('No players marked as "Play". Cannot generate lineup.');
      return { quarters: [], warnings: this.warnings };
    }

    if (this.activePlayers.length > MAX_PLAYERS_PER_QUARTER * 4) {
      this.warnings.push(`Too many active players (${this.activePlayers.length}). Some players may not get playing time.`);
    }

    // Track which players have played and in which quarters
    const playerQuarters = new Map<number, number[]>();
    this.activePlayers.forEach(p => playerQuarters.set(p.id, []));

    // Generate lineup for each quarter
    const quarters: QuarterLineup[] = [];

    for (let q = 1; q <= 4; q++) {
      const quarterLineup = this.generateQuarterLineup(q, playerQuarters);
      quarters.push(quarterLineup);
    }

    // Check if everyone sat at least once (if there are > 6 players)
    if (this.activePlayers.length > MAX_PLAYERS_PER_QUARTER) {
      this.activePlayers.forEach(player => {
        const quartersPlayed = playerQuarters.get(player.id) || [];
        if (quartersPlayed.length === 4) {
          this.warnings.push(`${this.getPlayerName(player)} did not sit any quarter (played all 4).`);
        }
      });
    }

    return { quarters, warnings: this.warnings };
  }

  private generateQuarterLineup(
    quarter: number,
    playerQuarters: Map<number, number[]>
  ): QuarterLineup {
    const positions: Record<string, Player | null> = {};
    const availableForQuarter: Player[] = [];

    // For quarter 4, prioritize 4Q Lock players
    if (quarter === 4) {
      const lockedPlayers = this.activePlayers.filter(p => p.fourthQuarterLock);
      lockedPlayers.forEach(player => {
        if (player.position1) {
          positions[player.position1] = player;
          playerQuarters.get(player.id)?.push(quarter);
        }
      });

      // Add remaining players who aren't locked
      this.activePlayers
        .filter(p => !p.fourthQuarterLock)
        .forEach(p => availableForQuarter.push(p));
    } else {
      availableForQuarter.push(...this.activePlayers);
    }

    // Sort players by quarters played (prioritize those who've played less)
    availableForQuarter.sort((a, b) => {
      const aQuarters = playerQuarters.get(a.id)?.length || 0;
      const bQuarters = playerQuarters.get(b.id)?.length || 0;
      return aQuarters - bQuarters;
    });

    // Fill positions using primary positions first
    let playersInQuarter = Object.values(positions).filter(p => p !== null).length;

    for (const player of availableForQuarter) {
      if (playersInQuarter >= MAX_PLAYERS_PER_QUARTER) break;

      // Skip if player is already in this quarter
      if (Object.values(positions).some(p => p?.id === player.id)) {
        continue;
      }

      // Try to assign to primary position
      if (player.position1 && !positions[player.position1]) {
        positions[player.position1] = player;
        playerQuarters.get(player.id)?.push(quarter);
        playersInQuarter++;
      }
    }

    // Fill remaining spots with secondary positions
    for (const player of availableForQuarter) {
      if (playersInQuarter >= MAX_PLAYERS_PER_QUARTER) break;

      // Skip if player is already in this quarter
      if (Object.values(positions).some(p => p?.id === player.id)) {
        continue;
      }

      // Try to assign to secondary position
      if (player.position2 && !positions[player.position2]) {
        positions[player.position2] = player;
        playerQuarters.get(player.id)?.push(quarter);
        playersInQuarter++;
      }
    }

    // Handle QB logic: if primary QB (QB1) is missing, QB2 becomes primary
    if (!positions['QB']) {
      const qbPlayers = this.activePlayers.filter(
        p => p.position1 === 'QB' || p.position2 === 'QB'
      );
      const availableQB = qbPlayers.find(qb => {
        const inQuarter = Object.values(positions).some(p => p?.id === qb.id);
        return !inQuarter && (playerQuarters.get(qb.id)?.length || 0) < 4;
      });

      if (availableQB && playersInQuarter < MAX_PLAYERS_PER_QUARTER) {
        positions['QB'] = availableQB;
        playerQuarters.get(availableQB.id)?.push(quarter);
        playersInQuarter++;
      }
    }

    // Fill any remaining empty positions randomly if we have players available
    const emptyPositions = this.positions.filter(pos => !positions[pos]);
    const unassignedPlayers = availableForQuarter.filter(
      player => !Object.values(positions).some(p => p?.id === player.id)
    );

    for (let i = 0; i < emptyPositions.length && i < unassignedPlayers.length; i++) {
      if (playersInQuarter >= MAX_PLAYERS_PER_QUARTER) break;

      const player = unassignedPlayers[i];
      positions[emptyPositions[i]] = player;
      playerQuarters.get(player.id)?.push(quarter);
      playersInQuarter++;
    }

    return { quarter, positions };
  }

  private getPlayerName(player: Player): string {
    return player.nickname || `${player.firstName} ${player.lastName}`.trim() || `#${player.jerseyNumber}`;
  }
}
