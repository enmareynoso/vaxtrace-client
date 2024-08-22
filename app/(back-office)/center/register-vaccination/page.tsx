"use client";

import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import React from "react";

export default function RegisterVaccination() {
  const handleSaveRecord = () => {
    toast.success("Record saved successfully.");
  };
  return (
    <div className="space-y-6">
      <PatientInformation />
      <VaccineInformation />
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
