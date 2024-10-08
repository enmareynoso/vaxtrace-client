"use client";

import React, { useState, useEffect } from "react";
import Select from "../ui/Select";
import { supabase } from "@/lib/supabaseClient";

// Definimos la interfaz para las vacunas
interface Vaccine {
  vaccine_id: number;
  commercial_name: string;
  max_doses: number;
}

export default function VaccineInformation({
  setVaccineInfo,
  patientId, // Asegúrate de recibir el patientId o childId
  childId, // Opcional: si es un dependiente
  birthDate, // Añadimos la fecha de nacimiento para calcular la edad
}: Readonly<{
  setVaccineInfo: (vaccines: Vaccine[]) => void;
  patientId: number; // Asegúrate de recibir el ID del paciente
  childId?: number; // Opcional: si es un dependiente
  birthDate: Date; // Fecha de nacimiento del paciente o dependiente
}>) {
  const [vaccineCount, setVaccineCount] = useState(1);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([]);
  const [doses, setDoses] = useState<string[]>([]); // Para almacenar las dosis por vacuna
  const [vaccineSelections, setVaccineSelections] = useState<string[]>([]);

    // Función para calcular la edad en meses a partir de la fecha de nacimiento
  const calculateAgeInMonths = (birthDate: Date) => {
    const today = new Date();
    const yearsDiff = today.getFullYear() - birthDate.getFullYear();
    const monthsDiff = today.getMonth() - birthDate.getMonth();
    const daysDiff = today.getDate() - birthDate.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;
    if (daysDiff < 0) {
      totalMonths--;
    }
    return totalMonths;
  };

  // Función para obtener las vacunas recomendadas según la edad
  const fetchRecommendedVaccines = async (ageInMonths: number, userId: number, isDependent: boolean) => {
    console.log(`Edad en meses: ${ageInMonths}`); // Mostrar la edad en meses en la consola

    const vaccineAgeRestrictions = {
      "0 Meses": {
        "BCG": 1,
        "Hepatitis B": 1,
      },
      "2 Meses": {
        "Rotavirus": 1,
        "IPV": 1,
        "Neumococo": 1,
        "Pentavalente": 1,
      },
      "4 Meses": {
        "Rotavirus": 2,
        "bOPV": 1,
        "Neumococo": 2,
        "Pentavalente": 2,
      },
      "6 Meses": {
        "IPV": 2,
        "Pentavalente": 3,
      },
      "12 Meses": {
        "SRP": 1,
        "Neumococo": 3,
      },
      "18 Meses": {
        "SRP": 2,
        "bOPV": 3,
        "DPT": 1,
      },
      "48 Meses": {
        "bOPV": 4,
        "DPT": 2,
      },
      "108-167 Meses": {
        "DPT": 3,
        "VPH": 2,
      },
      "168+ Meses": "all", // Indicador para incluir todas las vacunas disponibles
    };
    
      const { data: allVaccines, error } = await supabase
        .from("vaxtraceapi_vaccine")
        .select("vaccine_id, commercial_name, max_doses");
    
      if (error) {
        console.error("Error fetching vaccines:", error);
        return;
      }
    
      const { data: appliedVaccinesData } = await supabase
        .from("vaxtraceapi_vaccinationrecord")
        .select("vaccine_id, dose")
        .eq(isDependent ? "child_id" : "patient_id", userId);
    
        const dosesAppliedMap = (appliedVaccinesData || []).reduce((acc: any, record: any) => {
          acc[record.vaccine_id] = (acc[record.vaccine_id] || 0) + 1;
          return acc;
        }, {});
        
    
      let recommendedVaccinesList: { [key: string]: number } = {};
    
      // Acumular todas las vacunas relevantes según la edad del paciente
      if (ageInMonths >= 0) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["0 Meses"]);
      }
      if (ageInMonths >= 2) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["2 Meses"]);
      }
      if (ageInMonths >= 4) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["4 Meses"]);
      }
      if (ageInMonths >= 6) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["6 Meses"]);
      }
      if (ageInMonths >= 12) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["12 Meses"]);
      }
      if (ageInMonths >= 18) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["18 Meses"]);
      }
      if (ageInMonths >= 48) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["48 Meses"]);
      }
      if (ageInMonths >= 108) {
        Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["108-167 Meses"]);
      }
      if (ageInMonths >= 168) {
        allVaccines.forEach(vaccine => {
          recommendedVaccinesList[vaccine.commercial_name] = vaccine.max_doses;
        });
      }
    
      // Filtrar las vacunas disponibles según las recomendaciones y dosis aplicadas
      const recommendedVaccines = allVaccines.filter(vaccine => {
        const appliedDoses = dosesAppliedMap[vaccine.vaccine_id] || 0;
        return recommendedVaccinesList.hasOwnProperty(vaccine.commercial_name) &&
              appliedDoses < vaccine.max_doses; // Excluir si ya alcanzó la dosis máxima
      });
    
      setAvailableVaccines(recommendedVaccines); // Actualizamos el estado con las vacunas recomendadas
    };
    
   // Obtener vacunas recomendadas cuando cambie el paciente o el dependiente
   useEffect(() => {
    const ageInMonths = calculateAgeInMonths(new Date(birthDate));
    fetchRecommendedVaccines(ageInMonths, childId || patientId, !!childId);
  }, [childId, patientId, birthDate]);

  // Reiniciar el campo de dosis cuando cambie el dependiente
  useEffect(() => {
    setVaccines([]); // Reiniciar vacunas seleccionadas
    setVaccineSelections([]);
    setDoses([]); // Reiniciar las dosis
    setVaccineCount(1); // Reiniciar el número de vacunas a 1
    // Reiniciar la información del componente padre también
  setVaccineInfo([]); // Actualizar el componente padre para que no tenga vacunas seleccionadas
  }, [childId, patientId]);

