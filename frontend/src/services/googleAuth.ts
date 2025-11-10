import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Necesario para que funcione correctamente en apps standalone
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook personalizado para Google Sign-In con Expo
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  return { request, response, promptAsync };
};

/**
 * Obtener información del usuario desde el token de Google
 */
export const getUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const userInfo = await response.json();
    return {
      success: true,
      user: {
        email: userInfo.email,
        name: userInfo.name,
        photo: userInfo.picture,
        id: userInfo.id,
      },
    };
  } catch (error: any) {
    console.error('Error getting user info:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};