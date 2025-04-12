'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface User {
  Web_MenuAccess: string[];
  // Add other user properties
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  refreshSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          ...decoded.user,
          Web_MenuAccess: decoded.user.Web_MenuAccess ? decoded.user.Web_MenuAccess.split(',') : []
        });
      } catch (error) {
        console.error('Session decode error:', error);
        setUser(null);
        Cookies.remove('token');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
