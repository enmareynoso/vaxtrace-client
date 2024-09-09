"use client";

import React, { useState } from "react";
import { RadioGroup } from "../ui/RadioGroup";
import DatePicker from "../ui/DatePicker";
import { Input } from "../ui/input";
import Select from "../ui/Select";

const availableVaccines = [
  { id: "1", name: "Vaccine A", doses: ["Dose 1", "Dose 2"] },
  { id: "2", name: "Vaccine B", doses: ["Dose 1", "Dose 2", "Dose 3"] },
  { id: "3", name: "Vaccine 1", doses: ["Dose 1", "Dose 2", "Dose 3"] },
];

export default function VaccineInformation({
  setVaccineInfo,
}: Readonly<{
  setVaccineInfo: (vaccines: any[]) => void;
}>) {
  const [vaccineCount, setVaccineCount] = useState(1);
  const [newDoseRequired, setNewDoseRequired] = useState<"Yes" | "No">("No");
  const [batchLotNumber, setBatchLotNumber] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState<Date | null>(null);
  const [vaccines, setVaccines] = useState<any[]>([]);

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
    setVaccineInfo(updatedVaccines); // Actualizar el estado de las vacunas
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
              <Select
                title="Vaccine"
                options={availableVaccines.map((v) => ({
                  value: v.id,
                  label: v.name,
                }))}
                className="w-full mt-4 md:w-1/3"
                onChange={handleSelectChange(index, "vaccine_id")}
              />
              <Select
                title="Dose"
                options={(
                  availableVaccines.find(
                    (v) => v.id === vaccines[index]?.vaccine_id
                  )?.doses || []
                ).map((dose) => ({
                  value: dose,
                  label: dose,
                }))}
                className="w-full md:w-1/3"
                onChange={handleSelectChange(index, "dose")}
              />
              <Input
                label="Batch Lot Number"
                placeholder="Enter batch lot number"
                value={batchLotNumber}
                onChange={(e) => setBatchLotNumber(e.target.value)}
                className="w-full md:w-1/3"
              />
            </div>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4">
              <div className="relative w-full md:w-1/2">
                <label
                  htmlFor="vaccinationDate"
                  className="block text-gray-700 dark:text-white"
                >
                  Date of Vaccination
                </label>
                <div className="relative flex items-center">
                  <DatePicker
                    selectedDate={vaccinationDate ?? new Date()} // Default to today if null
                    onDateChange={(date) => setVaccinationDate(date)}
                    className="w-1/2 py-2 rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <RadioGroup
                title="New Dose Required?"
                options={[
                  { title: "Yes", value: "Yes" },
                  { title: "No", value: "No" },
                ]}
                selectedValue={newDoseRequired}
                onChange={(value) => setNewDoseRequired(value as "Yes" | "No")}
                className="w-full md:w-1/2"
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
          Add one more vaccine
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
