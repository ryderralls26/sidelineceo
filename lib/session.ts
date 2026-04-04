import { cookies } from 'next/headers';
import { UserRole } from '@prisma/client';

export interface SessionData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isAdmin: boolean;
  emailVerified: Date | string | null;
  activeTeamId?: string;
  activeTeamName?: string;
}

const SESSION_COOKIE_NAME = 'velox_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setSession(sessionData: SessionData) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value) as SessionData;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function updateSessionTeam(teamId: string, teamName: string) {
  const session = await getSession();
  if (session) {
    session.activeTeamId = teamId;
    session.activeTeamName = teamName;
    await setSession(session);
  }
}

export async function clearSessionTeam() {
  const session = await getSession();
  if (session) {
    delete session.activeTeamId;
    delete session.activeTeamName;
    await setSession(session);
  }
}
