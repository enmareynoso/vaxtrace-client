import React, { useState } from "react";
import { RadioGroup } from "../ui/RadioGroup";
import DatePicker from "../ui/DatePicker";
import { Input } from "../ui/input";
import { CalendarIcon } from "@radix-ui/react-icons";
import Select from "../ui/Select";

const vaccines = [
  { id: "1", name: "Vaccine A", doses: ["Dose 1", "Dose 2"] },
  { id: "2", name: "Vaccine B", doses: ["Dose 1", "Dose 2", "Dose 3"] },
];

export default function VaccineInformation() {
  const [vaccineCount, setVaccineCount] = useState(1);
  const [newDoseRequired, setNewDoseRequired] = useState<"Yes" | "No">("No");
  const [batchLotNumber, setBatchLotNumber] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState<Date | null>(null);

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

  return (
    <div className="border p-6 rounded-md shadow-lg space-y-6">
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
                options={vaccines.map((v) => ({ value: v.id, label: v.name }))}
                className="w-full mt-4 md:w-1/3"
              />
              <Select
                title="Dose"
                options={vaccines[0].doses.map((dose) => ({
                  value: dose,
                  label: dose,
                }))}
                className="w-full md:w-1/3"
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
                <DatePicker
                  selectedDate={vaccinationDate ?? new Date()} // Default to today if null
                  onDateChange={(date) => setVaccinationDate(date)}
                  className="h-12"
                />
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
      <div className="flex flex-col space-y-4 mt-4 md:flex-row md:space-x-4">
        <button
          onClick={addVaccine}
          disabled={vaccineCount >= 5}
          className={`px-4 py-2 rounded ${
            vaccineCount < 5 ? "bg-cyan-800 hover:bg-cyan-900" : "bg-gray-500"
          } text-white`}
        >
          Add one more vaccine
        </button>
        {vaccineCount > 1 && (
          <button
            onClick={removeVaccine}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
