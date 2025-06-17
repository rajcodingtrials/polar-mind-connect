
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  username: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
};

const users = [
  { username: "leo", password: "leospeaks", name: "Leo" },
  { username: "maria", password: "maria_is_learning", name: "Maria" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("polariz_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      const userInfo = { username: foundUser.username, name: foundUser.name };
      setUser(userInfo);
      localStorage.setItem("polariz_user", JSON.stringify(userInfo));
      return { success: true, message: "Login successful" };
    }
    
    return { success: false, message: "Invalid credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("polariz_user");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
