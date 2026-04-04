'use server';

import { checkTeamAccess } from '@/lib/actions/teams';

export interface AccessCheckResult {
  hasAccess: boolean;
  role?: 'OWNER' | 'ADMIN' | 'CO_COACH' | 'VIEWER';
  isCoach: boolean;
  isViewer: boolean;
  canEdit: boolean;
}

/**
 * Check if a user has access to a team and return their role/permissions
 */
export async function checkUserTeamAccess(
  userId: string,
  teamId: string
): Promise<AccessCheckResult> {
  const result = await checkTeamAccess(userId, teamId);

  if (!result.success || !result.hasAccess) {
    return {
      hasAccess: false,
      isCoach: false,
      isViewer: false,
      canEdit: false,
    };
  }

  const isCoach = result.role === 'OWNER' || result.role === 'ADMIN' || result.role === 'CO_COACH';
  const isViewer = result.role === 'VIEWER';

  return {
    hasAccess: true,
    role: result.role,
    isCoach,
    isViewer,
    canEdit: isCoach, // Only coaches can edit
  };
}

/**
 * Ensure user is a coach for the team, throw error if not
 */
export async function requireCoachAccess(userId: string, teamId: string) {
  const access = await checkUserTeamAccess(userId, teamId);

  if (!access.hasAccess) {
    throw new Error('Access denied: You do not have access to this team');
  }

  if (!access.isCoach) {
    throw new Error('Access denied: Coach privileges required');
  }

  return access;
}

/**
 * Ensure user has at least viewer access to the team
 */
export async function requireTeamAccess(userId: string, teamId: string) {
  const access = await checkUserTeamAccess(userId, teamId);

  if (!access.hasAccess) {
    throw new Error('Access denied: You do not have access to this team');
  }

  return access;
}
