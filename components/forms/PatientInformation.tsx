import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { getPatientByDocument } from "@/lib/api/auth";
import CustomDatePicker from "../ui/DatePicker";
import toast, { Toaster } from "react-hot-toast";

interface Dependent {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
}

interface FormData {
  document: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "M" | "F";
  dependentFirstName: string;
  dependentLastName: string;
  dependentGender: "M" | "F";
  parentDateOfBirth: Date;
  occupation: string;
  address: string;
  dependents: Dependent[]; // Asegúrate de que dependents sea un array de dependientes
}

export default function PatientInformation({
  setPatientInfo,
}: Readonly<{
  setPatientInfo: any;
}>) {
  const initialFormData: FormData = {
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
    dependents: [], // Almacenará los dependientes
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [documentInput, setDocumentInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [patientExists, setPatientExists] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]); // Dependientes del paciente

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

  const clearForm = () => {
    setFormData(initialFormData);
    setDependents([]); // Limpiar los dependientes
  };

  const handleVerifyPatient = async () => {
    if (!documentInput) {
      toast.error("Por favor digite su documento para verificarlo.");
      return;
    }

    if (documentInput.length !== 11) {
      toast.error("El número de documento debe tener exactamente 11 dígitos.");
      return;
    }

    clearForm();

    try {
      const patientData = await getPatientByDocument(documentInput);
      if (patientData) {
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
          dependents: patientData.dependents || [],
        });

        if (patientData.dependents && patientData.dependents.length > 0) {
          setDependents(patientData.dependents);
        }

        setPatientExists(true);
        setShowForm(true);
        toast.success("Paciente encontrado.");
      } else {
        throw new Error("Paciente no encontrado");
      }
    } catch (error) {
      toast.error(
        "Paciente nuevo. Por favor, complete el formulario manualmente."
      );
      setPatientExists(false);
      setShowForm(true);
    }
  };

  // Adaptar handleFormChange para manejar diferentes tipos de elementos de formulario
  const handleFormChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Si es un campo de tipo select, también actualizamos el estado de formData
    if (e.target instanceof HTMLSelectElement) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setPatientInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  const gridColsClass = isDependent ? "lg:grid-cols-3" : "lg:grid-cols-2";

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
                setDocumentInput(value);
              }
            }}
            className="flex-grow w-full md:w-auto px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition duration-150"
            placeholder="Document"
            maxLength={11}
          />
          <Button
            onClick={handleVerifyPatient}
            className="px-6 py-2 w-full md:w-auto bg-cyan-800 text-white font-semibold rounded-lg hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
          >
            Verificar
          </Button>
        </div>
      </div>

      {!isDependent && dependents.length > 0 && (
        <select
          onChange={(e) => {
            const selectedDependent = dependents.find(
              (dep) => dep.id === e.target.value
            );
            setFormData({
              ...formData,
              dependentFirstName: selectedDependent?.first_name || "",
              dependentLastName: selectedDependent?.last_name || "",
              dependentGender: selectedDependent?.gender === "male" ? "M" : "F",
            });
          }}
          className="w-full mt-4 px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {dependents.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {`${dep.first_name} ${dep.last_name}`}
            </option>
          ))}
        </select>
      )}

      {showForm && (
        <>
          <h2 className="text-lg pt-4 font-bold text-gray-800 dark:text-white">
            Patient Information
          </h2>

          <div className="md:col-span-1">
            <label
              htmlFor="dateOfBirth"
              className="block text-gray-700 dark:text-white"
            >
              Date of Birth
            </label>
            <div className="relative flex items-center">
              <CustomDatePicker
                selectedDate={formData.dateOfBirth}
                onDateChange={handleDateOfBirthChange}
                className="w-full py-2 rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                    First Name
                  </label>
                  <input
                    type="text"
                    id="dependentFirstName"
                    name="dependentFirstName"
                    placeholder="First Name"
                    value={formData.dependentFirstName}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dependentLastName"
                    className="block text-gray-700 dark:text-white"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="dependentLastName"
                    name="dependentLastName"
                    placeholder="Last name"
                    value={formData.dependentLastName}
                    onChange={handleFormChange}
                    disabled={patientExists}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <div className="flex items-center space-x-4 pt-4">
                    <h4 className="block text-gray-700 dark:text-white">
                      Gender
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
            </div>
          )}

          <div className="border-t pt-2">
            <h2 className="text-lg font-bold mb-0 text-gray-800 dark:text-white">
              {isDependent ? "Información del Padre / Tutor" : ""}
            </h2>

            <div className={`grid gap-4 md:grid-cols-1 ${gridColsClass} mt-4`}>
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
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-gray-700 dark:text-white"
                >
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={patientExists}
                />
              </div>
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
                      className="w-full rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

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
                  placeholder="Document"
                  value={formData.document}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  placeholder="Occupation"
                  value={formData.occupation}
                  onChange={handleFormChange}
                  disabled={patientExists}
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
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleFormChange}
                  disabled={patientExists}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
