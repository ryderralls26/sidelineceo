// Shared types for the application

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
  secondaryPosition?: string;
  division?: string;
  parentIds?: string[];
}

export interface Position {
  id: number;
  name: string;
  abbreviation: string;
  rank: 1 | 2;
}

export interface Game {
  id: number;
  date: string;
  opponent: string;
  location: string;
  status: 'scheduled' | 'finalized';
  result?: string;
}

// Utility function to get positions from localStorage
export function getPositionsFromStorage(): Position[] {
  if (typeof window === 'undefined') return getDefaultPositions();

  try {
    const saved = localStorage.getItem('positions');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load positions:', e);
  }

  return getDefaultPositions();
}

// Utility function to get roster from localStorage
export function getRosterFromStorage(): Player[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem('roster');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load roster:', e);
  }

  return [];
}

// Utility function to save roster to localStorage
export function saveRosterToStorage(roster: Player[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('roster', JSON.stringify(roster));
  } catch (e) {
    console.error('Failed to save roster:', e);
  }
}

// Get default positions
export function getDefaultPositions(): Position[] {
  return [
    { id: 1, name: 'Quarterback', abbreviation: 'QB', rank: 1 },
    { id: 2, name: 'Center', abbreviation: 'C', rank: 1 },
    { id: 3, name: 'Running Back', abbreviation: 'RB', rank: 1 },
    { id: 4, name: 'Wide Receiver', abbreviation: 'WR', rank: 1 },
    { id: 5, name: 'Tight End', abbreviation: 'TE', rank: 1 },
    { id: 6, name: 'Defensive Line', abbreviation: 'DL', rank: 1 },
    { id: 7, name: 'Linebacker', abbreviation: 'LB', rank: 1 },
    { id: 8, name: 'Cornerback', abbreviation: 'CB', rank: 1 },
    { id: 9, name: 'Safety', abbreviation: 'S', rank: 1 },
  ];
}

// Get position abbreviations array
export function getPositionAbbreviations(): string[] {
  const positions = getPositionsFromStorage();
  return positions.map(p => p.abbreviation).filter(a => a);
}
