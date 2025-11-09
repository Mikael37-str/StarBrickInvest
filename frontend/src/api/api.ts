import axios from "axios";
export const API_URL = "https://perfect-encouragement-production.up.railway.app/api";


export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};

export const register = async (name: string, email: string, password: string, role: string = "user") => {
  const res = await axios.post(`${API_URL}/register`, { name, email, password, role });
  return res.data;
};

export const getProfile = async (userId: number) => {
  const res = await axios.get(`${API_URL}/profile/${userId}`);
  return res.data;
};

export const updateProfile = async (userId: number, name: string, bio: string) => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/${userId}`,
      { name, bio }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al actualizar perfil"
    };
  }
};