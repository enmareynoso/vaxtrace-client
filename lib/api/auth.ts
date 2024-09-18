import axios from "axios";
import cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import passwordValidator from 'password-validator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface LoginCredentials {
  email: string;
  password: string;
}
// Crear el esquema de validación de la contraseña
const schema = new passwordValidator();
schema
  .is().min(8)                                     // Mínimo 8 caracteres
  .is().max(100)                                   // Máximo 100 caracteres
  .has().uppercase()                               // Al menos una letra mayúscula
  .has().lowercase()                               // Al menos una letra minúscula
  .has().digits(1)                                 // Al menos un dígito
  .has().symbols()                                 // Al menos un símbolo especial
  .has().not().spaces();                           // Sin espacios

// Definir los mensajes de error con claves específicas
const errorMessages = {
  min: "La contraseña debe tener al menos 8 caracteres.",
  max: "La contraseña no debe tener más de 100 caracteres.",
  uppercase: "La contraseña debe contener al menos una letra mayúscula.",
  lowercase: "La contraseña debe contener al menos una letra minúscula.",
  digits: "La contraseña debe contener al menos un número.",
  symbols: "La contraseña debe contener al menos un símbolo especial.",
  spaces: "La contraseña no debe contener espacios.",
};
// Validar la contraseña antes de enviar la solicitud al backend
const validatePassword = (password: string): Array<keyof typeof errorMessages> => {
  return schema.validate(password, { list: true }) as Array<keyof typeof errorMessages>;
};


interface PasswordResetRequest {
  token: string;
  new_password: string;
  user_type: string;
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
    role: string;
  };
}

interface RegisterCenterResponse {
  access_token: string;
  refresh_token: string;
}

interface VaccinationRecordRequest {
  patient: {
    document: string;
    first_name: string;
    last_name: string;
    birthdate: string;
    gender: string;
    email?: string;
    occupation?: string;
    address?: string;
  };
  vaccinations: {
    vaccine_id: string;
    dose: string;
    batch_lot_number: string;
  }[];
  center_id?: string; // ID del centro que realiza el registro
}

interface CustomJwtPayload {
  user_id: number;
  user_type: string;
  role: string;
  type: string;
  exp: number;
  iat: number;
}

export const registerCenter = async (
  credentials: RegisterCenterCredentials
): Promise<any> => {
  try {
    const response = await axios.post<RegisterCenterResponse>(
      `${API_BASE_URL}/create_center`,
      credentials
    );

    // Establecer cookies
    cookies.set("access_token", response.data.access_token, { httpOnly: true });
    cookies.set("refresh_token", response.data.refresh_token, {
      httpOnly: true,
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error ||
          "An error occurred during center registration."
      );
    } else {
      throw new Error("An error occurred during center registration.");
    }
  }
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);

    // Almacenamos los valores del token
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Decodificar el token para obtener el user_id
    const decodedToken: CustomJwtPayload = jwtDecode(accessToken);
    const userId = decodedToken.user_id;

    // Guardar el token en las cookies
    cookies.set("access_token", accessToken, {
      secure: true,
      sameSite: "Strict",
      httpOnly: true,
    });
    cookies.set("refresh_token", refreshToken, {
      secure: true,
      sameSite: "Strict",
      httpOnly: true,
    });

    // Guardar el user_id en localStorage
    localStorage.setItem("center_id", userId.toString());

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
        error.response.data.error ||
          error.response.data.message ||
          "An error occurred while requesting the password reset."
      );
    } else {
      throw new Error("An error occurred while requesting the password reset.");
    }
  }
};

// Función para resetear la contraseña
export const resetPassword = async (
  data: PasswordResetRequest
): Promise<any> => {
  // Validar la contraseña
  const validationErrors = validatePassword(data.new_password);
  if (validationErrors.length > 0) {
    // Generar mensajes descriptivos de error
    const errorMessagesList = validationErrors.map((error) => errorMessages[error]);
    throw new Error(`Errores en la contraseña: ${errorMessagesList.join(', ')}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/set_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: data.token,
        new_password: data.new_password,
      }),
    });

    // Si la respuesta no es OK (200), manejamos el error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to reset password");
    }

    // Si la respuesta es exitosa, devolver los datos
    return await response.json();
  } catch (error: any) {
    console.error("Error resetting password:", error);
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

// Nuevo servicio de validación de token en el frontend que utiliza el endpoint de validate_token
export const validate_Token = async (token: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/validate_token`, {
      token,
    });
    return response.data; // Devuelve email y user_type
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
    const response = await axios.post(`${API_BASE_URL}/confirm_account`, {
      token,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error ||
        "An error occurred while confirming the account."
    );
  }
};

export const getPatientByDocument = async (document: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_patient_by_document/${document}/`);
    // Check if the HTTP status code is 200 OK
    if (response.status === 200) {
      return response.data;
    } else {
      // Handle non-200 responses if necessary
      throw new Error("Received non-200 response from the server.");
    }
  } catch (error: any) {
    console.error("Error fetching data from API:", error);
    // More comprehensive error handling
    const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching the patient information.";
    throw new Error(errorMessage);
  }
};

export const registerVaccinationRecord = async (
  record: VaccinationRecordRequest,
  token: string
): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/register_vaccination`,
      record,
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Token en el encabezado
        },
        withCredentials: true  // Asegúrate de enviar las cookies
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al registrar la vacunación:", error);
    throw error;
  }
};

// Nueva función para manejar la aprobación o rechazo de la solicitud de centro
export const handleApplicationResponse = async (
  email: string,
  status: string
): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/approve_application`, {
      params: { email, status },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.error ||
          "An error occurred while handling the application response."
      );
    } else {
      throw new Error(
        "An error occurred while handling the application response."
      );
    }
  }
};

function jwt_decode(accessToken: any): any {
  throw new Error("Function not implemented.");
}
