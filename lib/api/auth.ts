import axios from "axios";
import cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface LoginCredentials {
  email: string;
  password: string;
}

interface PasswordResetRequest {
  email: string;
  token: string;
  newPassword: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    cookies.set("token", response.data.access_token);
    return response.data;
  } catch (error: any) {
    throw error.response.data || "An error occurred during login.";
  }
};

export const requestPasswordReset = async (email: string): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/request-password-reset`,
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw (
      error.response.data ||
      "An error occurred while requesting the password reset."
    );
  }
};

export const resetPassword = async (
  resetRequest: PasswordResetRequest
): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/reset-password`,
      resetRequest
    );
    return response.data;
  } catch (error: any) {
    throw error.response.data || "An error occurred during the password reset.";
  }
};
