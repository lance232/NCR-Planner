import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define user role types for the system
export type UserRole = 'scheduler' | 'bank' | 'engineer' | 'admin';

// User data structure
interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  bankId?: string; // For bank users to identify which bank they represent
  isTemporaryPassword?: boolean; // Flag for temporary passwords that need to be changed
}

// Engineer data structure
export interface Engineer {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  availability?: 'available' | 'busy' | 'offline';
}

// Bank data structure
export interface Bank {
  id: string;
  name: string;
  email: string;
  bankId: string;
}

// Authentication context interface - defines all auth-related methods
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string, role: UserRole, bankId?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  engineers: Engineer[];
  banks: Bank[];
  createUserAccount: (name: string, email: string, role: UserRole, temporaryPassword: string, bankId?: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  getAllUsers: () => any[];
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo users for testing
const defaultMockUsers = [
  { id: '0', name: 'System Admin', role: 'admin' as UserRole, email: 'admin@ncrplanner.com', password: 'admin123' },
  { id: '1', name: 'John Scheduler', role: 'scheduler' as UserRole, email: 'scheduler@example.com', password: 'scheduler123' },
  { id: '2', name: 'Bank A Representative', role: 'bank' as UserRole, email: 'bank@example.com', password: 'bank123', bankId: 'bank1' },
  { id: '3', name: 'Mike Engineer', role: 'engineer' as UserRole, email: 'engineer@example.com', password: 'engineer123' },
  { id: '4', name: 'Bank B Representative', role: 'bank' as UserRole, email: 'bankb@example.com', password: 'bank123', bankId: 'bank2' },
  { id: '5', name: 'Bank C Representative', role: 'bank' as UserRole, email: 'bankc@example.com', password: 'bank123', bankId: 'bank3' },
];

// Retrieve users from localStorage or initialize with defaults
const getStoredUsers = () => {
  const stored = localStorage.getItem('ncrPlannerUsers');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('ncrPlannerUsers', JSON.stringify(defaultMockUsers));
  return defaultMockUsers;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage if exists
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ncrPlannerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Load engineers from registered users
  const [engineers, setEngineers] = useState<Engineer[]>(() => {
    const users = getStoredUsers();
    const engineerUsers = users.filter(u => u.role === 'engineer');
    return engineerUsers.map(eng => ({
      id: eng.id,
      name: eng.name,
      email: eng.email,
      specialization: eng.specialization || 'General',
      availability: 'available' as const
    }));
  });

  // Load banks from registered users
  const [banks, setBanks] = useState<Bank[]>(() => {
    const users = getStoredUsers();
    const bankUsers = users.filter(u => u.role === 'bank');
    return bankUsers.map(bank => ({
      id: bank.id,
      name: bank.name,
      email: bank.email,
      bankId: bank.bankId || bank.id
    }));
  });

  // Refresh banks and engineers lists after user changes
  const refreshLists = () => {
    const users = getStoredUsers();
    
    const engineerUsers = users.filter(u => u.role === 'engineer');
    setEngineers(engineerUsers.map(eng => ({
      id: eng.id,
      name: eng.name,
      email: eng.email,
      specialization: eng.specialization || 'General',
      availability: 'available' as const
    })));

    const bankUsers = users.filter(u => u.role === 'bank');
    setBanks(bankUsers.map(bank => ({
      id: bank.id,
      name: bank.name,
      email: bank.email,
      bankId: bank.bankId || bank.id
    })));
  };

  // Authenticate user with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    const allUsers = getStoredUsers();
    
    const foundUser = allUsers.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ncrPlannerUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  // Register new user (for future self-registration feature)
  const register = async (firstName: string, lastName: string, email: string, password: string, role: UserRole, bankId?: string): Promise<boolean> => {
    // Check if user already exists
    const existingUser = getStoredUsers().find(u => u.email === email);
    if (existingUser) {
      return false;
    }
    
    const newUser = {
      id: (getStoredUsers().length + 1).toString(),
      name: `${firstName} ${lastName}`,
      role,
      email,
      password,
      bankId
    };
    const updatedUsers = [...getStoredUsers(), newUser];
    localStorage.setItem('ncrPlannerUsers', JSON.stringify(updatedUsers));
    refreshLists();
    return true;
  };

  // Log out current user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('ncrPlannerUser');
  };

  // Admin function to create new user accounts with temporary passwords
  const createUserAccount = async (name: string, email: string, role: UserRole, temporaryPassword: string, bankId?: string): Promise<boolean> => {
    // Check if user already exists
    const existingUser = getStoredUsers().find(u => u.email === email);
    if (existingUser) {
      return false;
    }
    
    const newUser = {
      id: (getStoredUsers().length + 1).toString(),
      name,
      role,
      email,
      password: temporaryPassword,
      isTemporaryPassword: true,
      bankId
    };
    const updatedUsers = [...getStoredUsers(), newUser];
    localStorage.setItem('ncrPlannerUsers', JSON.stringify(updatedUsers));
    refreshLists();
    return true;
  };

  // Allow user to change their password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    const foundUser = getStoredUsers().find(
      u => u.email === user.email && u.password === currentPassword
    );

    if (foundUser) {
      const updatedUser = {
        ...foundUser,
        password: newPassword,
        isTemporaryPassword: false
      };
      const updatedUsers = getStoredUsers().map(u => u.id === foundUser.id ? updatedUser : u);
      localStorage.setItem('ncrPlannerUsers', JSON.stringify(updatedUsers));
      
      // Update current user state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ncrPlannerUser', JSON.stringify(userWithoutPassword));
      
      return true;
    }
    return false;
  };

  // Admin function to get all users
  const getAllUsers = () => {
    return getStoredUsers();
  };

  // Admin function to delete a user
  const deleteUser = async (userId: string): Promise<boolean> => {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }
    
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('ncrPlannerUsers', JSON.stringify(updatedUsers));
    refreshLists();
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      engineers,
      banks,
      createUserAccount,
      changePassword,
      getAllUsers,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}