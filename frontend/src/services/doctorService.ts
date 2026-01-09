import axios from "axios";

const API_URL = "http://localhost:5001/doctors";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Doctor {
  id: number;
  user_id: number;
  specialization: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  bio?: string;
  is_approved: boolean;
  is_available?: boolean;
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface DoctorProfileData {
  specialization: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  bio?: string;
}

export const createDoctorProfile = async (data: DoctorProfileData) => {
  const res = await axios.post(`${API_URL}/profile`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getDoctorProfile = async () => {
  const res = await axios.get(`${API_URL}/profile/me`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getAllDoctors = async (specialization?: string, approvedOnly = true) => {
  const params = new URLSearchParams();
  if (specialization) params.append("specialization", specialization);
  if (approvedOnly) params.append("approved_only", "true");
  
  const res = await axios.get(`${API_URL}?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getDoctorById = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getDoctorStats = async () => {
  const res = await axios.get(`${API_URL}/stats/me`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const approveDoctor = async (id: number, isApproved: boolean) => {
  const res = await axios.put(
    `${API_URL}/${id}/approve`,
    { is_approved: isApproved },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export interface CreateDoctorData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  specialization: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
}

export const createDoctor = async (data: CreateDoctorData) => {
  const res = await axios.post("http://localhost:5001/auth/register", {
    ...data,
    role: "doctor"
  }, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
