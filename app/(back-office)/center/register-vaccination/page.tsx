"use client";

import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { registerVaccinationRecord } from "@/lib/api/auth";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import Cookies from "js-cookie";

export default function RegisterVaccination() {
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [vaccineInfo, setVaccineInfo] = useState<any[]>([]);
  const [centerId, setCenterId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("center_id"); // Obtener el ID del centro desde local storage
    setCenterId(id);
  }, []);

  const handleSaveRecord = async () => {
    const token = Cookies.get('access_token');  // Obtener el token de las cookies
    console.log("Token:", token);  // Verifica si el token está presente
  
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
  
    try {
      const formattedBirthdate = patientInfo.birthdate 
        ? new Date(patientInfo.birthdate).toISOString().split('T')[0]
        : null;  // Convertir birthdate a 'YYYY-MM-DD'
  
      const vaccinationRecord = {
        patient: {
          document: patientInfo.document,  // Asegúrate de que estos campos existan en patientInfo
          first_name: patientInfo.first_name,
          last_name: patientInfo.last_name,
          birthdate: formattedBirthdate??"", // Usar la fecha formateada
          gender: patientInfo.gender,
          email: patientInfo.email,
          occupation: patientInfo.occupation,
          address: patientInfo.address
        },
        vaccinations: vaccineInfo.map(v => ({
          vaccine_id: v.vaccine_id,
          dose: v.dose,
          batch_lot_number: v.batch_lot_number
        }))
      };
  
      console.log("Sending vaccination record:", vaccinationRecord);  // Depuración
  
      await registerVaccinationRecord(vaccinationRecord, token);
      toast.success("Record saved successfully.");
    } catch (error: unknown) {
      // Usar "type assertion" para manejar diferentes tipos de error
      if (typeof error === "object" && error !== null && "response" in error) {
        const typedError = error as { response: { data: any } };
        console.error("Error response:", typedError.response.data);
        toast.error(typedError.response.data.detail || "Failed to save the record.");
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        toast.error("Failed to save the record: " + error.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <PatientInformation setPatientInfo={setPatientInfo} />
      <VaccineInformation setVaccineInfo={setVaccineInfo} />
      {/* Botón para guardar el registro */}
      <div className="pt-6">
        <Button
          onClick={handleSaveRecord}
          className="w-full py-3 bg-cyan-800 text-white font-semibold rounded-md hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
        >
          Guardar Registro
        </Button>
      </div>
    </div>
  );
}
