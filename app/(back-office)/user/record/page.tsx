"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";

interface VaccinationRecord {
  id: number;
  vaccine_id: number;
  dose: string;
  date: string;
  esavi_status: string;
  vaccine: { commercial_name: string; diseases_covered: string };
}

const VaccinationRecordPage: React.FC = () => {
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) {
          setError("Authorization token is missing.");
          setLoading(false);
          return;
        }

        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.user_id;

        if (!userId) {
          setError("No user ID found in token.");
          setLoading(false);
          return;
        }

        // Obtener información del usuario (nombre, document, gender, nacionalidad, fecha de nacimiento)
        const { data: user, error: userError } = await supabase
          .from("vaxtraceapi_patientuser")
          .select("first_name, last_name, document, birthdate, gender, nationality")
          .eq("id", userId)
          .single();

        if (userError) {
          setError("Error fetching user information.");
          return;
        }

        setUserInfo(user);

        // Obtener los registros de vacunación
        const { data: vaccinationRecords, error: vaccinationError } = await supabase
          .from("vaxtraceapi_vaccinationrecord")
          .select(`
            id,
            patient_id,
            vaccine_id,
            dose,
            date,
            esavi_status,
            vaccine: vaxtraceapi_vaccine (commercial_name, diseases_covered)
          `)
          .eq("patient_id", userId);

        if (vaccinationError) {
          setError("Error fetching vaccination records.");
        } else {
          setVaccinationRecords(vaccinationRecords || []);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const downloadPDF = () => {
    const element = certificateRef.current;
    if (element) {
      html2pdf().from(element).save("vaccination_certificate.pdf");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        {/* Certificado de vacunación */}
        <div ref={certificateRef} className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto">
          <div className="border-b-2 pb-4 mb-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">CERTIFICADO DE VACUNACIÓN</h3>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <strong>Nombre:</strong> {userInfo?.first_name} {userInfo?.last_name}
              </div>
              <div>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {new Date(userInfo?.birthdate).toLocaleDateString()}
              </div>
              <div>
                <strong>Nacionalidad:</strong> {userInfo?.nationality}
              </div>
              <div>
                <strong>Género:</strong> {userInfo?.gender}
              </div>
              <div>
                <strong>Documento de Identidad:</strong> {userInfo?.document}
              </div>
              <div>
                <strong>Vacunado:</strong> {vaccinationRecords.length} de {vaccinationRecords.length}
              </div>
            </div>
          </div>

          {/* Tabla de vacunación */}
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">Fecha de Vacunación</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Vacuna</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Dosis</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Lugar de Vacunación</th>
              </tr>
            </thead>
            <tbody>
              {vaccinationRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white hover:bg-gray-100"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{record.vaccine.commercial_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{record.dose}</td>
                  <td className="border border-gray-300 px-4 py-2">LIMA SUR - Complejo Del Ipd</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón para descargar el PDF */}
        <div className="mt-8 text-center">
          <button
            onClick={downloadPDF}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Descargar Certificado
          </button>
        </div>
      </main>
    </div>
  );
};

export default VaccinationRecordPage;



