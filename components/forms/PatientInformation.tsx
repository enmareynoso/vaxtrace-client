import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { getPatientByDocument } from "@/lib/api/auth"; // Importa la función de búsqueda
import CustomDatePicker from "../ui/DatePicker";
import toast, { Toaster } from "react-hot-toast";

export default function PatientInformation() {
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
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

  // Función para limpiar el formulario
  const clearForm = () => {
    setFormData(initialFormData);
  };

  const handleVerifyPatient = async () => {
    //Verififcacion si el campo esta vacio 
    if (!documentInput) {
      toast.error("Porfavor digite su documento para verificarlo: ");
      return;
    }
    // Verificación de la longitud del documento
    if (documentInput.length !== 11) {
      toast.error("The document number must be exactly 11 digits long.");
      return;
    }

    if (documentInput) {
      clearForm(); // Limpiar el formulario antes de buscar
      try {
        const patientData = await getPatientByDocument(documentInput);
        if (patientData) {
          // Rellena el formulario con los datos del paciente
          setFormData({
            document: patientData.document || "",
            email: patientData.email || "",
            firstName: patientData.first_name || "",
            lastName: patientData.last_name || "",
            dateOfBirth: new Date(patientData.birthdate) || new Date(),
            gender: patientData.gender === "male" ? "M" : "F",
            dependentFirstName: "",
            dependentLastName: "",
            dependentGender: "M",
            parentDateOfBirth: new Date(),
            occupation: patientData.occupation || "",
            address: patientData.address || "",
          });
          setPatientExists(true);
          setShowForm(true);
          toast.success("Patient found.");
        }
      } catch (error) {
        // Mostrar toast cuando no se encuentra el paciente
        toast.error("New patient. Please fill out the form manually.");
        setPatientExists(false); // No se encontró el paciente
        setShowForm(true); // Muestra el formulario para llenarlo manualmente
      }
    } else {
      toast.error("Please enter a document number to verify.");
    }
  };

  return (
    <div className="border p-6 rounded-md shadow-md space-y-2 bg-white dark:bg-gray-800">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 max-w-2xl mx-auto space-y-4 md:space-y-0 md:space-x-4">
        <label className="text-lg font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap mb-2 md:mb-0">
          Digite la cédula:
        </label>
        <div className="flex flex-col space-x-4 md:flex-row items-center w-full space-y-4 md:space-y-0">
          <input
            type="text"
            value={documentInput}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 11) {
                setDocumentInput(value); // Limitar a 11 dígitos
              }
            }}
            className="flex-grow w-full md:w-auto px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition duration-150"
            placeholder="Document"
            maxLength={11} // Asegura que solo se puedan ingresar 11 dígitos
          />
          <Button
            onClick={handleVerifyPatient}
            className="px-6 py-2 w-full md:w-auto bg-cyan-800 text-white font-semibold rounded-lg hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
          >
            Verificar
          </Button>
        </div>
      </div>

      {showForm && (
        <>
          <h2 className="text-lg pt-4 font-bold text-gray-800 dark:text-white">
            Información del Paciente
          </h2>

          <div className="grid gap-4">
            <div className="relative flex items-center">
              <CustomDatePicker
                selectedDate={formData.dateOfBirth}
                onDateChange={handleDateOfBirthChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <CalendarIcon className="absolute right-3 h-5 w-5 text-gray-400 dark:text-white" />
            </div>
          </div>

          {isDependent && (
            <div className="pt-0 pb-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="dependentFirstName"
                    className="block text-gray-700 dark:text-white"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="dependentFirstName"
                    name="dependentFirstName"
                    placeholder="Name"
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
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="dependentLastName"
                    name="dependentLastName"
                    placeholder="Last name"
                    value={formData.dependentLastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dependentLastName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={patientExists} // Deshabilitar si el paciente fue encontrado
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-2">
                <div className="flex items-center space-x-4 pt-4">
                  <h4 className="block text-gray-700 dark:text-white">
                    Género
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDependentGenderChange("M")}
                    className={`py-2 px-4 border rounded-md text-center ${
                      formData.dependentGender === "M"
                        ? "bg-cyan-800 text-white"
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
                        ? "bg-cyan-800 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    F
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-2">
            <h2 className="text-lg font-bold mb-0 text-gray-800 dark:text-white">
              {isDependent ? "Información del Padre / Tutor" : ""}
            </h2>

            <div className="grid pt-4 gap-4 md:grid-cols-1 lg:grid-cols-3">
              {isDependent && (
                <div className="md:col-span-1">
                  <label
                    htmlFor="parentDateOfBirth"
                    className="block text-gray-700 dark:text-white"
                  >
                    Fecha de nacimiento
                  </label>
                  <div className="relative flex items-center">
                    <CustomDatePicker
                      selectedDate={formData.parentDateOfBirth}
                      onDateChange={handleParentDateOfBirthChange}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <CalendarIcon className="absolute right-3 h-5 w-5 text-gray-400 dark:text-white" />
                  </div>
                </div>
              )}
              <div>
                <label
                  htmlFor="document"
                  className="block text-gray-700 dark:text-white"
                >
                  Documento
                </label>
                <input
                  type="text"
                  id="document"
                  name="document"
                  placeholder="Document"
                  value={formData.document}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      document: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
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
                  disabled={patientExists}
                />
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <h4 className="block text-gray-700 dark:text-white">Género</h4>
                <button
                  type="button"
                  onClick={() => handleGenderChange("M")}
                  className={`py-2 px-4 border rounded-md text-center ${
                    formData.gender === "M"
                      ? "bg-cyan-800 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  M
                </button>
                <button
                  disabled={patientExists}
                  type="button"
                  onClick={() => handleGenderChange("F")}
                  className={`py-2 px-4 border rounded-md text-center ${
                    formData.gender === "F"
                      ? "bg-cyan-800 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  F
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mt-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-gray-700 dark:text-white"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-gray-700 dark:text-white"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
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
                  Ocupación
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  placeholder="Occupation"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-gray-700 dark:text-white"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
