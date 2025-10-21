'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // ✅ Login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // ✅ Logout (only removes currentUser, not users array)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/'); // redirect home
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
