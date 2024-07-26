import axios from "axios";
import cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface LoginCredentials {
  email: string;
  password: string;
}

interface PasswordResetRequest {
  token: string;
  newPassword: string;
}

interface CreateUserRequest {
  email: string;
  document: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    cookies.set("access_token", response.data.access_token, { httpOnly: true });
    cookies.set("refresh_token", response.data.refresh_token, { httpOnly: true });
    return response.data;
  } catch (error: any) {
    throw error.response.data || "An error occurred during login.";
  }
};

export const requestPasswordReset = async (email: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/request_password_reset`, { email });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data; // Lanzar el error específico del backend
    } else {
      throw new Error("An error occurred while requesting the password reset.");
    }
  }
};

export async function resetPassword(data: { token: string, new_password: string }) {
  const response = await fetch('http://127.0.0.1:8000/api/set_password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to reset password');
  }

  return await response.json();
}

export const createUser = async (userRequest: CreateUserRequest): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create_user`, userRequest);
    return response.data;
  } catch (error: any) {
    throw error.response.data || "An error occurred during user creation.";
  }
};

