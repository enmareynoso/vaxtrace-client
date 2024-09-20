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
}: Readonly<{
  setVaccineInfo: (vaccines: any[]) => void;
}>) {
  const [vaccineCount, setVaccineCount] = useState(1);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([]);

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

  const handleVaccineChange = (
    index: number,
    field: string,
    value: string | boolean | Date
  ) => {
    const updatedVaccines = [...vaccines];
    updatedVaccines[index] = { ...updatedVaccines[index], [field]: value };
    setVaccines(updatedVaccines);
    setVaccineInfo(updatedVaccines);
  };

  const handleSelectChange =
    (index: number, field: string) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      handleVaccineChange(index, field, event.target.value);
    };

  return (
    <div className="border p-6 rounded-md bg-white shadow-lg space-y-6">
      <h2 className="text-lg font-bold mb-4">Vaccine Information</h2>
      {[...Array(vaccineCount)].map((_, index) => (
        <div key={index} className="space-y-4 border p-4 rounded-md shadow-sm">
          <h3 className="font-semibold text-lg">
            Vaccine Applied #{index + 1}
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4">
              {/* Select para las vacunas */}
              <Select
                title="Vaccine"
                options={availableVaccines.map((vaccine) => ({
                  value: vaccine.vaccine_id.toString(),
                  label: vaccine.commercial_name,
                }))}
                className="w-full mt-4 md:w-1/3"
                onChange={handleSelectChange(index, "vaccine_id")}
              />

              {/* Select para Doses */}
              <Select
                title="Dose"
                options={["Dose 1", "Dose 2", "Dose 3"].map((dose) => ({
                  value: dose,
                  label: dose,
                }))}
                className="w-full md:w-1/3"
                onChange={handleSelectChange(index, "dose")}
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
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
