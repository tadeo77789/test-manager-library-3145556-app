import { createContext, useContext, useEffect, useState } from 'react';
import { session } from './api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(session.token);
  const [role, setRole] = useState(session.role);

  useEffect(() => {
    const onExpired = () => { setToken(null); setRole(null); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = (t, r) => { session.set(t, r); setToken(t); setRole(r); };
  const logout = () => { session.clear(); setToken(null); setRole(null); };
  return <Ctx.Provider value={{ token, role, isAdmin: role === 'admin', login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
