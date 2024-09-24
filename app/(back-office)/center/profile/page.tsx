"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";

interface VaccinationCenterInfo {
  id: number;
  RNC: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  municipality_id: number;
  municipality_name?: string;
}

const ProfilePage: React.FC = () => {
  const [centerInfo, setCenterInfo] = useState<VaccinationCenterInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VaccinationCenterInfo>({
    id: 0,
    RNC: "",
    name: "",
    address: "",
    phone_number: "",
    email: "",
    municipality_id: 0,
  });

  const token = Cookies.get("access_token");

  useEffect(() => {
    const fetchCenterInfo = async () => {
      if (!token) {
        setError("Falta el token de autorización.");
        setLoading(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const centerId = decodedToken.user_id; // Suponiendo que el token contiene el id del centro

      try {
        const { data: center, error: centerError } = await supabase
          .from("vaxtraceapi_vaccinationcenter")
          .select("RNC, name, address, phone_number, email, municipality_id")
          .eq("vaccination_center_id", centerId)
          .single();

        if (centerError) {
          setError(centerError.message); // Mostrar mensaje de error
        } else {
          const municipality_id = center.municipality_id;

          // Obtener el nombre del municipio
          const { data: municipality, error: municipalityError } =
            await supabase
              .from("vaxtraceapi_municipality")
              .select("name")
              .eq("municipality_id", municipality_id)
              .single();

          if (municipalityError) {
            setError(municipalityError.message); // Mostrar mensaje de error
          } else {
            setCenterInfo({
              ...center,
              id: centerId,
              RNC: center.RNC,
              municipality_name: municipality.name,
            });
            setFormData({
              ...center,
              id: centerId,
              RNC: center.RNC,
              municipality_name: municipality.name,
            });
          }
        }
      } catch (err) {
        setError("Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchCenterInfo();
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

    const { id, municipality_name, ...data } = formData; // Excluir municipality_name

    const updatedData = {
      ...data,
      vaccination_center_id: id,
    };

    const { error } = await supabase
      .from("vaxtraceapi_vaccinationcenter")
      .update(updatedData)
      .eq("vaccination_center_id", id);

    if (error) {
      setError("Error al actualizar la información del centro.");
      toast.error("Error al actualizar la información del centro.");
    } else {
      setCenterInfo(formData);
      toast.success("Perfil del centro actualizado exitosamente!");
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

      <h1 className="text-3xl font-bold mb-4">
        Perfil del Centro de Vacunación
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="RNC"
            className="block text-sm font-medium text-gray-700"
          >
            RNC
          </label>
          <input
            type="text"
            name="RNC"
            value={formData.RNC}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="municipality_id"
            className="block text-sm font-medium text-gray-700"
          >
            Municipio
          </label>
          <input
            type="text"
            name="municipality_id"
            value={centerInfo?.municipality_name || ""}
            readOnly
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
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
