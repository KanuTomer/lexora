import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(Boolean(localStorage.getItem("token")));

  async function loadCurrentUser() {
    if (!localStorage.getItem("token")) {
      setCurrentUser(null);
      setIsLoadingUser(false);
      return null;
    }

    try {
      setIsLoadingUser(true);
      const user = await getMe();
      setCurrentUser(user);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      return user;
    } catch (error) {
      console.error("Failed to load current user", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      setCurrentUser(null);
      return null;
    } finally {
      setIsLoadingUser(false);
    }
  }

  function setSession(session) {
    localStorage.setItem("token", session.token);
    localStorage.setItem("userId", session.user.id);
    localStorage.setItem("role", session.user.role);
    setCurrentUser(session.user);
  }

  function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setCurrentUser(null);
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const value = useMemo(
    () => ({
      clearSession,
      currentUser,
      isLoadingUser,
      loadCurrentUser,
      setCurrentUser,
      setSession,
    }),
    [currentUser, isLoadingUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
