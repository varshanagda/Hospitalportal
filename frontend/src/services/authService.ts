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
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data;
  } catch (error: any) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    
    const res = await axios.post(`${API_URL}/login`, { email, password });
    
    if (!res.data?.token) {
      throw new Error("Invalid response from server");
    }
    
    localStorage.setItem("token", res.data.token);
    if (res.data.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || "Login failed";
      throw new Error(message);
    }
    throw error instanceof Error ? error : new Error("Login failed");
  }
};

export const getProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const res = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.data) {
      throw new Error("Invalid response from server");
    }
    
    return res;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || "Failed to get profile";
      throw new Error(message);
    }
    throw error instanceof Error ? error : new Error("Failed to get profile");
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }
    
    const parsed = JSON.parse(userStr);
    if (!parsed || typeof parsed !== "object" || !parsed.id || !parsed.email || !parsed.role) {
      // Invalid user data, clear it
      localStorage.removeItem("user");
      return null;
    }
    
    return parsed as User;
  } catch (error: unknown) {
    // Invalid JSON or other error, clear corrupted data
    localStorage.removeItem("user");
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
