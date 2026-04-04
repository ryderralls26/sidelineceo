// Validation utilities for lineup and roster checks

import { Player } from './lineupGenerator';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class LineupValidator {
  static validate(players: Player[], lineup: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const activePlayers = players.filter(p => p.play);

    // Check player count (must be between 5 and 9)
    if (activePlayers.length === 0) {
      errors.push('No active players. At least one player must be marked as "Play".');
    } else if (activePlayers.length < 5) {
      errors.push(`Not enough active players (${activePlayers.length}). Minimum is 5 players.`);
    } else if (activePlayers.length > 9) {
      errors.push(`Too many active players (${activePlayers.length}). Maximum is 9 players.`);
    }

    // Check for QB in roster
    const hasQB = activePlayers.some(p => p.position1 === 'QB' || p.position2 === 'QB');
    if (!hasQB) {
      errors.push('Missing Quarterback (QB). At least one player must have QB as position 1 or 2.');
    }

    // Check for Center in roster
    const hasC = activePlayers.some(p => p.position1 === 'C' || p.position2 === 'C');
    if (!hasC) {
      errors.push('Missing Center (C). At least one player must have C as position 1 or 2.');
    }

    // Check 4Q Locks
    const fourthQuarterLocks = activePlayers.filter(p => p.fourthQuarterLock);
    if (fourthQuarterLocks.length > 6) {
      errors.push(`Too many 4Q Lock players (${fourthQuarterLocks.length}). Maximum is 6 players per quarter.`);
    }

    // Check duplicate jersey numbers
    const jerseyNumbers = activePlayers
      .map(p => p.jerseyNumber)
      .filter(n => n && n.trim() !== '');
    const duplicates = jerseyNumbers.filter(
      (num, idx, arr) => arr.indexOf(num) !== idx
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate jersey numbers found: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Lineup-specific validations
    if (lineup && lineup.quarters) {
      // Check that QB and C are assigned in every quarter
      lineup.quarters.forEach((quarter: any) => {
        const hasQBInQuarter = quarter.positions['QB'] !== null && quarter.positions['QB'] !== undefined;
        const hasCInQuarter = quarter.positions['C'] !== null && quarter.positions['C'] !== undefined;

        if (!hasQBInQuarter) {
          errors.push(`Quarter ${quarter.quarter}: No player assigned to QB position.`);
        }
        if (!hasCInQuarter) {
          errors.push(`Quarter ${quarter.quarter}: No player assigned to C (Center) position.`);
        }
      });

      // Fair Play Rule: Check for uneven play time (2+ quarters difference)
      const playTime = new Map<number, number>();
      activePlayers.forEach(p => playTime.set(p.id, 0));

      lineup.quarters.forEach((quarter: any) => {
        Object.values(quarter.positions).forEach((player: any) => {
          if (player) {
            playTime.set(player.id, (playTime.get(player.id) || 0) + 1);
          }
        });
      });

      const playTimes = Array.from(playTime.values());
      const minTime = Math.min(...playTimes);
      const maxTime = Math.max(...playTimes);

      // Fair Play: Error if someone sits 2+ quarters while another plays all 4
      if (maxTime === 4 && minTime <= 2) {
        errors.push('Fair Play violation: Some players are playing all 4 quarters while others sit 2 or more quarters.');
      } else if (maxTime - minTime > 1) {
        warnings.push('Uneven play time detected. Some players play significantly more quarters than others.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
