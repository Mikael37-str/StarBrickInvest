import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, getProfile } from "../api/api";

type User = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  bio?: string;
  profilePhoto?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginUser: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginUser = async (email: string, password: string) => {
    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        await AsyncStorage.setItem("userId", String(res.user.id));
        await AsyncStorage.setItem("userToken", res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("loginUser error:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userToken");
      setUser(null);
    } catch (err) {
      console.error("logout error:", err);
    }
  };

  const refreshUser = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      if (id) {
        const res = await getProfile(Number(id));
        if (res.success && res.user) {
          setUser(res.user);
        }
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
  };

  const loadUser = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      if (id) {
        const res = await getProfile(Number(id));
        if (res.success && res.user) {
          setUser(res.user);
        }
      }
    } catch (err) {
      console.error("loadUser error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginUser, 
      logout,
      refreshUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};