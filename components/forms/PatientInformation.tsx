import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPatientByDocument } from "@/lib/api/auth";
import toast, { Toaster } from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

// Dependent interface
interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  parent: number;
}

interface VaccinationRecord {
  vaccine_id: number;
  dose: number;
  vaccine?: {
    commercial_name?: string;
    max_doses?: number; // Agregamos max_doses aquí
  };
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
  setError,
}: Readonly<{
  setPatientInfo: (info: any) => void;
  setSelectedDependent: (dependent: Dependent | null) => void;
  setError: (error: any) => void;
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

  const initialDependentData: Dependent = {
    id: 0,
    first_name: "",
    last_name: "",
    birthdate: "",
    gender: "",
    parent: 0,
  };

  // Local state management
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [documentInput, setDocumentInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [patientExists, setPatientExists] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependentId, setSelectedDependentId] = useState<number | null>(
    null
  );
  const [appliedVaccines, setAppliedVaccines] = useState<any[]>([]);
  const [appliedVaccinesDependent, setAppliedVaccinesDependent] = useState<any[]>([]);
  const [selectedDependentDetails, setSelectedDependentDetails] =
    useState<Dependent | null>(null);
  const [showDependentFields, setShowDependentFields] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [newDependentData, setNewDependentData] =
    useState<Dependent>(initialDependentData);
  const [error] = useState<{
    document?: string;
    birthdate?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null>(null);

  // Fetch and consolidate applied vaccines for a given ID
  const fetchAppliedVaccines = async (id: number, isDependent: boolean) => {
    if (id === 0) {
      // Si el dependiente es nuevo, no buscar vacunas aplicadas.
      setAppliedVaccinesDependent([]);
      return;
    }
  
    try {
      const { data: appliedVaccinesData, error } = await supabase
        .from("vaxtraceapi_vaccinationrecord")
        .select("vaccine_id, dose, vaccine:vaxtraceapi_vaccine(commercial_name, max_doses)")
        .eq(isDependent ? "child_id" : "patient_id", id);
  
      if (error) {
        console.error("Error fetching applied vaccines:", error);
        toast.error("Error al obtener las vacunas aplicadas.");
        return;
      }
  
      const consolidatedVaccines = (appliedVaccinesData as VaccinationRecord[]).reduce((acc, record) => {
        const existingVaccine = acc.find((v) => v.vaccine_id === record.vaccine_id);
        if (existingVaccine) {
          existingVaccine.totalDoses += 1;
        } else {
          acc.push({
            vaccine_id: record.vaccine_id,
            commercial_name: record.vaccine?.commercial_name || "Desconocido",
            totalDoses: 1,
            max_doses: record.vaccine?.max_doses || 0,
          });
        }
        return acc;
      }, [] as { vaccine_id: number; commercial_name: string; totalDoses: number; max_doses: number }[]);
  
      if (isDependent) {
        setAppliedVaccinesDependent(consolidatedVaccines); // Actualiza la tabla de dependiente
      } else {
        setAppliedVaccines(consolidatedVaccines); // Actualiza la tabla del paciente
      }
    } catch (err) {
      console.error("Error fetching applied vaccines:", err);
      toast.error("Ocurrió un error al obtener las vacunas aplicadas.");
    }
  };
  


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

  // Handle dependent gender change
  const handleDependentGenderChange = (value: "M" | "F") => {
    setNewDependentData((prev: any) => ({ ...prev, gender: value }));
  };

  // Handle dependent selection from the dropdown
  const handleDependentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (!isNaN(index) && dependents[index]) {
      const selectedDependent = dependents[index];
      setSelectedDependentDetails(selectedDependent);
      setSelectedDependent(selectedDependent);
      setSelectedDependentId(index);
      fetchAppliedVaccines(selectedDependent.id, true); // Llama a la función para vacunas del dependiente
      setShowDependentFields(false);
    } else {
      setSelectedDependentDetails(null);
      setSelectedDependent(null); // Limpiar el dependiente seleccionado si se deselecciona
      setSelectedDependentId(null); // Reset dependent if not selected
      setAppliedVaccinesDependent([]); // Limpia la tabla de vacunas del dependiente
      setShowDependentFields(false);
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

    if (!/^\d{11}$/.test(documentInput)) {
      toast.error(
        "El número de documento debe tener exactamente 11 dígitos numéricos."
      );
      return;
    }

    clearForm(); // Reset form and states before verification

    try {
      // Llama a la API de validación de cédulas
      const response = await fetch(
        `https://api.digital.gob.do/v3/cedulas/${documentInput}/validate`
      );

      if (response.status === 200) {
        // Verifica que la solicitud fue exitosa
        const data = await response.json();

        // Verifica si la cédula es válida
        if (!data.valid) {
          // Si la cédula no es válida
          toast.error("La cédula ingresada no es válida.");
          return;
        }
        // Si la cédula es válida, proceder con la búsqueda del paciente
        const patientData = await getPatientByDocument(documentInput);

        if (patientData && patientData.patient_info) {
          const { patient_info, children_info } = patientData;
          const birthdate = new Date(patient_info.birthdate);
          const age = calculateAge(birthdate);
          setIsMinor(age < 18);

          // Actualiza los datos del formulario con la información del paciente
          setFormData({
            ...patient_info,
            birthdate,
            dependents: children_info || [],
          });

          // Actualiza el estado de dependientes
          setDependents(children_info || []);
          setPatientInfo({ ...patient_info, document: documentInput });
          setPatientExists(true);
          setShowForm(true);
          // Fetch applied vaccines after verifying the patient
          fetchAppliedVaccines(patient_info.id , false);
          toast.success("Paciente encontrado.");
        } else {
          // Si el paciente no es encontrado en la base de datos
          throw new Error("Paciente no encontrado.");
        }
      } else {
        // Si el código de estado no es 200, mostrar un error
        toast.error("Cédula no valida.");
      }
    } catch (error) {
      // Si no se encuentra el paciente, permite que el usuario complete el formulario manualmente
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
  setFormData(initialFormData); // Reinicia el formulario del paciente
  setDependents([]); // Limpia la lista de dependientes
  setSelectedDependentId(null); // Restablece la selección del dependiente
  setSelectedDependentDetails(null); // Limpia los detalles del dependiente seleccionado
  setPatientExists(false); // Restablece la existencia del paciente a falso
  setShowForm(false); // Oculta el formulario
  setShowDependentFields(false); // Oculta los campos del dependiente

  setAppliedVaccines([]); // Limpia la tabla de vacunas del paciente
  setAppliedVaccinesDependent([]); // Limpia la tabla de vacunas del dependiente
  setPatientInfo(initialFormData); // Actualiza el componente padre para que no tenga información de paciente
};


  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPatientInfo((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle dependent form field changes
  const handleDependentFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewDependentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddDependent = () => {
    setSelectedDependentDetails(null); // Clear previous dependent selection
    setShowDependentFields(true); // Show new dependent form
    setNewDependentData(initialDependentData); // Reset new dependent form
    setSelectedDependent(null); // Limpiar el dependiente seleccionado si se deselecciona
    setSelectedDependentId(null); // Reset dependent if not selected
    setAppliedVaccinesDependent([]); // Limpia la tabla de vacunas del dependiente
  };
  
  
  
  

  const handleSaveNewDependent = () => {
    // Verificar que todos los campos requeridos estén presentes
    if (
      !newDependentData.first_name ||
      !newDependentData.last_name ||
      !newDependentData.birthdate ||
      !newDependentData.gender
    ) {
      toast.error("Por favor, complete todos los campos del dependiente.");
      return;
    }
  
    // Calcular el nuevo ID para el dependiente
    const nextId = dependents.length > 0
      ? Math.max(...dependents.map(dependent => dependent.id)) + 1 // Obtener el mayor ID y sumar 1
      : 60; // Si no hay dependientes, comenzar con 60
  
    // Crear el nuevo dependiente con el ID calculado
    const newDependent = {
      ...newDependentData,
      id: nextId, // Asignar el ID calculado
    };
  
    // Actualizar el estado local con el nuevo dependiente para que aparezca en el dropdown
    setDependents((prev: Dependent[]) => [...prev, newDependent]);
    setShowDependentFields(false);
    setNewDependentData(initialDependentData); // Resetea el formulario del nuevo dependiente
    toast.success("Dependiente agregado exitosamente.");
  };
  
  
  
  
  
  
  
  
  
  
  
  

  const handleClearDependentFields = () => {
    setNewDependentData(initialDependentData);
    setShowDependentFields(false);
  };

  const GenderButtons: React.FC<{
    selectedGender: string;
    onChange: (value: "M" | "F") => void;
    disabled: boolean;
  }> = ({ selectedGender, onChange, disabled }) => (
    <div className="flex items-center space-x-4 pt-4">
      <h4 className="block text-gray-700 dark:text-white">Género</h4>
      {["M", "F"].map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender as "M" | "F")}
          className={`py-2 px-4 border rounded-md text-center ${
            selectedGender === gender
              ? "bg-cyan-800 text-white"
              : "bg-gray-300 text-black"
          }`}
          disabled={disabled}
        >
          {gender}
        </button>
      ))}
    </div>
  );

  return (
    <div className="border p-6 rounded-md shadow-md space-y-2 bg-white dark:bg-gray-800">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Input for document number and button to verify patient */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 max-w-2xl mx-auto space-y-4 md:space-y-0 md:space-x-4">
        <label
          htmlFor="documentToVerify"
          className="text-lg font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap mb-2 md:mb-0"
        >
          Digite la cédula:
        </label>
        <div className="flex flex-col space-x-4 md:flex-row items-center w-full space-y-4 md:space-y-0">
          <input
            id="documentToVerify"
            type="text"
            value={documentInput}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 11) {
                setDocumentInput(value);
              }
            }}
            className={`flex-grow w-full md:w-auto px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${
              error?.document ? "border-red-500" : "border-gray-300"
            } dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400`}
            placeholder="Documento"
            maxLength={11}
          />
          <Button
            onClick={handleVerifyPatient}
            className="px-6 py-2 w-full md:w-auto bg-cyan-800 text-white font-semibold rounded-lg hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
          >
            Verificar
          </Button>
        </div>
        {error?.document && (
          <p className="text-red-500 text-sm mt-1">{error.document}</p>
        )}
      </div>

      {/* Always display the form for patient information */}
      {showForm && (
        <>
          {/* Formulario del Paciente y Dependiente */}
          <div>
            {/* Información del Padre/Madre o Tutor */}
            <h2 className="text-lg py-4 font-bold text-gray-800 dark:text-white">
              {isMinor
                ? "Información del Padre/Madre o Tutor"
                : "Información del Paciente"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="birthdate"
                  className="block text-gray-700 dark:text-white"
                >
                  Fecha de Nacimiento
                </label>
                <input
                  id="birthdate"
                  type="date"
                  name="birthdate"
                  value={
                    formData.birthdate
                      ? new Date(formData.birthdate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const newDate = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    handlebirthdateChange(newDate);
                  }}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    patientExists
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } ${
                    error?.birthdate ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={patientExists}
                />
                {error?.birthdate && (
                  <p className="text-red-500 text-sm mt-1">{error.birthdate}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="document"
                  className="block text-gray-700 dark:text-white"
                >
                  Documento
                </label>
                <input
                  id="document"
                  name="document"
                  placeholder="Documento"
                  value={formData.document}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    patientExists
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } ${
                    error?.document ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={patientExists}
                />
                {error?.document && (
                  <p className="text-red-500 text-sm mt-1">{error.document}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="first_name"
                  className="block text-gray-700 dark:text-white"
                >
                  {isMinor ? "Nombre del Tutor" : "Nombre"}
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  placeholder={isMinor ? "Nombre del Tutor" : "Primer nombre"}
                  value={formData.first_name}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    patientExists
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } ${
                    error?.first_name ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={patientExists}
                />
                {error?.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {error.first_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-gray-700 dark:text-white"
                >
                  {isMinor ? "Apellido del Tutor" : "Apellidos"}
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  placeholder={isMinor ? "Apellido del Tutor" : "Apellidos"}
                  value={formData.last_name}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    patientExists
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } ${
                    error?.last_name ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={patientExists}
                />
                {error?.last_name && (
                  <p className="text-red-500 text-sm mt-1">{error.last_name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 dark:text-white"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    patientExists
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } ${
                    error?.email ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={patientExists}
                />
                {error?.email && (
                  <p className="text-red-500 text-sm mt-1">{error.email}</p>
                )}
              </div>

              <GenderButtons
                selectedGender={formData.gender}
                onChange={handleGenderChange}
                disabled={patientExists}
              />

              {/* Additional fields for occupation and address */}
              <div>
                <label
                  htmlFor="occupation"
                  className="block text-gray-700 dark:text-white"
                >
                  Ocupación
                </label>
                <input
                  id="occupation"
                  name="occupation"
                  placeholder="Ocupación"
                  value={formData.occupation}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  id="address"
                  name="address"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          {/* Mostrar información de las vacunas aplicadas */}
          {appliedVaccines.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Vacunas Aplicadas</h3>
                        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-4">
                          <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700">
                              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Nombre de la Vacuna</th>
                              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Total Dosis</th>
                            </tr>
                          </thead>
                          <tbody>
                          {appliedVaccines.map((vaccine) => (
                              <tr
                                key={vaccine.vaccine_id}
                                className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  vaccine.totalDoses === vaccine.max_doses ? "bg-green-100 dark:bg-green-700" : ""
                                }`}
                              >
                                <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.commercial_name}</td>
                                <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.totalDoses}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
          )}
          {/* Dropdown para seleccionar dependiente */}
          {dependents.length > 0 && (
            <div className="mt-4">
              <label
                htmlFor="dependent-selector"
                className="block text-gray-700 dark:text-white mb-4 mt-4"
              >
                Seleccione el dependiente para registrar la vacuna (si es para
                el padre/madre/tutor, no seleccione dependiente):
              </label>
              <select
                onChange={handleDependentChange}
                value={selectedDependentId !== null ? selectedDependentId : ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                id="dependent-selector"
              >
                <option value="">Seleccione un Dependiente</option>
                {dependents.map((dependent, index) => (
                  <option
                    key={dependent.first_name + dependent.last_name}
                    value={index}
                  >
                    {dependent.first_name} {dependent.last_name}
                  </option>
                ))}
              </select>

              <div className="col-span-2 pt-4">
                <Button
                  onClick={handleAddDependent}
                  className="px-6 py-2 w-full md:w-auto bg-cyan-800 text-white font-medium rounded hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
                >
                  Agregar nuevo dependiente
                </Button>

                {showDependentFields && (
                  <Button
                    onClick={handleClearDependentFields}
                    className="px-6 py-2 w-full md:w-auto bg-transparent text-red-500 font-medium rounded hover:text-red-700 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

            </div>
          )}

          {/* Botón para agregar dependiente */}
          {!isMinor && dependents.length == 0 && (
            <div className="col-span-2 pt-4">
              <Button
                onClick={handleAddDependent}
                className="px-6 py-2 w-full md:w-auto bg-cyan-800 text-white font-medium rounded hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
              >
                Agregar Dependiente
              </Button>

              {showDependentFields && (
                <Button
                  onClick={handleClearDependentFields}
                  className="px-6 py-2 w-full md:w-auto bg-transparent text-red-500 font-medium rounded hover:text-red-700 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}

          {/* Dependent form */}
          {showDependentFields && (
            <div className="mb-4">
              <h3 className="text-lg font-bold mt-4 mb-4 text-gray-800 dark:text-white">
                Nuevo Dependiente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dependent-first_name"
                    className="block text-gray-700 dark:text-white"
                  >
                    Nombre
                  </label>
                  <input
                    id="dependent-first_name"
                    type="text"
                    name="first_name"
                    value={newDependentData.first_name}
                    onChange={handleDependentFormChange}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dependent-last_name"
                    className="block text-gray-700 dark:text-white"
                  >
                    Apellido
                  </label>
                  <input
                    id="dependent-last_name"
                    type="text"
                    name="last_name"
                    value={newDependentData.last_name}
                    onChange={handleDependentFormChange}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dependent-birthdate"
                    className="block text-gray-700 dark:text-white"
                  >
                    Fecha de Nacimiento
                  </label>
                  <input
                    id="dependent-birthdate"
                    type="date"
                    name="birthdate"
                    value={newDependentData.birthdate}
                    onChange={handleDependentFormChange}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                  />
                </div>
                <GenderButtons
                  selectedGender={newDependentData.gender}
                  onChange={handleDependentGenderChange}
                  disabled={false}
                />
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleSaveNewDependent}
                  className="px-6 py-2 w-full md:w-auto bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-white transition duration-150"
                >
                  Guardar Dependiente
                </Button>
              </div>
            </div>
          )}

          {/* Detalles del dependiente seleccionado */}
          {selectedDependentDetails && (
            <div className="mb-4">
              <h3 className="text-lg font-bold mt-4 mb-4 text-gray-800 dark:text-white">
                Detalles del Dependiente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="selectedDependent-first_name"
                    className="block text-gray-700 dark:text-white"
                  >
                    Nombre
                  </label>
                  <input
                    id="selectedDependent-first_name"
                    type="text"
                    value={selectedDependentDetails.first_name}
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-400 dark:bg-gray-500 dark:text-white"
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label
                    htmlFor="selectedDependent-last_name"
                    className="block text-gray-700 dark:text-white"
                  >
                    Apellido
                  </label>
                  <input
                    id="selectedDependent-last_name"
                    type="text"
                    value={selectedDependentDetails.last_name}
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-400 dark:bg-gray-500 dark:text-white"
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label
                    htmlFor="selectedDependent-birthdate"
                    className="block text-gray-700 dark:text-white"
                  >
                    Fecha de Nacimiento
                  </label>
                  <input
                    id="selectedDependent-birthdate"
                    type="text"
                    value={selectedDependentDetails.birthdate}
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-400 dark:bg-gray-500 dark:text-white"
                    readOnly
                    disabled
                  />
                </div>
                <GenderButtons
                  selectedGender={selectedDependentDetails.gender}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>
          )}
          {/* Mostrar la tabla de vacunas aplicadas del dependiente seleccionado */}
{/* Mostrar la tabla de vacunas aplicadas del dependiente seleccionado */}
{selectedDependentDetails && selectedDependentDetails.id !== 0 && appliedVaccinesDependent.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-4">Vacunas Aplicadas del Dependiente</h3>
    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-4">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-700">
          <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Nombre de la Vacuna</th>
          <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Total Dosis</th>
        </tr>
      </thead>
      <tbody>
        {appliedVaccinesDependent.map((vaccine) => (
          <tr
            key={vaccine.vaccine_id}
            className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${
              vaccine.totalDoses === vaccine.max_doses ? "bg-green-100 dark:bg-green-700" : ""
            }`}
          >
            <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.commercial_name}</td>
            <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.totalDoses}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}




        </>
      )}
    </div>
  );
}