// Buscar la próxima dosis basada en el último registro
const fetchNextDose = async (vaccineId: number) => {
  try {
    const { data: lastRecord, error } = await supabase
      .from("vaxtraceapi_vaccinationrecord")
      .select("dose")
      .eq(childId ? "child_id" : "patient_id", childId || patientId) // Usar el campo adecuado (paciente o dependiente)
      .eq("vaccine_id", vaccineId)
      .order("date", { ascending: false }) // Obtener el último registro
      .limit(1);

    if (error) {
      console.error("Error fetching last dose:", error);
      return "1"; // Retorna "1" si hay un error al obtener el registro
    }

    if (lastRecord && lastRecord.length > 0) {
      // Si hay un registro previo, incrementar la dosis en 1
      const lastDose = parseInt(lastRecord[0].dose, 10);
      return (lastDose + 1).toString(); // La próxima dosis
    }

    // Si no hay registros previos, empieza con la dosis "1"
    return "1";
  } catch (err) {
    console.error("Error fetching dose:", err);
    return "1"; // Retorna "1" si ocurre algún error inesperado
  }
};


  const addVaccine = () => {
    if (vaccineCount < 5) {
      setVaccineCount((prev) => prev + 1);
    }
  };

  const removeVaccine = () => {
    if (vaccineCount > 1) {
      setVaccineCount((prev) => prev - 1);
    }
  };

  const handleVaccineChange = async (
    index: number,
    field: string,
    value: string | boolean | Date
  ) => {
    const updatedVaccines = [...vaccines];
    const updatedSelections = [...vaccineSelections]; // Utilizamos una copia del estado de selecciones
  
    // Actualizar el campo correspondiente en la lista de vacunas
    updatedVaccines[index] = { ...updatedVaccines[index], [field]: value };
  
    // Si el campo actualizado es 'vaccine_id', buscar la próxima dosis automáticamente
    if (field === "vaccine_id") {
      if (value === "select") {
        // Si se selecciona la opción predeterminada, limpiar la dosis
        updatedVaccines[index].dose = ""; // Vaciar la dosis
  
        setDoses((prev) => {
          const updatedDoses = [...prev];
          updatedDoses[index] = ""; // Vaciar la dosis en el estado
          return updatedDoses;
        });
  
        updatedSelections[index] = "select"; // Resetear el select a la opción predeterminada
      } else {
        // Si se selecciona una vacuna, obtener la próxima dosis automáticamente
        const nextDose = await fetchNextDose(Number(value));
        updatedVaccines[index].dose = nextDose; // Asignar la próxima dosis automáticamente
  
        setDoses((prev) => {
          const updatedDoses = [...prev];
          updatedDoses[index] = nextDose || ""; // Actualizar la dosis en el estado
          return updatedDoses;
        });
  
        updatedSelections[index] = value as string; // Guardar la selección actual de la vacuna
      }
    }
  
    setVaccineSelections(updatedSelections); // Actualizar el estado de las selecciones de vacunas
    setVaccines(updatedVaccines); // Actualizar el estado de las vacunas
    setVaccineInfo(updatedVaccines); // Actualizar la información de las vacunas en el componente padre
  };
  

  const handleSelectChange =
    (index: number, field: string) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      handleVaccineChange(index, field, event.target.value);
    };

  return (
    <div className="border p-6 rounded-md bg-white shadow-lg space-y-6 dark:bg-gray-700">
      <h2 className="text-lg font-bold mb-4">Información de vacuna</h2>
      {[...Array(vaccineCount)].map((_, index) => (
        <div
          key={index}
          className="space-y-4 border p-4 rounded-md shadow-sm dark:border-gray-400"
        >
          <h3 className="font-semibold text-lg">
            Vacuna aplicada #{index + 1}
          </h3>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 items-end">
            <Select
              title="Vacuna"
              value={vaccineSelections[index] || "select"}
              options={availableVaccines.map((vaccine) => ({
                value: vaccine.vaccine_id.toString(),
                label: vaccine.commercial_name,
              }))}
              className="w-full mt-3 md:w-1/3"
              onChange={handleSelectChange(index, "vaccine_id")}
            />
             {/* Input deshabilitado para la dosis */}
             <div className="w-full md:w-1/3">
                <label
                  htmlFor="doses"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dosis
                </label>
                <input
                  id="doses"
                  type="text"
                  value={doses[index] || ""}
                  disabled
                  className="w-full h-10 mt-1 p-2 border rounded bg-gray-100 dark:bg-gray-600"
                  placeholder="Dosis"
                />
              </div>
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row md:space-x-4">
        <button
          onClick={addVaccine}
          disabled={vaccineCount >= 5}
          className={`px-4 py-2 h-10 rounded ${
            vaccineCount < 5 ? "bg-cyan-800 hover:bg-cyan-900" : "bg-gray-500"
          } text-white`}
        >
          Agrega otra vacuna
        </button>
        {vaccineCount > 1 && (
          <button
            onClick={removeVaccine}
            className="px-4 py-2 h-10 rounded bg-red-500 hover:bg-red-600 text-white"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
