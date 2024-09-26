"use client";

import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import { Button } from "@/components/ui/button";
import toast, { Renderable, Toast, ValueFunction } from "react-hot-toast";
import { registerVaccinationRecord } from "@/lib/api/auth";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function RegisterVaccination() {
  const [patientInfo, setPatientInfo] = useState<any>(null); // Información del paciente
  const [vaccineInfo, setVaccineInfo] = useState<any[]>([]); // Información de la vacuna
  const [selectedDependent, setSelectedDependent] = useState<any>(null); // Dependiente seleccionado (hijo)
  const [centerId, setCenterId] = useState<string | null>(null); // ID del centro

  // Obtener el ID del centro desde localStorage al cargar el componente
  useEffect(() => {
    const id = localStorage.getItem("center_id");
    setCenterId(id);
  }, []);

  const handleSaveRecord = async () => {
    const token = Cookies.get("access_token"); // Obtener el token de las cookies
    console.log("Token:", token); // Verificar si el token está presente

    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }

    try {
      // Formatear la fecha de nacimiento
      const formattedBirthdate = patientInfo.birthdate
        ? new Date(patientInfo.birthdate).toISOString().split("T")[0]
        : null; // Convertir birthdate a 'YYYY-MM-DD'

      // Determinar si se debe registrar la vacuna para el padre o el dependiente
      const targetPatient = selectedDependent || patientInfo;

      // Verificar si es para un usuario dependiente
      const isChild = Boolean(selectedDependent);

      // Construir los datos del registro de vacunación
      const vaccinationRecord = {
        patient: {
          document: patientInfo.document, // Siempre pasar el documento del padre
          first_name: patientInfo.first_name,
          last_name: patientInfo.last_name,
          birthdate: formattedBirthdate ?? "", // Usar la fecha formateada
          gender: patientInfo.gender,
          email: patientInfo.email,
          occupation: patientInfo.occupation,
          address: patientInfo.address,
        },
        dependent: isChild
          ? {
              first_name: selectedDependent.first_name,
              last_name: selectedDependent.last_name,
              birthdate: selectedDependent.birthdate,
              gender: selectedDependent.gender,
            }
          : null, // Solo incluir si es un dependiente
        is_child: isChild, // Flag to indicate if it's for a child
        vaccinations: vaccineInfo.map((v) => ({
          vaccine_id: v.vaccine_id,
          dose: v.dose,
          batch_lot_number: v.batch_lot_number,
        })),
      };

      console.log("Sending vaccination record:", vaccinationRecord); // Debugging

      // Llamada al backend para registrar el registro de vacunación
      await registerVaccinationRecord(vaccinationRecord, token);

      // Mostrar mensajes de éxito personalizados
      if (selectedDependent) {
        toast.success(
          `Registro de vacunación creado para el usuario menor de edad ${selectedDependent.first_name}.`
        );
      } else {
        toast.success(
          `Registro de vacunación creado para el usuario ${patientInfo.first_name}.`
        );
      }
    } catch (error: any) {
      // Manejo de errores con diferentes tipos de error
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Display all error messages from the array
          error.response.data.errors.forEach((err: Renderable | ValueFunction<Renderable, Toast>) => {
            toast.error(err);
          });
        } else if (error.response.data.detail) {
          // Display detail error if present
          toast.error(error.response.data.detail);
        } else {
          // Fallback error message
          toast.error("Failed to save the record.");
        }
      } else if (error instanceof Error) {
        toast.error(`Failed to save the record: ${error.message}`);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Componente para la información del paciente */}
      <PatientInformation
        setPatientInfo={setPatientInfo}
        setSelectedDependent={setSelectedDependent} // Pasar la función para capturar el dependiente seleccionado
      />
      {/* Componente para la información de la vacuna */}
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
