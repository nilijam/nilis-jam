/**
 * src/context/AuthContext.jsx
 * AuthContext Firebase — avec vérification email + envoi mail de bienvenue
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { sendWelcomeEmail, generateConfirmCode } from '../services/emailService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef  = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...docSnap.data() });
        } else {
          setUser({
            id:       firebaseUser.uid,
            email:    firebaseUser.email,
            username: firebaseUser.displayName || 'User',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ─────────────────────────────────────────────
  // REGISTER — inscription + envoi email
  // ─────────────────────────────────────────────
  const register = async ({ username, email, password }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: username });

      const confirmCode = generateConfirmCode();
      const createdAt   = new Date().toISOString();
      const avatar      = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=b06aff&color=fff&bold=true&size=128`;

      const userData = {
        id: cred.user.uid,
        username,
        email,
        avatar,
        createdAt,
        confirmCode,
        emailConfirmed: false,
        plan: 'free',
      };
      await setDoc(doc(db, 'users', cred.user.uid), userData);
      setUser(userData);

      // Envoyer le mail de bienvenue (non bloquant)
      sendWelcomeEmail({ username, email, createdAt, confirmCode });

      return { ok: true };
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
        'auth/weak-password':        'Mot de passe trop faible (min 6 caractères).',
        'auth/invalid-email':        'Email invalide.',
      };
      return { ok: false, error: msgs[e.code] || e.message };
    }
  };

  // ─────────────────────────────────────────────
  // VERIFY CODE — vérification du code email
  // ─────────────────────────────────────────────
  const verifyCode = async (inputCode) => {
    if (!user) return { ok: false, error: 'Utilisateur non connecté.' };

    if (inputCode !== user.confirmCode) {
      return { ok: false, error: 'Code incorrect. Vérifie ton email.' };
    }

    try {
      await updateDoc(doc(db, 'users', user.id), { emailConfirmed: true });
      setUser(prev => ({ ...prev, emailConfirmed: true }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Erreur lors de la vérification.' };
    }
  };

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  const login = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (e) {
      const msgs = {
        'auth/user-not-found':     'Aucun compte avec cet email.',
        'auth/wrong-password':     'Mot de passe incorrect.',
        'auth/invalid-credential': 'Email ou mot de passe incorrect.',
      };
      return { ok: false, error: msgs[e.code] || e.message };
    }
  };

  // ─────────────────────────────────────────────
  // LOGOUT / UPDATE
  // ─────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = async (updates) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), updates);
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, verifyCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
