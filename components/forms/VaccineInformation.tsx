"use client";

import React, { useState, useEffect } from "react";
import Select from "../ui/Select";
import { supabase } from "@/lib/supabaseClient";

interface Vaccine {
  vaccine_id: number;
  commercial_name: string;
}

export default function VaccineInformation({
  setVaccineInfo,
  patientId, // Asegúrate de recibir el patientId o childId
  childId, // Opcional: si es un dependiente
}: Readonly<{
  setVaccineInfo: (vaccines: any[]) => void;
  patientId: number; // Asegúrate de recibir el ID del paciente
  childId?: number; // Opcional: si es un dependiente
}>) {
  const [vaccineCount, setVaccineCount] = useState(1);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([]);
  const [doses, setDoses] = useState<string[]>([]); // Para almacenar las dosis por vacuna

  // Obtener los IDs y nombres comerciales de las vacunas desde la base de datos
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const { data: vaccineData, error } = await supabase
          .from("vaxtraceapi_vaccine")
          .select("vaccine_id, commercial_name");

        if (error) {
          console.error("Error fetching vaccines:", error);
        } else if (vaccineData && vaccineData.length > 0) {
          console.log("Fetched vaccines:", vaccineData);
          setAvailableVaccines(vaccineData);
        } else {
          console.log("No vaccines found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchVaccines();
  }, []);

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
        return null;
      }

      if (lastRecord && lastRecord.length > 0) {
        // Asumimos que las dosis son secuenciales: "1", "2", "3", etc.
        const lastDose = parseInt(lastRecord[0].dose, 10);
        return (lastDose + 1).toString(); // La próxima dosis
      }

      return "1"; // Si no hay registros previos, empieza con la dosis 1
    } catch (err) {
      console.error("Error fetching dose:", err);
      return null;
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
    updatedVaccines[index] = { ...updatedVaccines[index], [field]: value };

    // Si cambia la vacuna, buscar la próxima dosis automáticamente
    if (field === "vaccine_id") {
      if (value === "select") {
        // Comprobar si se seleccionó la opción predeterminada

        updatedVaccines[index].dose = ""; // Vaciar la dosis

        setDoses((prev) => {
          const updatedDoses = [...prev];

          updatedDoses[index] = ""; // Vaciar la dosis en el estado

          return updatedDoses;
        });
      } else {
        const nextDose = await fetchNextDose(Number(value));

        updatedVaccines[index].dose = nextDose; // Asignar la próxima dosis

        setDoses((prev) => {
          const updatedDoses = [...prev];

          updatedDoses[index] = nextDose || "";

          return updatedDoses;
        });
      }
    }

    setVaccines(updatedVaccines);
    setVaccineInfo(updatedVaccines);
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
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 items-end">
              {/* Select para las vacunas */}
              <Select
                title="Vacuna"
                options={availableVaccines.map((vaccine) => ({
                  value: vaccine.vaccine_id.toString(),
                  label: vaccine.commercial_name,
                }))}
                className="w-full mt-3 md:w-1/3 "
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
