// Storage utilities for managing game state, finalized lineups, and archived cards

export type UserRole = 'coach' | 'parent' | 'player';

export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  firstName: string;
  lastName: string;
  role: UserRole;
  isAdmin: boolean; // For parents who have admin access
  teamId?: string; // For multi-team support in future
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isAdmin: boolean;
  loginAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  sentBy: string; // userId
  sentAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface Award {
  id: string;
  gameId: number;
  playerId: number;
  awardType: string; // e.g., "MVP", "Defensive POYG", "Offensive POYG"
  notes: string;
  awardedBy: string; // userId
  awardedAt: string;
}

export interface AwardType {
  id: string;
  name: string;
  description?: string;
}

export interface Division {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  playerIds: number[];
  userId?: string;
}

export interface VenmoRequest {
  id: string;
  parentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
  sentAt: string;
  paidAt?: string;
}

export interface TeamSeason {
  id: string;
  teamId: string;
  name: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  sport: 'flag-football' | 'soccer';
  division?: 'KIND' | 'FR' | 'SO' | 'JR' | 'SR'; // Only for flag football
  season: 'fall' | 'spring' | 'summer';
  year: string; // e.g., "2026"
  logoUrl?: string; // For logo upload
  coachId: string;
  createdAt: string;
}

export interface PasswordResetToken {
  email: string;
  token: string;
  expiresAt: string;
}

export interface Game {
  id: number;
  date: string;
  opponent: string;
  location: string;
  field?: string;
  time?: string;
  status: 'scheduled' | 'completed';
  result?: string;
}

export interface FinalizedGame {
  gameId: number;
  gameDate: string;
  opponent: string;
  location: string;
  field?: string;
  time?: string;
  finalizedAt: string;
  lineup: any;
  roster: any[];
}

export interface CoachData {
  coach1Name: string;
  coach2Name: string;
  selectedCoachIndex: number; // 0 for coach1, 1 for coach2
}

export class StorageManager {
  private static FINALIZED_KEY = 'finalized_games';
  private static GAMES_KEY = 'games_schedule';
  private static USERS_KEY = 'users';
  private static SESSION_KEY = 'current_session';
  private static INVITES_KEY = 'team_invites';
  private static AWARDS_KEY = 'player_awards';
  private static AWARD_TYPES_KEY = 'award_types';
  private static RESET_TOKENS_KEY = 'password_reset_tokens';
  private static COACHES_KEY = 'team_coaches';
  private static DIVISIONS_KEY = 'divisions';
  private static PARENTS_KEY = 'parents';
  private static VENMO_REQUESTS_KEY = 'venmo_requests';
  private static TEAMS_KEY = 'teams';
  private static SEASONS_KEY = 'team_seasons';
  private static GAME_NOTES_KEY = 'game_notes';

