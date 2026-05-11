import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('nilsjam_session');
    if (session) {
      try { setUser(JSON.parse(session)); } catch { localStorage.removeItem('nilsjam_session'); }
    }
    setLoading(false);
  }, []);

  const register = ({ username, email, password }) => {
    const users = JSON.parse(localStorage.getItem('nilsjam_users') || '[]');
    if (users.find(u => u.email === email))    return { ok:false, error:'Un compte existe déjà avec cet email.' };
    if (users.find(u => u.username === username)) return { ok:false, error:"Ce nom d'utilisateur est déjà pris." };
    const newUser = {
      id: Date.now().toString(), username, email, password,
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=b06aff&color=fff&bold=true&size=128`,
    };
    users.push(newUser);
    localStorage.setItem('nilsjam_users', JSON.stringify(users));
    const session = { id:newUser.id, username:newUser.username, email:newUser.email, avatar:newUser.avatar };
    localStorage.setItem('nilsjam_session', JSON.stringify(session));
    setUser(session);
    return { ok:true };
  };

  const login = ({ email, password }) => {
    const users = JSON.parse(localStorage.getItem('nilsjam_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { ok:false, error:'Email ou mot de passe incorrect.' };
    const session = { id:found.id, username:found.username, email:found.email, avatar:found.avatar };
    localStorage.setItem('nilsjam_session', JSON.stringify(session));
    setUser(session);
    return { ok:true };
  };

  const logout = () => { localStorage.removeItem('nilsjam_session'); setUser(null); };

  const updateUser = (updates) => {
    const session = { ...user, ...updates };
    localStorage.setItem('nilsjam_session', JSON.stringify(session));
    setUser(session);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
