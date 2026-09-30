import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

const SESSION_KEY = "docuvault-session";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const loggedInUser = response?.data?.user;
      const token = response?.data?.token;
      if (!loggedInUser) {
        console.error("Login failed - no user in response:", response);
        throw new Error("Invalid login credentials");
      }
      // Store token with user object so api.js interceptor can read it
      const userWithToken = { ...loggedInUser, token };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userWithToken));
      setUser(userWithToken);
      return userWithToken;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    const registeredUser = response?.data?.user;
    if (!registeredUser) {
      throw new Error("Registration failed");
    }
    return registeredUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.warn("Logout fallback triggered");
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const updateUser = async (data) => {
    const response = await api.put("/auth/me", data);
    const updatedUser = response?.data?.user;
    if (updatedUser) {
      const merged = { ...user, ...updatedUser };
      localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      setUser(merged);
    }
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
