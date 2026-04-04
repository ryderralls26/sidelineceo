'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@prisma/client';

interface Session {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isAdmin: boolean;
  activeTeamId?: string;
  activeTeamName?: string;
}

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isCoach: boolean;
  isParent: boolean;
  isPlayer: boolean;
  canEdit: boolean;
  activeTeamName: string | null;
  login: (email: string, password: string, redirect?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: string, isAdmin?: boolean) => Promise<boolean>;
  updateSession: () => Promise<void>;
  setActiveTeam: (teamId: string, teamName: string) => void;
  clearActiveTeam: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setSession(data.session || null);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateSession();
  }, []);

  const login = async (email: string, password: string, redirect?: string): Promise<boolean> => {
    try {
      // Normalize email: trim whitespace and convert to lowercase
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, redirect }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success) {
        await updateSession();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    isAdmin: boolean = false
  ): Promise<boolean> => {
    try {
      // Normalize email: trim whitespace and convert to lowercase
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, firstName, lastName, role, isAdmin }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success) {
        await updateSession();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const setActiveTeam = (teamId: string, teamName: string) => {
    if (session) {
      const updatedSession = {
        ...session,
        activeTeamId: teamId,
        activeTeamName: teamName,
      };
      setSession(updatedSession);
    }
  };

  const clearActiveTeam = () => {
    if (session) {
      const updatedSession = { ...session };
      delete updatedSession.activeTeamId;
      delete updatedSession.activeTeamName;
      setSession(updatedSession);
    }
  };

  const isAuthenticated = session !== null;
  const isCoach = session?.role === 'coach';
  const isParent = session?.role === 'parent';
  const isPlayer = session?.role === 'player';
  const canEdit = isCoach || (isParent && session?.isAdmin);
  const activeTeamName = session?.activeTeamName || null;

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        isCoach,
        isParent,
        isPlayer,
        canEdit,
        activeTeamName,
        login,
        logout,
        signup,
        updateSession,
        setActiveTeam,
        clearActiveTeam,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