  // ===== USER MANAGEMENT =====
  static getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load users:', e);
      return [];
    }
  }

  static getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  static createUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  // ===== SESSION MANAGEMENT =====
  static getCurrentSession(): Session | null {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load session:', e);
      return null;
    }
  }

  static setSession(session: Session): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // ===== INVITE MANAGEMENT =====
  static getAllInvites(): Invite[] {
    try {
      const data = localStorage.getItem(this.INVITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load invites:', e);
      return [];
    }
  }

  static createInvite(invite: Invite): void {
    const invites = this.getAllInvites();
    invites.push(invite);
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
  }

  static updateInvite(inviteId: string, updates: Partial<Invite>): void {
    const invites = this.getAllInvites();
    const index = invites.findIndex(i => i.id === inviteId);
    if (index !== -1) {
      invites[index] = { ...invites[index], ...updates };
      localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
    }
  }

  static deleteInvite(inviteId: string): void {
    const invites = this.getAllInvites();
    const filtered = invites.filter(i => i.id !== inviteId);
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(filtered));
  }

  // ===== AWARD MANAGEMENT =====
  static getAllAwards(): Award[] {
    try {
      const data = localStorage.getItem(this.AWARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load awards:', e);
      return [];
    }
  }

  static getAwardsByGameId(gameId: number): Award[] {
    return this.getAllAwards().filter(a => a.gameId === gameId);
  }

  static getAwardsByPlayerId(playerId: number): Award[] {
    return this.getAllAwards().filter(a => a.playerId === playerId);
  }

  static createAward(award: Award): void {
    const awards = this.getAllAwards();
    awards.push(award);
    localStorage.setItem(this.AWARDS_KEY, JSON.stringify(awards));
  }

  static deleteAward(awardId: string): void {
    const awards = this.getAllAwards();
    const filtered = awards.filter(a => a.id !== awardId);
    localStorage.setItem(this.AWARDS_KEY, JSON.stringify(filtered));
  }

  // ===== AWARD TYPES MANAGEMENT =====
  static getAwardTypes(): AwardType[] {
    try {
      const data = localStorage.getItem(this.AWARD_TYPES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Default award types
      const defaults: AwardType[] = [
        { id: '1', name: 'MVP', description: 'Most Valuable Player' },
        { id: '2', name: 'Defensive POYG', description: 'Defensive Player of the Game' },
        { id: '3', name: 'Offensive POYG', description: 'Offensive Player of the Game' },
      ];
      this.saveAwardTypes(defaults);
      return defaults;
    } catch (e) {
      console.error('Failed to load award types:', e);
      return [];
    }
  }

  static saveAwardTypes(types: AwardType[]): void {
    localStorage.setItem(this.AWARD_TYPES_KEY, JSON.stringify(types));
  }

  // ===== PASSWORD RESET =====
  static createResetToken(email: string): string {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetToken: PasswordResetToken = {
      email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    };

    const tokens = this.getAllResetTokens();
    // Remove any existing tokens for this email
    const filtered = tokens.filter(t => t.email !== email);
    filtered.push(resetToken);
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(filtered));

    return token;
  }

  static getResetToken(token: string): PasswordResetToken | null {
    const tokens = this.getAllResetTokens();
    const found = tokens.find(t => t.token === token);

    if (found && new Date(found.expiresAt) > new Date()) {
      return found;
    }
    return null;
  }

  static deleteResetToken(token: string): void {
    const tokens = this.getAllResetTokens();
    const filtered = tokens.filter(t => t.token !== token);
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(filtered));
  }

  private static getAllResetTokens(): PasswordResetToken[] {
    try {
      const data = localStorage.getItem(this.RESET_TOKENS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load reset tokens:', e);
      return [];
    }
  }

  // ===== GAME MANAGEMENT (existing methods) =====
  static getAllGames(): Game[] {
    try {
      const data = localStorage.getItem(this.GAMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load games:', e);
      return [];
    }
  }

  static getGame(gameId: number): Game | null {
    const games = this.getAllGames();
    return games.find(g => g.id === gameId) || null;
  }

  static saveGames(games: Game[]): void {
    localStorage.setItem(this.GAMES_KEY, JSON.stringify(games));
  }

  static finalizeGame(game: FinalizedGame): void {
    const finalized = this.getAllFinalizedGames();
    const filtered = finalized.filter(g => g.gameId !== game.gameId);
    filtered.push(game);
    localStorage.setItem(this.FINALIZED_KEY, JSON.stringify(filtered));
  }

  static getAllFinalizedGames(): FinalizedGame[] {
    try {
      const data = localStorage.getItem(this.FINALIZED_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load finalized games:', e);
      return [];
    }
  }

  static getFinalizedGame(gameId: number): FinalizedGame | null {
    const games = this.getAllFinalizedGames();
    return games.find(g => g.gameId === gameId) || null;
  }

  static isGameFinalized(gameId: number): boolean {
    return this.getFinalizedGame(gameId) !== null;
  }

  static deleteFinalizedGame(gameId: number): void {
    const finalized = this.getAllFinalizedGames();
    const filtered = finalized.filter(g => g.gameId !== gameId);
    localStorage.setItem(this.FINALIZED_KEY, JSON.stringify(filtered));
  }

  // ===== COACH MANAGEMENT =====
  static getCoachData(): CoachData {
    try {
      const data = localStorage.getItem(this.COACHES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Default coach data - empty strings for blank slate
      return {
        coach1Name: '',
        coach2Name: '',
        selectedCoachIndex: 0,
      };
    } catch (e) {
      console.error('Failed to load coach data:', e);
      return {
        coach1Name: '',
        coach2Name: '',
        selectedCoachIndex: 0,
      };
    }
  }

  static saveCoachData(coachData: CoachData): void {
    localStorage.setItem(this.COACHES_KEY, JSON.stringify(coachData));
  }

  // ===== DIVISION MANAGEMENT =====
  static getDivisions(): Division[] {
    try {
      const data = localStorage.getItem(this.DIVISIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      const defaults: Division[] = [
        { id: '1', name: 'Kindergarten', abbreviation: 'KIND' },
        { id: '2', name: 'Freshman', abbreviation: 'FR' },
        { id: '3', name: 'Sophomore', abbreviation: 'SOPH' },
        { id: '4', name: 'Junior', abbreviation: 'JR' },
        { id: '5', name: 'Senior', abbreviation: 'SR' },
      ];
      this.saveDivisions(defaults);
      return defaults;
    } catch (e) {
      console.error('Failed to load divisions:', e);
      return [];
    }
  }

  static saveDivisions(divisions: Division[]): void {
    localStorage.setItem(this.DIVISIONS_KEY, JSON.stringify(divisions));
  }

  // ===== PARENT MANAGEMENT =====
  static getAllParents(): Parent[] {
    try {
      const data = localStorage.getItem(this.PARENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load parents:', e);
      return [];
    }
  }

  static getParent(id: string): Parent | null {
    return this.getAllParents().find(p => p.id === id) || null;
  }

  static createParent(parent: Parent): void {
    const parents = this.getAllParents();
    parents.push(parent);
    localStorage.setItem(this.PARENTS_KEY, JSON.stringify(parents));
  }

  static updateParent(id: string, updates: Partial<Parent>): void {
    const parents = this.getAllParents();
    const index = parents.findIndex(p => p.id === id);
    if (index !== -1) {
      parents[index] = { ...parents[index], ...updates };
      localStorage.setItem(this.PARENTS_KEY, JSON.stringify(parents));
    }
  }

  static deleteParent(id: string): void {
    const parents = this.getAllParents();
    const filtered = parents.filter(p => p.id !== id);
    localStorage.setItem(this.PARENTS_KEY, JSON.stringify(filtered));
  }

  // ===== VENMO REQUEST MANAGEMENT =====
  static getAllVenmoRequests(): VenmoRequest[] {
    try {
      const data = localStorage.getItem(this.VENMO_REQUESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load venmo requests:', e);
      return [];
    }
  }

  static createVenmoRequest(request: VenmoRequest): void {
    const requests = this.getAllVenmoRequests();
    requests.push(request);
    localStorage.setItem(this.VENMO_REQUESTS_KEY, JSON.stringify(requests));
  }

  static updateVenmoRequest(id: string, updates: Partial<VenmoRequest>): void {
    const requests = this.getAllVenmoRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      localStorage.setItem(this.VENMO_REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  // ===== TEAM & SEASON MANAGEMENT =====
  static getAllTeams(): Team[] {
    try {
      const data = localStorage.getItem(this.TEAMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load teams:', e);
      return [];
    }
  }

  static getTeam(id: string): Team | null {
    const teams = this.getAllTeams();
    return teams.find(t => t.id === id) || null;
  }

  static getTeamsByCoach(coachId: string): Team[] {
    return this.getAllTeams().filter(t => t.coachId === coachId);
  }

  static createTeam(team: Team): void {
    const teams = this.getAllTeams();
    teams.push(team);
    localStorage.setItem(this.TEAMS_KEY, JSON.stringify(teams));
  }

  static updateTeam(id: string, updates: Partial<Team>): void {
    const teams = this.getAllTeams();
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...updates };
      localStorage.setItem(this.TEAMS_KEY, JSON.stringify(teams));
    }
  }

  static deleteTeam(id: string): void {
    const teams = this.getAllTeams();
    const filtered = teams.filter(t => t.id !== id);
    localStorage.setItem(this.TEAMS_KEY, JSON.stringify(filtered));
  }

  static getAllSeasons(): TeamSeason[] {
    try {
      const data = localStorage.getItem(this.SEASONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load seasons:', e);
      return [];
    }
  }

  static createSeason(season: TeamSeason): void {
    const seasons = this.getAllSeasons();
    seasons.push(season);
    localStorage.setItem(this.SEASONS_KEY, JSON.stringify(seasons));
  }

  static updateSeason(id: string, updates: Partial<TeamSeason>): void {
    const seasons = this.getAllSeasons();
    const index = seasons.findIndex(s => s.id === id);
    if (index !== -1) {
      seasons[index] = { ...seasons[index], ...updates };
      localStorage.setItem(this.SEASONS_KEY, JSON.stringify(seasons));
    }
  }

  // ===== GAME NOTES MANAGEMENT =====
  static getGameNotes(gameId: number): string {
    try {
      const data = localStorage.getItem(this.GAME_NOTES_KEY);
      const notes = data ? JSON.parse(data) : {};
      return notes[gameId] || '';
    } catch (e) {
      console.error('Failed to load game notes:', e);
      return '';
    }
  }

  static saveGameNotes(gameId: number, notes: string): void {
    try {
      const data = localStorage.getItem(this.GAME_NOTES_KEY);
      const allNotes = data ? JSON.parse(data) : {};
      allNotes[gameId] = notes;
      localStorage.setItem(this.GAME_NOTES_KEY, JSON.stringify(allNotes));
    } catch (e) {
      console.error('Failed to save game notes:', e);
    }
  }
}
