"use client";

import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { registerVaccinationRecord } from "@/lib/api/auth";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";

export default function RegisterVaccination() {
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [vaccineInfo, setVaccineInfo] = useState<any[]>([]);
  const [centerId, setCenterId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("center_id"); // Obtener el ID del centro desde local storage
    setCenterId(id);
  }, []);

  const handleSaveRecord = async () => {
    if (!centerId) {
      toast.error("Center ID is required");
      return;
    }

    try {
      const cookies = parseCookies();
      const token = cookies.access_token; // Obtener el token de las cookies

      if (!token) {
        toast.error("Authorization token is missing.");
        return;
      }

      // Estructura de datos para el registro
      const vaccinationRecord = {
        patient: patientInfo,
        vaccinations: vaccineInfo,
        center_id: centerId, // Añadir el ID del centro para ser tomado en cuenta en el historial
      };

      // Pasar el token al registrar el registro de vacunación
      await registerVaccinationRecord(vaccinationRecord, token);

      toast.success("Record saved successfully.");
    } catch (error) {
      console.error("Error saving the record:", error);
      toast.error("Failed to save the record.");
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
