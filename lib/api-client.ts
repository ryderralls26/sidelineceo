// Client-side API wrapper for database operations
// This provides a clean interface for client components to interact with the database

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
      }
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    console.error('API fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Teams API
export const teamsApi = {
  getAll: () => apiFetch('/api/teams', { method: 'GET' }),
  getByCoach: (coachId: string) =>
    apiFetch(`/api/teams?coachId=${coachId}`, { method: 'GET' }),
  getById: (id: string) => apiFetch(`/api/teams/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiFetch(`/api/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/api/teams/${id}`, { method: 'DELETE' }),
}

// Players API
export const playersApi = {
  getByTeam: (teamId: string) =>
    apiFetch(`/api/players?teamId=${teamId}`, { method: 'GET' }),
  getById: (id: number) => apiFetch(`/api/players/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/players', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch(`/api/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  bulkUpdate: (updates: Array<{ id: number; data: any }>) =>
    apiFetch('/api/players/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    }),
  delete: (id: number) =>
    apiFetch(`/api/players/${id}`, { method: 'DELETE' }),
}

// Games API
export const gamesApi = {
  getByTeam: (teamId: string) =>
    apiFetch(`/api/games?teamId=${teamId}`, { method: 'GET' }),
  getById: (id: number) => apiFetch(`/api/games/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/games', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch(`/api/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  finalize: (id: number) =>
    apiFetch(`/api/games/${id}/finalize`, { method: 'POST' }),
  getFinalizedGames: (teamId: string) =>
    apiFetch(`/api/games/finalized?teamId=${teamId}`, { method: 'GET' }),
  delete: (id: number) =>
    apiFetch(`/api/games/${id}`, { method: 'DELETE' }),
}

// Lineups API
export const lineupsApi = {
  getByGame: (gameId: number) =>
    apiFetch(`/api/lineups/${gameId}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/lineups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (gameId: number, data: any) =>
    apiFetch(`/api/lineups/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  upsert: (data: any) =>
    apiFetch('/api/lineups/upsert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (gameId: number) =>
    apiFetch(`/api/lineups/${gameId}`, { method: 'DELETE' }),
}

// Awards API
export const awardsApi = {
  getByGame: (gameId: number) =>
    apiFetch(`/api/awards?gameId=${gameId}`, { method: 'GET' }),
  getByPlayer: (playerId: number) =>
    apiFetch(`/api/awards?playerId=${playerId}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/awards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/api/awards/${id}`, { method: 'DELETE' }),
  getTypes: () => apiFetch('/api/awards/types', { method: 'GET' }),
  createType: (name: string, description?: string) =>
    apiFetch('/api/awards/types', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
}

// Positions API
export const positionsApi = {
  getAll: (sport: string = 'flag_football') =>
    apiFetch(`/api/positions?sport=${sport}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch(`/api/positions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch(`/api/positions/${id}`, { method: 'DELETE' }),
}

// Users API
export const usersApi = {
  getById: (id: string) => apiFetch(`/api/users/${id}`, { method: 'GET' }),
  getByEmail: (email: string) =>
    apiFetch(`/api/users?email=${email}`, { method: 'GET' }),
  create: (data: any) =>
    apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
