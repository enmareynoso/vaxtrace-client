"use client";

import DependentInformation from "@/components/forms/DependentInformation";
import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import React from "react";

export default function RegisterVaccination() {
  return (
    <div className="space-y-6">
      <PatientInformation />
      <VaccineInformation />
    </div>
  );
}
