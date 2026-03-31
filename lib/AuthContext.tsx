'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageManager, Session, UserRole } from './storage';

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isCoach: boolean;
  isParent: boolean;
  isPlayer: boolean;
  canEdit: boolean; // Coach or Parent with admin
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, firstName: string, lastName: string, role: UserRole, isAdmin?: boolean) => Promise<boolean>;
  updateSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initialize default coach account if no users exist
    const users = StorageManager.getAllUsers();
    if (users.length === 0) {
      const defaultCoach = {
        id: 'default-coach',
        email: 'coach@example.com',
        password: 'coach123',
        firstName: 'Coach',
        lastName: 'Demo',
        role: 'coach' as UserRole,
        isAdmin: true,
        createdAt: new Date().toISOString(),
      };
      StorageManager.createUser(defaultCoach);

      // Auto-login as default coach
      const defaultSession: Session = {
        userId: defaultCoach.id,
        email: defaultCoach.email,
        firstName: defaultCoach.firstName,
        lastName: defaultCoach.lastName,
        role: defaultCoach.role,
        isAdmin: defaultCoach.isAdmin,
        loginAt: new Date().toISOString(),
      };
      StorageManager.setSession(defaultSession);
      setSession(defaultSession);
    } else {
      // Load existing session
      const currentSession = StorageManager.getCurrentSession();
      setSession(currentSession);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = StorageManager.getUserByEmail(email);

    if (!user) {
      return false;
    }

    if (user.password !== password) {
      return false;
    }

    const newSession: Session = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isAdmin: user.isAdmin,
      loginAt: new Date().toISOString(),
    };

    StorageManager.setSession(newSession);
    setSession(newSession);
    return true;
  };

  const logout = () => {
    StorageManager.clearSession();
    setSession(null);
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    isAdmin: boolean = false
  ): Promise<boolean> => {
    // Check if user already exists
    const existingUser = StorageManager.getUserByEmail(email);
    if (existingUser) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      firstName,
      lastName,
      role,
      isAdmin,
      createdAt: new Date().toISOString(),
    };

    StorageManager.createUser(newUser);

    // Automatically log in after signup
    const newSession: Session = {
      userId: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      isAdmin: newUser.isAdmin,
      loginAt: new Date().toISOString(),
    };

    StorageManager.setSession(newSession);
    setSession(newSession);
    return true;
  };

  const updateSession = () => {
    const currentSession = StorageManager.getCurrentSession();
    setSession(currentSession);
  };

  const isAuthenticated = session !== null;
  const isCoach = session?.role === 'coach';
  const isParent = session?.role === 'parent';
  const isPlayer = session?.role === 'player';
  const canEdit = isCoach || (isParent && session?.isAdmin);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        isCoach,
        isParent,
        isPlayer,
        canEdit,
        login,
        logout,
        signup,
        updateSession,
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
