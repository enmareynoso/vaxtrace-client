"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";

// Interfaz del usuario principal
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

// Interfaz del dependiente
interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  parent_id: number;
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

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(
    null
  );
  const [dependentFormData, setDependentFormData] = useState<Dependent>({
    id: 0,
    first_name: "",
    last_name: "",
    birthdate: "",
    gender: "",
    parent_id: 0,
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

          // Traer dependientes asociados
          const { data: dependents, error: dependentsError } = await supabase
            .from("vaxtraceapi_child")
            .select("id, first_name, last_name, birthdate, gender, parent_id")
            .eq("parent_id", userId);

          if (dependentsError) {
            setError("Error al obtener los dependientes.");
          } else {
            setDependents(dependents || []);
          }
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

  const handleDependentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dependentId = Number(e.target.value);
    const selected = dependents.find((dep) => dep.id === dependentId) || null;
    setSelectedDependent(selected);
    if (selected) {
      setDependentFormData(selected);
    }
  };

  const handleDependentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDependentFormData((prevData) => ({
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

  const handleDependentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDependent) return;

    const { id, ...data } = dependentFormData;

    const { error } = await supabase
      .from("vaxtraceapi_child")
      .update(data)
      .eq("id", id);

    if (error) {
      setError("Error al actualizar la información del dependiente.");
      toast.error("Error al actualizar la información del dependiente.");
    } else {
      toast.success("Dependiente actualizado exitosamente!");
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
    <div className="max-w-5xl mx-auto p-6 border rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />

      <h1 className="text-3xl font-bold mb-4 text-center">Perfil de Usuario</h1>

      {/* Contenedor principal para manejar layout */}
      <div
        className={`flex ${
          dependents.length > 0
            ? "flex-row justify-between"
            : "flex-col justify-center items-center"
        }`}
      >
        {/* Formulario del Usuario */}
        <form
          onSubmit={handleSubmit}
          className="border p-4 rounded-lg shadow w-full max-w-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
              required
              readOnly
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Apellido
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
              required
              readOnly
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="document"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Documento
            </label>
            <input
              type="text"
              name="document"
              value={formData.document}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
              required
              readOnly
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="birthdate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
              required
              readOnly
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Género
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-950"
              required
              disabled
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
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nacionalidad
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-400 dark:bg-gray-950"
              required
              readOnly
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-950"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="occupation"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Ocupación
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-950"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Actualizar Perfil
          </button>
        </form>

        {/* Formulario de Dependientes, solo se muestra si existen dependientes */}
        {dependents.length > 0 && (
          <form
            onSubmit={handleDependentSubmit}
            className="border p-4 rounded-lg shadow w-full max-w-lg ml-8"
          >
            <div className="mb-4">
              <label
                htmlFor="dependent"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Seleccionar Dependiente
              </label>
              <select
                name="dependent"
                onChange={handleDependentChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-950"
              >
                <option value="">Seleccionar Dependiente</option>
                {dependents.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.first_name} {dep.last_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedDependent && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nombre del Dependiente
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={dependentFormData.first_name}
                    onChange={handleDependentFormChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
                    required
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Apellido del Dependiente
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={dependentFormData.last_name}
                    onChange={handleDependentFormChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
                    required
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="birthdate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Fecha de Nacimiento del Dependiente
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={dependentFormData.birthdate}
                    onChange={handleDependentFormChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 dark:bg-gray-600"
                    required
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Género del Dependiente
                  </label>
                  <select
                    name="gender"
                    value={dependentFormData.gender}
                    onChange={handleDependentFormChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-950"
                    required
                    disabled
                  >
                    <option value="">Seleccionar Género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Actualizar Dependiente
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
