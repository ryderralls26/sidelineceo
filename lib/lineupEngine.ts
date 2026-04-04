/**
 * Lineup Engine - Pure function for generating fair-play lineups
 *
 * Rules:
 * - Exactly 6 players per quarter
 * - Distribute time equally (no player sits more than 1 quarter more than others)
 * - 4Q Lock: Players with fourthQuarterLock=true are assigned to Q4
 * - Position Filling: 1 QB (rotating), 1 Center/Hike, then 4 slots for WR/RB/TE (Offense) or DL/LB/CB/S (Defense)
 */

export interface LineupPlayer {
  id: number;
  jerseyNumber: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  primaryPosition: string;
  secondaryPosition?: string;
  fourthQuarterLock: boolean;
}

export interface QuarterAssignment {
  quarter: 1 | 2 | 3 | 4;
  positions: {
    [positionKey: string]: LineupPlayer | null;
  };
}

export interface LineupResult {
  quarters: QuarterAssignment[];
  playingTimeSummary: {
    playerId: number;
    playerName: string;
    quartersPlayed: number;
  }[];
  warnings: string[];
}

const OFFENSIVE_POSITIONS = ['QB', 'C', 'WR', 'RB', 'TE', 'OL', 'K'];
const DEFENSIVE_POSITIONS = ['DL', 'LB', 'CB', 'S'];
const PLAYERS_PER_QUARTER = 6;
const TOTAL_QUARTERS = 4;

/**
 * Generate a fair-play lineup from a list of selected players
 */
