"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";

// Interfaz para los registros de vacunación
interface VaccinationRecord {
  id: number;
  vaccine_id: number;
  dose: string;
  date: string;
  esavi_status: string;
  vaccine: {
    commercial_name: string;
    diseases_covered: string;
    max_doses: number;
  };
}

// Interfaz para dependientes
interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
}

// Interfaz para la información del usuario
interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  document: string;
  birthdate: string;
  gender: string;
  nationality: string;
}

const VaccinationRecordPage: React.FC = () => {
  const [vaccinationRecords, setVaccinationRecords] = useState<
    VaccinationRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependent, setSelectedDependent] = useState<number | null>(
    null
  );
  const [currentPatient, setCurrentPatient] = useState<UserInfo | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Función para obtener los registros de vacunación
  const fetchVaccinationRecords = async (
    patientId: number,
    isDependent: boolean
  ) => {
    try {
      setLoading(true);
      const { data: vaccinationRecords, error: vaccinationError } =
        await supabase
          .from("vaxtraceapi_vaccinationrecord")
          .select(
            `
          id,
          patient_id,
          vaccine_id,
          dose,
          date,
          esavi_status,
          vaccine: vaxtraceapi_vaccine (commercial_name, diseases_covered , max_doses)
        `
          )
          .eq(isDependent ? "child_id" : "patient_id", patientId);

      if (vaccinationError) {
        setError("Error fetching vaccination records.");
      } else {
        setVaccinationRecords(
          (vaccinationRecords as unknown as VaccinationRecord[]) || []
        );
      }
    } catch (err) {
      setError("Error fetching vaccination records.");
    } finally {
      setLoading(false);
    }
  };

  const token = Cookies.get("access_token");
  if (!token) {
    setError("Authorization token is missing.");
    setLoading(false);
    return;
  }
  const decodedToken: any = jwtDecode(token);
  const userId = decodedToken.user_id;

  // Función para obtener la información del usuario y dependientes
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!userId) {
          setError("No user ID found in token.");
          setLoading(false);
          return;
        }

        // Obtener información del usuario
        const { data: user, error: userError } = await supabase
          .from("vaxtraceapi_patientuser")
          .select(
            "first_name, last_name, document, birthdate, gender, nationality"
          )
          .eq("id", userId)
          .single();

        if (userError) {
          setError("Error fetching user information.");
          return;
        }

        // Almacena la información del usuario en userInfo
        setUserInfo({ ...user, id: userId });
        // También almacena la información del usuario como el paciente actual
        setCurrentPatient({ ...user, id: userId });

        // Obtener dependientes del usuario
        const { data: dependentsData, error: dependentsError } = await supabase
          .from("vaxtraceapi_child")
          .select("id, first_name, last_name, birthdate, gender")
          .eq("parent_id", userId);

        if (dependentsError) {
          setError("Error fetching dependents.");
        } else {
          setDependents((dependentsData as Dependent[]) || []);
        }

        // Establecer el usuario principal como dependiente seleccionado por defecto
        setSelectedDependent(userId);

        // Obtener los registros de vacunación del adulto
        fetchVaccinationRecords(userId, false);
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Manejar el cambio de dependiente
  const handleDependentChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = Number(event.target.value);
    setSelectedDependent(selectedId);

    if (selectedId !== userId) {
      const { data: dependent, error: dependentError } = await supabase
        .from("vaxtraceapi_child")
        .select("first_name, last_name, birthdate, gender")
        .eq("id", selectedId)
        .single();

      if (dependentError) {
        setError("Error fetching dependent information.");
      } else {
        setCurrentPatient({
          ...dependent,
          id: selectedId,
          document: userInfo?.document || "",
          nationality: userInfo?.nationality || "",
        });

        fetchVaccinationRecords(selectedId, true);
      }
    } else {
      setCurrentPatient(userInfo);
      fetchVaccinationRecords(userId, false);
    }
  };

  const downloadPDF = () => {
    const element = certificateRef.current;
    if (element) {
      html2pdf().from(element).save("vaccination_certificate.pdf");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        {/* Dropdown de dependientes */}
        <div className="mb-6 ml-24">
          <label
            htmlFor="dependent-select"
            className="block mb-2 text-lg font-medium text-gray-700"
          >
            Seleccionar paciente:
          </label>
          <select
            id="dependent-select"
            value={selectedDependent || userId || ""}
            onChange={handleDependentChange}
            className="block w-2/5 p-2 border border-gray-300 rounded-lg shadow-sm"
          >
            <option key={userId} value={userId}>
              {userInfo?.first_name} {userInfo?.last_name}
            </option>
            {dependents.map((dependent) => (
              <option key={dependent.id} value={dependent.id}>
                {dependent.first_name} {dependent.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Certificado de vacunación */}
        <div
          ref={certificateRef}
          className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto"
        >
          <div className="border-b-2 pb-4 mb-6">
            <h3 className="text-2xl font-semibold mb-5 text-center">
              Record de Vacunación
            </h3>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <strong>Nombre:</strong> {currentPatient?.first_name}{" "}
                {currentPatient?.last_name}
              </div>
              <div>
                <strong>Fecha de Nacimiento:</strong>
                {currentPatient?.birthdate
                  ? new Date(currentPatient.birthdate).toLocaleDateString()
                  : "N/A"}
              </div>
              <div>
                <strong>Nacionalidad:</strong> {currentPatient?.nationality}
              </div>
              <div>
                <strong>Género:</strong> {currentPatient?.gender}
              </div>
              <div>
                <strong>Documento de Identidad:</strong>{" "}
                {currentPatient?.document}
              </div>
            </div>
          </div>

          {/* Tabla de vacunación */}
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Vacuna
                </th>
                <th className="border border-gray-300 px-5 py-2 text-left">
                  Dosis
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Enfermedades cubiertas
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Fecha
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Lugar de Vacunación
                </th>
              </tr>
            </thead>
            <tbody>
              {vaccinationRecords.map((record) => (
                <tr key={record.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {record.vaccine.commercial_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {/* Displaying current dose out of max doses */}
                    {record.dose} de {record.vaccine.max_doses}{" "}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {record.vaccine.diseases_covered}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    LIMA SUR - Complejo Del Ipd
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-6">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-cyan-800 text-white font-semibold rounded-md hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
            >
              Descargar Certificado
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VaccinationRecordPage;
