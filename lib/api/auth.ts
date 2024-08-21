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

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface PasswordResetResponse {
  message: string;
}

interface CreateUserResponse {
  id: string;
  email: string;
}

interface RegisterCenterCredentials {
  RNC: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  municipality_id: number;
  account: {
    email: string;
    password: string;
    role: string;
  };
}
export const registerCenter = async (credentials: RegisterCenterCredentials): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create_center`, credentials);
    cookies.set("access_token", response.data.access_token, { httpOnly: true });
    cookies.set("refresh_token", response.data.refresh_token, { httpOnly: true });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error || "An error occurred during center registration."
      );
    } else {
      throw new Error("An error occurred during center registration.");
    }
  }
};
export const loginUser = async (credentials: LoginCredentials): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    cookies.set("access_token", response.data.access_token, { httpOnly: true });
    cookies.set("refresh_token", response.data.refresh_token, { httpOnly: true });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error || "An error occurred during login."
      );
    } else {
      throw new Error("An error occurred during login.");
    }
  }
};



export const requestPasswordReset = async (
  email: string
): Promise<PasswordResetResponse> => {
  try {
    const response = await axios.post<PasswordResetResponse>(
      `${API_BASE_URL}/request_password_reset`,
      { email }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error || error.response.data.message || "An error occurred while requesting the password reset."
      );
    } else {
      throw new Error("An error occurred while requesting the password reset.");
    }
  }
};


export const resetPassword = async (
  data: PasswordResetRequest
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/set_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to reset password");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(
      error.message || "An error occurred while resetting the password."
    );
  }
};

export const createUser = async (
  userRequest: CreateUserRequest
): Promise<CreateUserResponse> => {
  try {
    const response = await axios.post<CreateUserResponse>(
      `${API_BASE_URL}/create_user`,
      userRequest
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message || "An error occurred during user creation."
      );
    } else {
      throw new Error("An error occurred during user creation.");
    }
  }
};

export const validateToken = async (token: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/refresh_token`, {
      token,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message ||
          "An error occurred while validating the token."
      );
    } else {
      throw new Error("An error occurred while validating the token.");
    }
  }
};
export const confirmAccount = async (token: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/confirm_account`, { token });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "An error occurred while confirming the account."
    );
  }
};

export const getPatientByDocument = async (document: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_patient_by_document/${document}/`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "An error occurred while fetching the patient information."
    );
  }
};