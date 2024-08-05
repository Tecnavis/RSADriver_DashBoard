import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  phone: string | null;
  setPhonee: (phone: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  driverId: string | null;
  setDriverId: (id: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phone, setPhonee] = useState<string | null>(localStorage.getItem('phone'));
  const [driverId, setDriverId] = useState<string | null>(localStorage.getItem('driverId'));
  const isAuthenticated = phone !== null;

  const logout = () => {
    localStorage.removeItem('phone');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('driverId');
    localStorage.removeItem('password');
    setPhonee(null);
    setDriverId(null);
  };

  return (
    <UserContext.Provider value={{ phone, setPhonee, isAuthenticated, driverId, setDriverId, logout }}>
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
