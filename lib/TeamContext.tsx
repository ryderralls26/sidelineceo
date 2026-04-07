'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface TeamContextType {
  activeTeamId: string | null
  activeTeamName: string | null
  setActiveTeam: (teamId: string, teamName: string) => void
  clearActiveTeam: () => void
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

const STORAGE_KEY = 'flagfooty_activeTeam'

interface TeamProviderProps {
  children: ReactNode
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const [activeTeamName, setActiveTeamName] = useState<string | null>(null)

  // Load active team from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const { teamId, teamName } = JSON.parse(stored)
        setActiveTeamId(teamId)
        setActiveTeamName(teamName)
      } catch (error) {
        console.error('Failed to parse stored team:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const setActiveTeam = (teamId: string, teamName: string) => {
    setActiveTeamId(teamId)
    setActiveTeamName(teamName)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamId, teamName }))
  }

  const clearActiveTeam = () => {
    setActiveTeamId(null)
    setActiveTeamName(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <TeamContext.Provider
      value={{
        activeTeamId,
        activeTeamName,
        setActiveTeam,
        clearActiveTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
