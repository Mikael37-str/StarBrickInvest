import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, getProfile, googleSignIn } from "../api/api";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Necesario para cerrar el navegador correctamente después de la autenticación
WebBrowser.maybeCompleteAuthSession();

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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  googleRequest: any;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginUser: async () => false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
  googleRequest: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Configurar Google Sign-In con expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  // 🔄 Manejar la respuesta de Google OAuth
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleSignIn(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.error("❌ Error en Google OAuth:", response.error);
    } else if (response?.type === 'cancel') {
      console.log("ℹ️ Usuario canceló el inicio de sesión con Google");
    }
  }, [response]);

  /**
   * Manejar el token de acceso de Google y autenticar en el backend
   */
  const handleGoogleSignIn = async (accessToken: string) => {
    try {
      console.log("🔐 Obteniendo información del usuario de Google...");
      
      // Obtener información del usuario desde la API de Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const googleUser = await userInfoResponse.json();
      console.log("✅ Información de Google obtenida:", googleUser.email);

      // Enviar la información al backend para crear/autenticar usuario
      const res = await googleSignIn(
        accessToken,
        googleUser.email,
        googleUser.name,
        googleUser.picture
      );

      if (res.success && res.user) {
        console.log("✅ Usuario autenticado en backend:", res.user.name);
        await AsyncStorage.setItem("userId", String(res.user.id));
        await AsyncStorage.setItem("userToken", res.token);
        setUser(res.user);
      } else {
        console.error("❌ Error al autenticar en backend:", res.message);
      }
    } catch (error) {
      console.error("❌ Error en handleGoogleSignIn:", error);
    }
  };

  /**
   * Login tradicional con email y contraseña
   */
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

  /**
   * Iniciar el flujo de autenticación con Google
   */
  const loginWithGoogle = async () => {
    try {
      console.log("🔐 Iniciando Google Sign-In...");
      
      if (!request) {
        console.error("❌ Google request no está disponible");
        return;
      }
      
      // Abrir el navegador para autenticación OAuth
      await promptAsync();
    } catch (error) {
      console.error("❌ Error al iniciar Google Sign-In:", error);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userToken");
      setUser(null);
      console.log("✅ Sesión cerrada exitosamente");
    } catch (err) {
      console.error("❌ logout error:", err);
    }
  };

  /**
   * Refrescar datos del usuario
   */
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

  /**
   * Cargar usuario al iniciar la app
   */
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
      loginWithGoogle,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      googleRequest: request, // Útil para deshabilitar el botón mientras se carga
    }}>
      {children}
    </AuthContext.Provider>
  );
};