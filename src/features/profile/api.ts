
import api from "@/lib/api";

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

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateUserProfile = async (
  data: UserUpdate
): Promise<UserProfile> => {
  const response = await api.put("/user/me", data);
  return response.data;
};

export const changePassword = async (data: ChangePassword): Promise<void> => {
  await api.put("/user/change-password", data);
};
