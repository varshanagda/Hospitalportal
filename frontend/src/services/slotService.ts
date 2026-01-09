import axios from "axios";

const API_URL = "http://localhost:5001/slots";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Slot {
  id: number;
  doctor_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;
  version: number;
  doctor_name?: string;
  specialization?: string;
  consultation_fee?: number;
  qualification?: string;
}

export interface CreateSlotData {
  slot_date: string;
  start_time: string;
  end_time: string;
  max_bookings?: number;
}

export const createSlot = async (data: CreateSlotData) => {
  const res = await axios.post(API_URL, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getDoctorSlots = async (date?: string, status?: string) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (status) params.append("status", status);
  
  const res = await axios.get(`${API_URL}/my-slots?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getAvailableSlots = async (doctorId?: number, date?: string, specialization?: string) => {
  const params = new URLSearchParams();
  if (doctorId) params.append("doctor_id", doctorId.toString());
  if (date) params.append("date", date);
  if (specialization) params.append("specialization", specialization);
  
  const res = await axios.get(`${API_URL}/available?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updateSlot = async (id: number, data: { is_available?: boolean; max_bookings?: number }) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const deleteSlot = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
