import axios from "axios";

const API_URL = "http://localhost:5001/auth";

export interface User {
  id: number;
  email: string;
  role: string;
  full_name?: string;
  phone?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: string;
  full_name?: string;
  phone?: string;
}

export const register = async (data: RegisterData) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  localStorage.setItem("token", res.data.token);
  if (res.data.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getProfile = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