export function generateLineup(
  selectedPlayers: LineupPlayer[],
  allPositions: string[]
): LineupResult {
  const warnings: string[] = [];

  // Validation
  if (selectedPlayers.length < PLAYERS_PER_QUARTER) {
    warnings.push(`Need at least ${PLAYERS_PER_QUARTER} players. Only ${selectedPlayers.length} selected.`);
    return {
      quarters: [],
      playingTimeSummary: [],
      warnings,
    };
  }

  if (selectedPlayers.length > 10) {
    warnings.push(`Maximum 10 players recommended. ${selectedPlayers.length} selected. Some may have unequal playing time.`);
  }

  // Track quarters played by each player
  const playerQuartersPlayed = new Map<number, number>();
  selectedPlayers.forEach(p => playerQuartersPlayed.set(p.id, 0));

  // Initialize quarters
  const quarters: QuarterAssignment[] = [
    { quarter: 1, positions: {} },
    { quarter: 2, positions: {} },
    { quarter: 3, positions: {} },
    { quarter: 4, positions: {} },
  ];

  // Step 1: Assign 4Q Lock players to Quarter 4
  const q4LockedPlayers = selectedPlayers.filter(p => p.fourthQuarterLock);
  const nonLockedPlayers = selectedPlayers.filter(p => !p.fourthQuarterLock);

  if (q4LockedPlayers.length > PLAYERS_PER_QUARTER) {
    warnings.push(`Too many 4Q Lock players (${q4LockedPlayers.length}). Only ${PLAYERS_PER_QUARTER} can play in Q4.`);
  }

  // Assign Q4 locked players to Q4
  let q4AssignedCount = 0;
  for (const player of q4LockedPlayers) {
    if (q4AssignedCount >= PLAYERS_PER_QUARTER) break;

    const positionKey = player.primaryPosition;
    if (!quarters[3].positions[positionKey]) {
      quarters[3].positions[positionKey] = player;
      playerQuartersPlayed.set(player.id, 1);
      q4AssignedCount++;
    }
  }

  // Fill Q4 remaining spots with locked players (secondary positions)
  for (const player of q4LockedPlayers) {
    if (q4AssignedCount >= PLAYERS_PER_QUARTER) break;

    const positionKey = player.secondaryPosition;
    if (positionKey && !quarters[3].positions[positionKey]) {
      quarters[3].positions[positionKey] = player;
      playerQuartersPlayed.set(player.id, (playerQuartersPlayed.get(player.id) || 0) + 1);
      q4AssignedCount++;
    }
  }

  // Step 2: Distribute non-locked players across all quarters evenly
  // Sort players by position priority (QB, C first)
  const sortedPlayers = [...nonLockedPlayers].sort((a, b) => {
    const priorityA = getPriorityForPosition(a.primaryPosition);
    const priorityB = getPriorityForPosition(b.primaryPosition);
    return priorityB - priorityA;
  });

  // Distribute players to quarters using round-robin to ensure equal playing time
  for (let quarterIdx = 0; quarterIdx < TOTAL_QUARTERS; quarterIdx++) {
    const quarter = quarters[quarterIdx];
    let playersInQuarter = Object.keys(quarter.positions).length;

    // Get players who have played the least
    const availablePlayers = sortedPlayers
      .filter(p => {
        // Don't add if already in this quarter
        const alreadyInQuarter = Object.values(quarter.positions).some(
          assigned => assigned?.id === p.id
        );
        return !alreadyInQuarter;
      })
      .sort((a, b) => {
        const aPlayed = playerQuartersPlayed.get(a.id) || 0;
        const bPlayed = playerQuartersPlayed.get(b.id) || 0;
        return aPlayed - bPlayed;
      });

    // Fill positions
    for (const player of availablePlayers) {
      if (playersInQuarter >= PLAYERS_PER_QUARTER) break;

      // Try primary position first
      if (!quarter.positions[player.primaryPosition]) {
        quarter.positions[player.primaryPosition] = player;
        playerQuartersPlayed.set(player.id, (playerQuartersPlayed.get(player.id) || 0) + 1);
        playersInQuarter++;
        continue;
      }

      // Try secondary position
      if (player.secondaryPosition && !quarter.positions[player.secondaryPosition]) {
        quarter.positions[player.secondaryPosition] = player;
        playerQuartersPlayed.set(player.id, (playerQuartersPlayed.get(player.id) || 0) + 1);
        playersInQuarter++;
        continue;
      }

      // Fill any empty position
      const emptyPosition = allPositions.find(pos => !quarter.positions[pos]);
      if (emptyPosition) {
        quarter.positions[emptyPosition] = player;
        playerQuartersPlayed.set(player.id, (playerQuartersPlayed.get(player.id) || 0) + 1);
        playersInQuarter++;
      }
    }

    // Fill remaining Q4 locked players if Q4 still has space
    if (quarterIdx === 3 && playersInQuarter < PLAYERS_PER_QUARTER) {
      for (const player of q4LockedPlayers) {
        if (playersInQuarter >= PLAYERS_PER_QUARTER) break;

        // Check if already in quarter
        const alreadyInQuarter = Object.values(quarter.positions).some(
          assigned => assigned?.id === player.id
        );

        if (!alreadyInQuarter) {
          const emptyPosition = allPositions.find(pos => !quarter.positions[pos]);
          if (emptyPosition) {
            quarter.positions[emptyPosition] = player;
            playerQuartersPlayed.set(player.id, (playerQuartersPlayed.get(player.id) || 0) + 1);
            playersInQuarter++;
          }
        }
      }
    }
  }

  // Step 3: Create playing time summary
  const playingTimeSummary = selectedPlayers.map(player => ({
    playerId: player.id,
    playerName: player.nickname || `${player.firstName} ${player.lastName}`,
    quartersPlayed: playerQuartersPlayed.get(player.id) || 0,
  }));

  // Step 4: Validate equal distribution
  const minQuarters = Math.min(...playingTimeSummary.map(p => p.quartersPlayed));
  const maxQuarters = Math.max(...playingTimeSummary.map(p => p.quartersPlayed));

  if (maxQuarters - minQuarters > 1) {
    warnings.push(`Playing time is not evenly distributed. Some players play ${maxQuarters} quarters while others play ${minQuarters}.`);
  }

  return {
    quarters,
    playingTimeSummary,
    warnings,
  };
}

/**
 * Get priority score for position (higher = more important)
 */
function getPriorityForPosition(position: string): number {
  if (position === 'QB') return 10;
  if (position === 'C') return 9;
  if (OFFENSIVE_POSITIONS.includes(position)) return 5;
  if (DEFENSIVE_POSITIONS.includes(position)) return 5;
  return 1;
}

/**
 * Get player display name
 */
export function getPlayerDisplayName(player: LineupPlayer): string {
  return player.nickname || `${player.firstName} ${player.lastName}`.trim() || `#${player.jerseyNumber}`;
}
