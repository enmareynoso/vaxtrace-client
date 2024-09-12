"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface VaccinationRecord {
  id: number;
  vaccine_id: number;
  dose: string;
  date: string;
  esavi_status: string;
  vaccine: { commercial_name: string;
    diseases_covered: string;
  };
}

const VaccinationRecordPage: React.FC = () => {
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccinationRecords = async () => {
      try {
        // Obtener el token de las cookies
        const token = Cookies.get("access_token");
        if (!token) {
          console.error("No token found");
          setError("Authorization token is missing.");
          setLoading(false);
          return;
        }

        // Decodificar el token para obtener el user_id
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.user_id;

        if (!userId) {
          console.error("No user_id found in token");
          setError("No user ID found in token.");
          setLoading(false);
          return;
        }

        // Consultar los registros de vacunación del usuario logueado
        const { data: vaccinationRecords, error } = await supabase
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

        if (error) {
          console.error("Error fetching vaccination records:", error);
          setError("Error fetching vaccination records.");
        } else {
          setVaccinationRecords(vaccinationRecords || []);
          console.log("Vaccination records:", vaccinationRecords);
        }
      } catch (err) {
        console.error("Error during fetching process:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinationRecords();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        <h2 className="text-3xl font-bold mb-4">Vaccination Record</h2>

        {vaccinationRecords.length > 0 ? (
          <table className="table-auto w-full bg-white shadow-md rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2">Vaccine</th>
                <th className="px-4 py-2">Diseases Covered</th> 
                <th className="px-4 py-2">Dose</th>
                <th className="px-4 py-2">ESAVI Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {vaccinationRecords.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-2 text-center">{record.vaccine.commercial_name}</td>
                  <td className="px-4 py-2 text-center">{record.vaccine.diseases_covered}</td>
                  <td className="px-4 py-2 text-center">{record.dose}</td>
                  <td className="px-4 py-2 text-center">{record.esavi_status}</td>
                  <td className="px-4 py-2 text-center">{new Date(record.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-600">No vaccination records found.</div>
        )}
      </main>
    </div>
  );
};

export default VaccinationRecordPage;