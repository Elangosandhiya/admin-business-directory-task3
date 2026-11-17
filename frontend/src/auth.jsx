import { createContext, useContext, useMemo, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  async function login(username, password) {
    const response = await api.post("/auth/login", { username, password });
    localStorage.setItem("adminToken", response.data.token);
    setToken(response.data.token);
  }

  function logout() {
    localStorage.removeItem("adminToken");
    setToken(null);
  }

  const value = useMemo(() => ({ token, login, logout }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
