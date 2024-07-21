import axios from "axios";
import cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    cookies.set("token", response.data.access_token);
    return response.data;
  } catch (error) {
    throw error.response.data || "An error occurred during login.";
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/request-password-reset`, { email });
    return response.data;
  } catch (error) {
    throw error.response.data || "An error occurred while requesting the password reset.";
  }
};

export const resetPassword = async ({ email, token, newPassword }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reset-password`, { email, token, newPassword });
    return response.data;
  } catch (error) {
    throw error.response.data || "An error occurred during the password reset.";
  }
};
