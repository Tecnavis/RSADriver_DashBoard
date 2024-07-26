// src/context/UserContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  phone: string | null;
  setPhonee: (phone: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean; // Add additional values if needed
  userId: string | null;    // Example of another value
  setUserId: (id: string | null) => void; // Example setter function
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phone, setPhonee] = useState<string | null>(localStorage.getItem('phone'));
  const isAuthenticated = phone !== null; // Example of derived state

  const logout = () => {
    localStorage.removeItem('phone');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('driverId');
    localStorage.removeItem('password');
    setPhonee(null);
  };

  return (
    <UserContext.Provider value={{ phone, setPhonee, logout, isAuthenticated}}>
      {children}
    </UserContext.Provider>
  );
};

const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export { UserProvider, useUserContext };
