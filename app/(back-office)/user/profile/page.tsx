"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";

interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  document: string;
  birthdate: string;
  gender: string;
  nationality: string;
  address: string;
  occupation: string;
}

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserInfo>({
    id: 0,
    first_name: "",
    last_name: "",
    document: "",
    birthdate: "",
    gender: "",
    nationality: "",
    address: "",
    occupation: "",
  });

  const token = Cookies.get("access_token");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) {
        setError("Falta el token de autorización.");
        setLoading(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.user_id;

      try {
        const { data: user, error: userError } = await supabase
          .from("vaxtraceapi_patientuser")
          .select(
            "first_name, last_name, document, birthdate, gender, nationality, address, occupation"
          )
          .eq("id", userId)
          .single();

        if (userError) {
          setError("Error al obtener la información del usuario.");
        } else {
          setUserInfo({ ...user, id: userId });
          setFormData({ ...user, id: userId });
        }
      } catch (err) {
        setError("Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    const { id, ...data } = formData;

    const { error } = await supabase
      .from("vaxtraceapi_patientuser")
      .update(data)
      .eq("id", id);

    if (error) {
      setError("Error al actualizar la información del usuario.");
      toast.error("Error al actualizar la información del usuario.");
    } else {
      setUserInfo(formData);
      toast.success("Perfil actualizado exitosamente!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />

      <h1 className="text-3xl font-bold mb-4">Perfil de Usuario</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Apellido
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="document"
            className="block text-sm font-medium text-gray-700"
          >
            Documento
          </label>
          <input
            type="text"
            name="document"
            value={formData.document}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="birthdate"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Género
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccionar Género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="nationality"
            className="block text-sm font-medium text-gray-700"
          >
            Nacionalidad
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="occupation"
            className="block text-sm font-medium text-gray-700"
          >
            Ocupación
          </label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-800 text-white font-semibold rounded-md hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
        >
          Actualizar Perfil
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
