import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CustomDatePicker from "../ui/DatePicker";
import { CalendarIcon } from "lucide-react";

export default function PatientInformation() {
  const [formData, setFormData] = useState({
    document: "",
    email: "",
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    gender: "M",
    dependentFirstName: "",
    dependentLastName: "",
    dependentGender: "M",
    parentDateOfBirth: new Date(),
    occupation: "",
    address: "",
  });

  const [documentInput, setDocumentInput] = useState(""); // Estado para el documento de verificación
  const [showForm, setShowForm] = useState(false);
  const [patientExists, setPatientExists] = useState(false);

  const calculateAge = (dob: Date): number => {
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleDateOfBirthChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: date,
      }));
      setShowForm(true);
    }
  };

  const isDependent = formData.dateOfBirth
    ? calculateAge(formData.dateOfBirth) < 18
    : false;

  const handleGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleDependentGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, dependentGender: value }));
  };

  const handleParentDateOfBirthChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        parentDateOfBirth: date,
      }));
    }
  };

  const handleVerifyPatient = () => {
    if (documentInput) {
      setPatientExists(true); //Lo puse como true
      setShowForm(true);
    } else {
      alert("Please enter a document number to verify.");
    }
  };

  return (
    <div className="border p-6 rounded-md shadow-md space-y-2 dark:bg-gray-800">
      <div className="flex items-center justify-center p-4 rounded-xl dark:bg-gray-800 max-w-md mx-auto gap-5">
        <input
          type="text"
          value={documentInput}
          onChange={(e) => setDocumentInput(e.target.value)}
          className="w-3/4 px-4 py-3 border rounded border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition duration-150"
          placeholder="Enter document"
        />
        <Button
          onClick={handleVerifyPatient}
          className="w-1/4 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          Verify
        </Button>
      </div>

      {patientExists && (
        <>
          {/* Title */}
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Patient Information
          </h2>
          {/* Patient Informatin Fields */}
          {showForm && (
            <>
              {isDependent && (
                <div className="pt-0 pb-8">
                  {/* First row */}
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="dependentFirstName"
                        className="block text-gray-700 dark:text-white"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="dependentFirstName"
                        name="dependentFirstName"
                        placeholder="Enter first name"
                        value={formData.dependentFirstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dependentFirstName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dependentLastName"
                        className="block text-gray-700 dark:text-white"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="dependentLastName"
                        name="dependentLastName"
                        placeholder="Enter last name"
                        value={formData.dependentLastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dependentLastName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {/* Second row */}
                  <div className="grid gap-4 md:grid-cols-2 mt-2">
                    <div className="grid gap-4">
                      <div className="relative flex items-center">
                        <label
                          htmlFor="parentDateOfBirth"
                          className="block text-gray-700 dark:text-white"
                        >
                          Date of Birth
                        </label>
                        <CustomDatePicker
                          selectedDate={formData.dateOfBirth}
                          onDateChange={handleDateOfBirthChange}
                          className="w-full py-2 rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>{" "}
                    {/* Ajuste para reducir el espacio vertical */}
                    <div className="flex items-center space-x-4 pt-4">
                      <h4 className="block text-gray-700 dark:text-white">
                        Gender
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleDependentGenderChange("M")}
                        className={`py-2 px-4 border rounded-md text-center ${
                          formData.dependentGender === "M"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        M
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDependentGenderChange("F")}
                        className={`py-2 px-4 border rounded-md text-center ${
                          formData.dependentGender === "F"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        F
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Parent / Tutor Information */}
              <div className="border-t pt-2">
                {/* Title */}
                <h2 className="text-lg font-bold mb-0 mt-3 text-gray-800 dark:text-white">
                  {isDependent ? "Parent / Tutor Information" : ""}
                </h2>
                {/* First row */}
                <div className="grid pt-4 gap-4 md:grid-cols-1 lg:grid-cols-3">
                  <div>
                    <label
                      htmlFor="document"
                      className="block text-gray-700 dark:text-white"
                    >
                      Document
                    </label>
                    <input
                      type="text"
                      id="document"
                      name="document"
                      placeholder="Enter document"
                      value={formData.document}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          document: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                {/* Second row */}
                <div className="flex items-center space-x-4 pt-4">
                  {isDependent && (
                    <div className="md:col-span-1">
                      <label
                        htmlFor="parentDateOfBirth"
                        className="block text-gray-700 dark:text-white"
                      >
                        Date of Birth
                      </label>
                      <div className="relative flex items-center">
                        <CustomDatePicker
                          selectedDate={formData.parentDateOfBirth}
                          onDateChange={handleParentDateOfBirthChange}
                          className="w-full py-2 rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  <h4 className="block text-gray-700 dark:text-white">
                    Gender
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleGenderChange("M")}
                    className={`py-2 px-4 border rounded-md text-center ${
                      formData.gender === "M"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange("F")}
                    className={`py-2 px-4 border rounded-md text-center ${
                      formData.gender === "F"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    F
                  </button>
                </div>
                {/* Third row */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mt-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-gray-700 dark:text-white"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-gray-700 dark:text-white"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                {/* Four row */}
                <div className="grid gap-4 md:grid-cols-2 mt-3">
                  <div>
                    <label
                      htmlFor="occupation"
                      className="block text-gray-700 dark:text-white"
                    >
                      Occupation
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      placeholder="Enter the occupation"
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          occupation: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-gray-700 dark:text-white"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Enter the address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
