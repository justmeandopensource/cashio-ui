
import axios from "axios";
import config from "../../config";

const API_URL = `${config.apiBaseUrl}`;

export interface UserProfile {
  full_name: string;
  email: string;
  username: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get(`${API_URL}/user/me`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateUserProfile = async (
  data: UserUpdate
): Promise<UserProfile> => {
  const response = await axios.put(`${API_URL}/user/me`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const changePassword = async (data: ChangePassword): Promise<void> => {
  await axios.put(`${API_URL}/user/change-password`, data, {
    headers: getAuthHeaders(),
  });
};
