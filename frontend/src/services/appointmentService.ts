import axios from "axios";

const API_URL = "http://localhost:5001/appointments";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface Appointment {
  id: number;
  user_id: number;
  doctor_id: number;
  slot_id?: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason?: string;
  notes?: string;
  admin_notes?: string;
  cancellation_reason?: string;
  doctor_name?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  specialization?: string;
  consultation_fee?: number;
  created_at: string;
}

export interface BookAppointmentData {
  slot_id: number;
  reason?: string;
}

export const bookAppointment = async (data: BookAppointmentData) => {
  const res = await axios.post(`${API_URL}/book`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getUserAppointments = async (status?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  
  const res = await axios.get(`${API_URL}/my-appointments?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getDoctorAppointments = async (status?: string, date?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (date) params.append("date", date);
  
  const res = await axios.get(`${API_URL}/doctor-appointments?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getAllAppointments = async (status?: string, date?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (date) params.append("date", date);
  
  const res = await axios.get(`${API_URL}/all?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const approveAppointment = async (id: number, adminNotes?: string) => {
  const res = await axios.put(
    `${API_URL}/${id}/approve`,
    { admin_notes: adminNotes },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const cancelAppointment = async (id: number, reason?: string) => {
  const res = await axios.put(
    `${API_URL}/${id}/cancel`,
    { cancellation_reason: reason },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const rescheduleAppointment = async (id: number, newSlotId: number) => {
  const res = await axios.put(
    `${API_URL}/${id}/reschedule`,
    { new_slot_id: newSlotId },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const getAppointmentHistory = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}/history`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
