import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const register = async (email: string, password: string) => {
  const response = await axios.post(`${BASE_URL}/auth/register`, {
    email,
    password,
  });
  return response.data;
};
