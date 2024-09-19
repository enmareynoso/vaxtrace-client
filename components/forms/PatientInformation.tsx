import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPatientByDocument } from "@/lib/api/auth";
import CustomDatePicker from "../ui/DatePicker";
import toast, { Toaster } from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";

// Dependent interface
interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  parent: number;
}

// Patient form data interface
interface FormData {
  document: string;
  email: string;
  first_name: string;
  last_name: string;
  birthdate: Date;
  gender: string;
  occupation: string;
  address: string;
  dependents: Dependent[]; // List of dependents
}

export default function PatientInformation({
  setPatientInfo,
  setSelectedDependent,
}: Readonly<{
  setPatientInfo: any;
  setSelectedDependent: any;
}>) {
  const initialFormData: FormData = {
    document: "",
    email: "",
    first_name: "",
    last_name: "",
    birthdate: new Date(),
    gender: "",
    occupation: "",
    address: "",
    dependents: [],
  };

  // Local state management
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [documentInput, setDocumentInput] = useState(""); // Input document number
  const [showForm, setShowForm] = useState(false); // Show/hide form
  const [patientExists, setPatientExists] = useState(false); // Check if patient exists
  const [dependents, setDependents] = useState<Dependent[]>([]); // Dependents list
  const [selectedDependentId, setSelectedDependentId] = useState<number | null>(null); // Selected dependent ID
  const [selectedDependentDetails, setSelectedDependentDetails] = useState<Dependent | null>(null); // Details of the selected dependent

  // Calculate age from birthdate
  const calculateAge = (dob: Date): number => {
    if (!(dob instanceof Date) || isNaN(dob.getTime())) {
      return 0;
    }
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Handle birthdate change for the patient
  const handlebirthdateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        birthdate: date,
      }));
      setPatientInfo((prev: any) => ({
        ...prev,
        birthdate: date,
      }));
    }
  };

  // Handle gender change
  const handleGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setPatientInfo((prev: any) => ({ ...prev, gender: value }));
  };

  // Handle dependent selection from the dropdown
  const handleDependentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    if (!isNaN(index) && dependents[index]) {
      const selectedDependent = dependents[index];
      setSelectedDependentDetails(selectedDependent);
      setSelectedDependent(selectedDependent); // Pasar el dependiente seleccionado al componente padre
      setSelectedDependentId(index); // Establecer el dependiente seleccionado en el estado local
    } else {
      setSelectedDependentDetails(null);
      setSelectedDependent(null); // Limpiar el dependiente seleccionado si se deselecciona
      setSelectedDependentId(null); // Reset dependent if not selected
    }
  };
  // Verify patient based on document number
  const handleVerifyPatient = async () => {
    if (!documentInput) {
      toast.error("Por favor, digite su documento para verificarlo.");
      return;
    }

    if (documentInput.length !== 11) {
      toast.error("El número de documento debe tener exactamente 11 dígitos.");
      return;
    }

    clearForm(); // Reset form and states before verification

    try {
      const patientData = await getPatientByDocument(documentInput);
      if (patientData && patientData.patient_info) {
        const { patient_info, children_info } = patientData;
        const birthdate = new Date(patient_info.birthdate);

        // Update form data with parent information
        setFormData({
          ...patient_info,
          birthdate,
          dependents: children_info || [],
        });

        // Update state for dependents if any exist
        setDependents(children_info || []);
        setPatientInfo({ ...patient_info, document: documentInput });
        setPatientExists(true);
        setShowForm(true);
        toast.success("Paciente encontrado.");
      } else {
        throw new Error("Paciente no encontrado.");
      }
    } catch (error) {
      // If patient doesn't exist, allow the user to manually fill in the data
      setFormData((prev) => ({
        ...prev,
        document: documentInput,
      }));

      setPatientInfo((prev: any) => ({ ...prev, document: documentInput }));
      toast("Paciente nuevo. Complete el formulario manualmente.", {
        icon: <FaInfoCircle size={24} color="#155e75" />,
      });

      setPatientExists(false);
      setShowForm(true);
    }
  };

  // Clear the form and reset states
  const clearForm = () => {
    setFormData(initialFormData);
    setDependents([]);
    setSelectedDependentId(null);
    setShowForm(false);
    setPatientExists(false);
    setSelectedDependentDetails(null);
  };

  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPatientInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="border p-6 rounded-md shadow-md space-y-2 bg-white dark:bg-gray-800">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Input for document number and button to verify patient */}
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

      {/* Always display the form for patient information */}
      {showForm && (
        <>
          <h2 className="text-lg pt-4 font-bold text-gray-800 dark:text-white">
            Información del Paciente
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="birthdate" className="block text-gray-700 dark:text-white">
                Fecha de Nacimiento
              </label>
              <div className="relative flex items-center">
                <CustomDatePicker
                  selectedDate={formData.birthdate}
                  onDateChange={handlebirthdateChange}
                  className="w-full py-2 rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="first_name" className="block text-gray-700 dark:text-white">
                Nombre
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={patientExists}
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-gray-700 dark:text-white">
                Apellido
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={patientExists}
              />
            </div>

            <div>
              <label htmlFor="document" className="block text-gray-700 dark:text-white">
                Documento
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
              <label htmlFor="email" className="block text-gray-700 dark:text-white">
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
                  formData.gender === "M" ? "bg-cyan-800 text-white" : "bg-gray-300 text-black"
                }`}
              >
                M
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange("F")}
                className={`py-2 px-4 border rounded-md text-center ${
                  formData.gender === "F" ? "bg-cyan-800 text-white" : "bg-gray-300 text-black"
                }`}
              >
                F
              </button>
            </div>

            {/* Additional fields for occupation and address */}
            <div>
              <label htmlFor="occupation" className="block text-gray-700 dark:text-white">
                Ocupación
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-gray-700 dark:text-white">
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dropdown to select dependents if available */}
          {dependents.length > 0 && (
            <div className="mt-4">
              <label
                htmlFor="dependent-selector"
                className="block text-gray-700 dark:text-white mb-4 mt-4"
              >
                Seleccione el dependiente para registrar la vacuna (si es para el padre, no seleccione dependiente):
              </label>
              <select
                onChange={handleDependentChange}
                value={selectedDependentId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                id="dependent-selector"
              >
                <option value="">Seleccione un Dependiente</option>
                {dependents.map((dependent, index) => (
                  <option key={index} value={index}>
                    {dependent.first_name} {dependent.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display dependent details if selected */}
          {selectedDependentDetails && (
            <div className="mb-4">
              <h3 className="text-lg font-bold mt-4 mb-4 text-gray-800 dark:text-white">
                Detalles del Dependiente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-white">Nombre</label>
                  <input
                    type="text"
                    value={selectedDependentDetails.first_name}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-white">Apellido</label>
                  <input
                    type="text"
                    value={selectedDependentDetails.last_name}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-white">Fecha de Nacimiento</label>
                  <input
                    type="text"
                    value={selectedDependentDetails.birthdate}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                    readOnly
                    disabled
                  />
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <label className="block text-gray-700 dark:text-white">Género</label>
                  <button
                    type="button"
                    className={`py-2 px-4 border rounded-md text-center ${
                      selectedDependentDetails.gender === "M" ? "bg-cyan-800 text-white" : "bg-gray-300 text-black"
                    }`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 border rounded-md text-center ${
                      selectedDependentDetails.gender === "F" ? "bg-cyan-800 text-white" : "bg-gray-300 text-black"
                    }`}
                  >
                    F
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
