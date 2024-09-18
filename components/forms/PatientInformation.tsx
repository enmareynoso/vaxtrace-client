import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPatientByDocument } from "@/lib/api/auth";
import CustomDatePicker from "../ui/DatePicker";
import toast, { Toaster } from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";

// Definición de la interfaz Dependent para manejar los dependientes
interface Dependent {
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  parent: number;
}

// Definición de la interfaz FormData que representa los datos del formulario del paciente
interface FormData {
  document: string;
  email: string;
  first_name: string;
  last_name: string;
  birthdate: Date;
  gender: string;
  dependentfirst_name: string;
  dependentlast_name: string;
  dependentGender: string;
  parentBirthdate: Date;
  occupation: string;
  address: string;
  dependents: Dependent[]; // Lista de dependientes
  nationality: string;
  is_underage: boolean;
}

export default function PatientInformation({
  setPatientInfo,
}: Readonly<{
  setPatientInfo: any;
}>) {
  // Datos iniciales del formulario
  const initialFormData: FormData = {
    document: "",
    email: "",
    first_name: "",
    last_name: "",
    birthdate: new Date(),
    gender: "",
    dependentfirst_name: "",
    dependentlast_name: "",
    dependentGender: "",
    parentBirthdate: new Date(),
    occupation: "",
    address: "",
    dependents: [],
    nationality: "",
    is_underage: false,
  };

  // Estados locales
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [documentInput, setDocumentInput] = useState(""); // Almacena el documento ingresado
  const [showForm, setShowForm] = useState(false); // Controla la visibilidad del formulario
  const [patientExists, setPatientExists] = useState(false); // Verifica si el paciente ya existe
  const [dependents, setDependents] = useState<Dependent[]>([]); // Dependientes del paciente
  const [selectedDependentId, setSelectedDependentId] = useState(null);
  const [selectedDependentDetails, setSelectedDependentDetails] = useState<Dependent | null>(null);



  // Calcula la edad a partir de la fecha de nacimiento
  const calculateAge = (dob: Date): number => {

    if (!(dob instanceof Date) || isNaN(dob.getTime())) {
      return 0;
    }
  
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  
  
  

  // Maneja el cambio en la fecha de nacimiento del paciente
  const handlebirthdateChange = (date: Date | null) => {
    if (date) {
      const isUnderage = calculateAge(date) < 18; // Determina si es menor de edad
      setFormData((prev) => ({
        ...prev,
        birthdate: date,
        is_underage: isUnderage,
      }));
      setPatientInfo((prev: any) => ({
        ...prev,
        birthdate: date,
        is_underage: isUnderage,
      }));
      setShowForm(true);
    } else {
      // Handle null or invalid dates
      console.error("Invalid date provided.");
    }
  };
  

  // Verifica si el paciente es dependiente en función de la edad
  const isDependent = formData.birthdate
    ? calculateAge(formData.birthdate) < 18
    : false;

  // Maneja el cambio de género del paciente
  const handleGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setPatientInfo((prev: any) => ({ ...prev, gender: value }));
  };
  // Function to handle selecting a dependent from the dropdown
  const handleDependentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10); // Get index from the dropdown
    if (!isNaN(index) && dependents[index]) {
        setSelectedDependentDetails(dependents[index]);
    } else {
        setSelectedDependentDetails(null);
    }
};




  // Maneja el cambio de género del dependiente
  const handleDependentGenderChange = (value: "M" | "F") => {
    setFormData((prev) => ({ ...prev, dependentGender: value }));
    setPatientInfo((prev: any) => ({ ...prev, dependentGender: value }));
  };

  // Maneja el cambio en la fecha de nacimiento del padre/tutor
  const handleparentBirthdateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        parentBirthdate: date,
      }));
      setPatientInfo((prev: any) => ({ ...prev, parentBirthdate: date }));
    }
  };

  // Limpia el formulario y reinicia los dependientes
  const clearForm = () => {
    setFormData(initialFormData); // Restablece los datos del formulario
    setDependents([]); // Limpia la lista de dependientes
    setSelectedDependentId(null); // Restablece el dependiente seleccionado a 'null'
    setShowForm(false); // Oculta el formulario, si es que estaba visible
    setPatientExists(false); // Indica que ya no hay un paciente cargado
    setSelectedDependentDetails(null);
};


  // Verifica si el paciente existe en la base de datos basado en el documento
  const handleVerifyPatient = async () => {
    if (!documentInput) {
        toast.error("Por favor digite su documento para verificarlo.");
        return;
    }

    if (documentInput.length !== 11) {
        toast.error("El número de documento debe tener exactamente 11 dígitos.");
        return;
    }
    // Limpiar el formulario y otros estados relevantes antes de la verificación
    clearForm();

    try {
        const patientData = await getPatientByDocument(documentInput);
        console.log("Received patient data:", patientData);  // Log the data for review

        if (patientData && patientData.patient_info) {
            const { patient_info, children_info } = patientData;
            const birthdate = new Date(patient_info.birthdate);

            setFormData({
                ...patient_info,  // Spread all patient info into formData
                birthdate,  // Ensure the date is parsed correctly
                dependents: children_info || [],  // Handle children info if present
            });

            setDependents(children_info || []);
            setPatientInfo({ ...patient_info, document: documentInput });
            setPatientExists(true);
            setShowForm(true);
            toast.success("Paciente encontrado.");
        } else {
            throw new Error("Paciente no encontrado.");
        }
    } catch (error) {
      // Si el paciente no existe, permite al usuario completar manualmente
      setFormData((prev) => ({
        ...prev,
        document: documentInput,
      }));

      // Actualiza también el document en setPatientInfo
      setPatientInfo((prev: any) => ({ ...prev, document: documentInput }));

      toast("Paciente nuevo. Por favor, complete el formulario manualmente.", {
        icon: <FaInfoCircle size={24} color="#155e75" />,
      });

      setPatientExists(false);
      setShowForm(true);
    }
  };

  // Maneja el cambio en cualquier campo del formulario
  const handleFormChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Asegurarse de actualizar el estado global con el document si cambia
    setPatientInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  // Controla la clase de columnas del grid dependiendo de si el paciente es dependiente
  const gridColsClass = isDependent ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className="border p-6 rounded-md shadow-md space-y-2 bg-white dark:bg-gray-800">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Input para el documento y botón para verificar al paciente */}
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
                setDocumentInput(value); // Controla el input del documento
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
      {showForm && (
        <>
          {/* Sección de información del paciente */}
          <h2 className="text-lg pt-4 font-bold text-gray-800 dark:text-white">
          Información del Paciente
          </h2>
          <div className="md:col-span-1">
            <label
              htmlFor="birthdate"
              className="block text-gray-700 dark:text-white"
            >
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
          {/* Si el paciente es dependiente, muestra campos adicionales */}
          {isDependent && (
            <div className="pt-0 pb-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="dependentfirst_name"
                    className="block text-gray-700 dark:text-white"
                  >
                    Primer Nombre del Dependiente
                  </label>
                  <input
                    type="text"
                    id="dependentfirst_name"
                    name="dependentfirst_name"
                    placeholder="First Name"
                    value={formData.dependentfirst_name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dependentlast_name"
                    className="block text-gray-700 dark:text-white"
                  >
                    Apellido del Dependiente
                  </label>
                  <input
                    type="text"
                    id="dependentlast_name"
                    name="dependentlast_name"
                    placeholder="Last Name"
                    value={formData.dependentlast_name}
                    onChange={handleFormChange}
                    disabled={patientExists}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <div className="flex items-center space-x-4 pt-4">
                    <h4 className="block text-gray-700 dark:text-white">
                      Género del Dependiente
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
          {/* Información del padre/tutor si es dependiente */}
          <div className="border-t pt-2">
            <h2 className="text-lg font-bold mb-0 text-gray-800 dark:text-white">
              {isDependent ? "Información del Padre / Tutor" : ""}
            </h2>

            <div className={`grid gap-4 md:grid-cols-1 ${gridColsClass} mt-4`}>
              
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-gray-700 dark:text-white"
                >
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
                <label
                  htmlFor="last_name"
                  className="block text-gray-700 dark:text-white"
                >
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

              {/* Fecha de nacimiento del padre/tutor */}
              {isDependent && (
                <div className="md:col-span-1">
                  <label
                    htmlFor="parentBirthdate"
                    className="block text-gray-700 dark:text-white"
                  >
                    Fecha de Nacimiento del Padre/Tutor
                  </label>
                  <div className="relative flex items-center">
                    <CustomDatePicker
                      selectedDate={formData.parentBirthdate}
                      onDateChange={handleparentBirthdateChange}
                      className="w-full rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Otros campos del formulario */}
            <div className="grid pt-4 gap-4 md:grid-cols-1 lg:grid-cols-3">
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

            {/* Campos adicionales para ocupación y dirección */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-3">
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
                  Dirección
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

              <div>
                <label
                  htmlFor="nationality"
                  className="block text-gray-700 dark:text-white"
                >
                  Nacionalidad
                </label>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleFormChange}
                  disabled={patientExists}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione su nacionalidad</option>
                  <option value="Dominican Republic">
                    República Dominicana
                  </option>
                  <option value="United States">Estados Unidos</option>
                  <option value="Mexico">México</option>
                  <option value="Canada">Canadá</option>
                  <option value="Spain">España</option>
                  {/* Agrega más opciones según lo necesario */}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

       {/* Dropdown for selecting a dependent if there are any */}
       {dependents.length > 0 && (
        <div className="mt-4">
          <label htmlFor="dependent-selector" className="block text-gray-700 dark:text-white mb-4 mt-4">
            Seleccione el Dependiente a aplicar la vacuna (si es al padre no seleccione ningun dependiente):
          </label>
          <select
            onChange={handleDependentChange}
            value={selectedDependentId || ''}
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

    {selectedDependentDetails && (
      <div className="mb-4">
      <h3 className="text-lg font-bold mt-4 mb-4 text-gray-800 dark:text-white">Detalles del Dependiente</h3>
      <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="block text-gray-700 dark:text-white">Nombre</label>
              <input
                  type="text"
                  value={selectedDependentDetails?.first_name}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                  readOnly
                  disabled
              />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-white">Apellido</label>
            <input
                type="text"
                value={selectedDependentDetails?.last_name}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                readOnly
                disabled
            />
        </div>
        <div>
            <label className="block text-gray-700 dark:text-white">Fecha de Nacimiento</label>
            <input
                type="text"
                value={selectedDependentDetails?.birthdate}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                readOnly
                disabled
            />
        </div>
        <div className="flex items-center space-x-4 pt-4">
            <label className="block text-gray-700 dark:text-white">Género</label>
            <button
              type="button"
              onClick={() => handleDependentGenderChange("M")}
              className={`py-2 px-4 border rounded-md text-center ${
                selectedDependentDetails?.gender === "M"
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
                selectedDependentDetails?.gender === "F"
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
    </div>
  );
}
