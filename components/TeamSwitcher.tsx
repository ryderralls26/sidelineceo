'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { useTeam } from '@/lib/TeamContext'
import { useAuth } from '@/lib/AuthContext'
import { getUserTeams, createTeamWithMembership } from '@/lib/actions/teams'
import { Division } from '@prisma/client'

interface Team {
  id: string
  name: string
  division: Division | null
  userRole: string
}

export default function TeamSwitcher() {
  const { activeTeamId, activeTeamName, setActiveTeam } = useTeam()
  const { session } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Create team form state
  const [teamName, setTeamName] = useState('')
  const [division, setDivision] = useState<Division>(Division.FR)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (session?.userId) {
      loadTeams()
    }
  }, [session?.userId])

  const loadTeams = async () => {
    if (!session?.userId) return

    setLoading(true)
    const result = await getUserTeams(session.userId)
    if (result.success && result.teams) {
      setTeams(result.teams as Team[])

      // If no active team is set but user has teams, set the first one
      if (!activeTeamId && result.teams.length > 0) {
        const firstTeam = result.teams[0]
        setActiveTeam(firstTeam.id, firstTeam.name)
      }
    }
    setLoading(false)
  }

  const handleTeamSelect = (team: Team) => {
    setActiveTeam(team.id, team.name)
    setIsOpen(false)
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.userId || !teamName.trim()) return

    setCreating(true)
    const result = await createTeamWithMembership({
      name: teamName.trim(),
      division,
      coachId: session.userId,
    })

    if (result.success && result.team) {
      // Reload teams
      await loadTeams()

      // Set the new team as active
      setActiveTeam(result.team.id, result.team.name)

      // Reset form and close modal
      setTeamName('')
      setDivision(Division.FR)
      setShowCreateModal(false)
    } else {
      alert('Failed to create team. Please try again.')
    }
    setCreating(false)
  }

  if (!session) return null

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-400">
        Loading teams...
      </div>
    )
  }

  return (
    <>
      {/* Team Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
        >
          <span className="font-medium">
            {activeTeamName || 'Select Team'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl z-20 overflow-hidden">
              {teams.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors ${
                        team.id === activeTeamId ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{team.name}</div>
                          <div className="text-sm text-gray-400">
                            {team.division} · {team.userRole}
                          </div>
                        </div>
                        {team.id === activeTeamId && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Create New Team Button */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setShowCreateModal(true)
                }}
                className="w-full text-left px-4 py-3 bg-slate-900 hover:bg-slate-800 transition-colors border-t border-slate-700 flex items-center gap-2 text-green-400 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create New Team
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Team</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTeam}>
              <div className="space-y-4">
                {/* Team Name */}
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="Enter team name"
                    required
                  />
                </div>

                {/* Division */}
                <div>
                  <label htmlFor="division" className="block text-sm font-medium text-gray-300 mb-1">
                    Division
                  </label>
                  <select
                    id="division"
                    value={division}
                    onChange={(e) => setDivision(e.target.value as Division)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                    required
                  >
                    <option value={Division.KIND}>Kindergarten</option>
                    <option value={Division.FR}>Freshman</option>
                    <option value={Division.SO}>Sophomore</option>
                    <option value={Division.JR}>Junior</option>
                    <option value={Division.SR}>Senior</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating || !teamName.trim()}
                >
                  {creating ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
