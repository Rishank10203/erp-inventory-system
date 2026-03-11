import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(localStorage.getItem("access"));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setAccess(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access", accessToken);
    localStorage.setItem("refresh", refreshToken);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await API.post("accounts/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      setUser(null);
      setAccess(null);
      window.location.href = "/login";
    }
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isStaff = () => user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <AuthContext.Provider value={{ user, setUser, access, setAccess, login, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};