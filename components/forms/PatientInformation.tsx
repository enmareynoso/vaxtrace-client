import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPatientByDocument } from "@/lib/api/auth";
import toast, { Toaster } from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import { FaExclamationCircle } from "react-icons/fa";

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
  application_date?: Date;
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
  setPatientExists,
  setVaccineInfo,
  setError,
  errorI,
}: Readonly<{
  setPatientInfo: (info: any) => void;
  setSelectedDependent: (dependent: Dependent | null) => void;
  setPatientExists: (exists: boolean) => void;
  setVaccineInfo: (vaccines: VaccinationRecord[]) => void;
  setError: (error: any) => void;
  errorI: {
    // Define el tipo para el error aquí
    document?: string;
    birthdate?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
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
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependentId, setSelectedDependentId] = useState<number | null>(
    null
  );
  const [appliedVaccines, setAppliedVaccines] = useState<any[]>([]);
  const [appliedVaccinesDependent, setAppliedVaccinesDependent] = useState<
    any[]
  >([]);
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
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [recommendedVaccines, setRecommendedVaccines] = useState<any[]>([]);

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
        .select(
          "vaccine_id, dose, vaccine:vaxtraceapi_vaccine(commercial_name, max_doses)"
        )
        .eq(isDependent ? "child_id" : "patient_id", id);

      if (error) {
        console.error("Error fetching applied vaccines:", error);
        toast.error("Error al obtener las vacunas aplicadas.");
        return;
      }

      const consolidatedVaccines = (
        appliedVaccinesData as VaccinationRecord[]
      ).reduce((acc, record) => {
        const existingVaccine = acc.find(
          (v) => v.vaccine_id === record.vaccine_id
        );
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
      const age = calculateAge(date);

      if (age < 18) {
        // Mostrar error si el usuario es menor de edad
        setError((prevError: any) => ({
          ...prevError,
          birthdate: "El usuario no es mayor de edad.",
        }));
      } else {
        // Limpiar el error si la fecha es válida
        setError((prevError: any) => ({
          ...prevError,
          birthdate: null,
        }));
        setFormData((prev) => ({
          ...prev,
          birthdate: date,
        }));
        setPatientInfo((prev: any) => ({
          ...prev,
          birthdate: date,
        }));
      }
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
      const response = await fetch(
        `https://api.digital.gob.do/v3/cedulas/${documentInput}/validate`
      );

      if (response.status === 200) {
        const data = await response.json();
        if (!data.valid) {
          toast.error("La cédula ingresada no es válida.");
          setIsExistingPatient(false); // Use the local state update
          setPatientExists(false); // Update the parent state
          return;
        }

        const patientData = await getPatientByDocument(documentInput);

        if (patientData && patientData.patient_info) {
          const { patient_info, children_info } = patientData;
          const birthdate = new Date(patient_info.birthdate);
          const age = calculateAge(birthdate);
          setIsMinor(age < 18);

          // Properly update formData with the patient's information
          setFormData({
            ...patient_info,
            birthdate,
            dependents: children_info || [],
          });

          setDependents(children_info || []);
          setPatientInfo({ ...patient_info, document: documentInput });
          setIsExistingPatient(true); // Use the local state update
          setPatientExists(true); // Update the parent state
          setShowForm(true);

          // Fetch applied vaccines after verifying the patient
          fetchAppliedVaccines(patient_info.id, false);

          toast.success("Paciente encontrado.");
        } else {
          throw new Error("Paciente no encontrado.");
        }
      } else {
        toast.error("Cédula no valida.");
        setIsExistingPatient(false); // Use the local state update
        setPatientExists(false); // Update the parent state
      }
    } catch (error) {
      // If the patient is not found, allow manual entry by setting patientInfo with the document number
      setFormData((prev) => ({
        ...prev,
        document: documentInput,
      }));

      setPatientInfo((prev: any) => ({ ...prev, document: documentInput }));
      setPatientExists(false); // Ensure we know this is a new patient
      setShowForm(true); // Show the form to enter patient details

      fetchRecommendedVaccines(216);
      setShowVaccineModal(true);

      toast("Paciente nuevo. Complete el formulario manualmente.", {
        icon: <FaInfoCircle size={24} color="#155e75" />,
      });
    }
  };

  // Clear the form and reset states
  const clearForm = () => {
    setFormData(initialFormData); // Reinicia el formulario del paciente
    setDependents([]); // Limpia la lista de dependientes
    setSelectedDependentId(null); // Restablece la selección del dependiente
    setSelectedDependentDetails(null); // Limpia los detalles del dependiente seleccionado
    setIsExistingPatient(false); // Restablece la existencia del paciente a falso
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

  const handleSaveNewDependent = async () => {
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

    // Calcular la edad del dependiente utilizando la función calculateAge
    const birthdate = new Date(newDependentData.birthdate);
    const age = calculateAge(birthdate);

    // Verificar si el dependiente es mayor de edad
    if (age >= 18) {
      toast.error("El dependiente es mayor de edad y no se puede agregar.");
      return;
    }

    try {
      // Obtener todos los IDs existentes de los dependientes para calcular el siguiente ID disponible
      const { data: existingDependents, error: fetchError } = await supabase
        .from("vaxtraceapi_child") // Asegúrate de que este sea el nombre correcto de la tabla
        .select("id");

      if (fetchError) {
        console.error(
          "Error al obtener los IDs de los dependientes:",
          fetchError
        );
        toast.error("Error al verificar los IDs existentes.");
        return;
      }

      // Encontrar el siguiente ID disponible
      const maxId =
        existingDependents && existingDependents.length > 0
          ? Math.max(
              ...existingDependents.map(
                (dependent: { id: number }) => dependent.id
              )
            )
          : 59; // Empezar en 59 si no hay dependientes existentes

      const nextId = maxId + 1;

      // Crear el nuevo dependiente con el ID calculado
      const newDependent = {
        ...newDependentData,
        id: nextId, // Asignar el ID calculado
      };

      const ageInMonths = calculateAgeInMonths(new Date(birthdate));
      fetchRecommendedVaccines(ageInMonths);
      setShowVaccineModal(true);

      // Actualizar el estado local con el nuevo dependiente para que aparezca en el dropdown
      setDependents((prev: Dependent[]) => [...prev, newDependent]);
      setShowDependentFields(false);
      setNewDependentData(initialDependentData); // Resetea el formulario del nuevo dependiente
      toast.success(
        "Dependiente agregado exitosamente y listo para ser registrado."
      );
    } catch (error) {
      console.error("Error al agregar dependiente:", error);
      toast.error(
        "Hubo un error al agregar el dependiente. Por favor, inténtelo de nuevo."
      );
    }
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

  // Lógica para manejar la selección de dosis y fechas
  const handleDoseSelection = (vaccineId: any, dose: number) => {
    setRecommendedVaccines((prevVaccines) => {
      const vaccineIndex = prevVaccines.findIndex(
        (v) => v.vaccine_id === vaccineId
      );
      if (vaccineIndex !== -1) {
        const updatedVaccine = {
          ...prevVaccines[vaccineIndex],
          appliedDoses: prevVaccines[vaccineIndex].appliedDoses?.includes(dose)
            ? prevVaccines[vaccineIndex].appliedDoses.filter(
                (d: number) => d !== dose
              )
            : [...(prevVaccines[vaccineIndex].appliedDoses || []), dose],
        };
        return [
          ...prevVaccines.slice(0, vaccineIndex),
          updatedVaccine,
          ...prevVaccines.slice(vaccineIndex + 1),
        ];
      }
      return prevVaccines;
    });
  };

  const handleDoseDateChange = (
    vaccineId: any,
    doseIndex: number,
    date: string
  ) => {
    setRecommendedVaccines((prevVaccines: any[]) =>
      prevVaccines.map((vaccine) => {
        if (vaccine.vaccine_id === vaccineId) {
          return {
            ...vaccine,
            doseDates: {
              ...(vaccine.doseDates || {}), // Asegura que doseDates siempre existe como objeto
              [doseIndex]: date,
            },
          };
        }
        return vaccine;
      })
    );
  };

  // Función para calcular la edad en meses a partir de la fecha de nacimiento
  const calculateAgeInMonths = (birthDate: Date) => {
    const today = new Date();
    const yearsDiff = today.getFullYear() - birthDate.getFullYear();
    const monthsDiff = today.getMonth() - birthDate.getMonth();
    const daysDiff = today.getDate() - birthDate.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;
    if (daysDiff < 0) {
      totalMonths--;
    }
    return totalMonths;
  };

  // Función para obtener las vacunas recomendadas según la edad
  const fetchRecommendedVaccines = async (ageInMonths: number) => {
    console.log(`Edad en meses: ${ageInMonths}`); // Mostrar la edad en meses en la consola

    const vaccineAgeRestrictions = {
      "0 Meses": {
        BCG: 1,
        "Hepatitis B": 1,
      },
      "2 Meses": {
        Rotavirus: 1,
        IPV: 1,
        Neumococo: 1,
        Pentavalente: 1,
      },
      "4 Meses": {
        Rotavirus: 2,
        bOPV: 1,
        Neumococo: 2,
        Pentavalente: 2,
      },
      "6 Meses": {
        IPV: 2,
        Pentavalente: 3,
      },
      "12 Meses": {
        SRP: 1,
        Neumococo: 3,
      },
      "18 Meses": {
        SRP: 2,
        bOPV: 3,
        DPT: 1,
      },
      "48 Meses": {
        bOPV: 4,
        DPT: 2,
      },
      "108-167 Meses": {
        DPT: 3,
        VPH: 2,
      },
      "168+ Meses": "all", // Indicador para incluir todas las vacunas disponibles
    };

    // Obtener todas las vacunas disponibles desde la base de datos
    const { data: allVaccines, error } = await supabase
      .from("vaxtraceapi_vaccine")
      .select("vaccine_id, commercial_name, max_doses");

    if (error) {
      console.error("Error fetching vaccines:", error);
      return;
    }

    let recommendedVaccinesList: { [key: string]: number } = {};

    // Acumular todas las vacunas relevantes según la edad del paciente
    if (ageInMonths >= 0) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["0 Meses"]);
    }
    if (ageInMonths >= 2) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["2 Meses"]);
    }
    if (ageInMonths >= 4) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["4 Meses"]);
    }
    if (ageInMonths >= 6) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["6 Meses"]);
    }
    if (ageInMonths >= 12) {
      Object.assign(
        recommendedVaccinesList,
        vaccineAgeRestrictions["12 Meses"]
      );
    }
    if (ageInMonths >= 18) {
      Object.assign(
        recommendedVaccinesList,
        vaccineAgeRestrictions["18 Meses"]
      );
    }
    if (ageInMonths >= 48) {
      Object.assign(
        recommendedVaccinesList,
        vaccineAgeRestrictions["48 Meses"]
      );
    }
    if (ageInMonths >= 108) {
      Object.assign(
        recommendedVaccinesList,
        vaccineAgeRestrictions["108-167 Meses"]
      );
    }
    if (ageInMonths >= 168) {
      allVaccines.forEach((vaccine) => {
        recommendedVaccinesList[vaccine.commercial_name] = vaccine.max_doses;
      });
    }

    // Filtrar las vacunas disponibles según las recomendaciones
    const recommendedVaccines = allVaccines.filter((vaccine) => {
      return recommendedVaccinesList.hasOwnProperty(vaccine.commercial_name);
    });

    setRecommendedVaccines(recommendedVaccines); // Actualizamos el estado con las vacunas recomendadas
  };

  const handleSaveVaccines = async () => {
    try {
      // Filtrar solo las vacunas que tienen dosis aplicadas
      const selectedVaccines = recommendedVaccines.filter(
        (vaccine) => vaccine.appliedDoses && vaccine.appliedDoses.length > 0
      );
      console.log("selectedVaccines: ", selectedVaccines);

      // Crear un arreglo de objetos con los registros de las vacunas seleccionadas
      const vaccineRecords = selectedVaccines.flatMap((vaccine) => {
        return vaccine.appliedDoses.map((dose: string | number) => ({
          vaccine_id: vaccine.vaccine_id,
          commercial_name: vaccine.commercial_name,
          dose: dose,
          application_date: vaccine.doseDates[dose] || null, // Fecha de aplicación de la dosis
        }));
      });

      console.log("Registros de vacunas seleccionadas:", vaccineRecords);

      // Guardar la lista de registros de vacunas en el setVaccineInfo
      setVaccineInfo(vaccineRecords);

      // Alerta o confirmación de guardado exitoso
      alert("Las dosis seleccionadas han sido guardadas exitosamente.");
      setShowVaccineModal(false); // Cierra el modal tras el guardado
    } catch (error) {
      console.error("Error al guardar las dosis de vacunas:", error);
      alert("Hubo un problema al guardar las dosis de vacunas.");
    }
  };

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
          {/* Modal para seleccionar vacunas previamente subministradas */}
          {showVaccineModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg w-full max-w-md mx-4 shadow-lg relative dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center dark:text-gray-300">
                  Vacunas Previamente Aplicadas
                </h2>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed dark:text-gray-300">
                  Selecciona las dosis que se han aplicado de cada una de las
                  vacunas recomendadas para su edad y proporciona la fecha de
                  aplicación:
                </p>

                {/* Contenedor con scroll para la lista de vacunas */}
                <div className="max-h-60 overflow-y-auto space-y-6 mb-6">
                  {recommendedVaccines.map((vaccine) => (
                    <div key={vaccine.vaccine_id} className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {vaccine.commercial_name}
                      </h3>

                      {/* Dosis a Aplicar */}
                      <div className="space-y-2">
                        {[...Array(Number(vaccine.max_doses))].map(
                          (_, doseIndex) => {
                            const doseNumber = doseIndex + 1;
                            const uniqueKey = `${vaccine.vaccine_id}-${doseNumber}`;
                            const appliedDoses = vaccine.appliedDoses || []; // Valor predeterminado para evitar el error
                            const doseDate =
                              vaccine.doseDates?.[doseNumber] || ""; // Asegura que siempre haya un valor
                            return (
                              <div
                                className="flex items-center space-x-3"
                                key={uniqueKey}
                              >
                                <input
                                  id={uniqueKey}
                                  type="checkbox"
                                  onChange={() =>
                                    handleDoseSelection(
                                      vaccine.vaccine_id,
                                      doseNumber
                                    )
                                  }
                                  checked={appliedDoses.includes(doseNumber)}
                                  className="ml-2 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label
                                  htmlFor={uniqueKey}
                                  className="text-gray-700 dark:text-gray-300"
                                >
                                  Dosis {doseNumber}
                                </label>
                                {Array.isArray(vaccine.appliedDoses) &&
                                  vaccine.appliedDoses.includes(doseNumber) && (
                                    <input
                                      id={uniqueKey}
                                      type="date"
                                      onChange={(e) =>
                                        handleDoseDateChange(
                                          vaccine.vaccine_id,
                                          doseNumber,
                                          e.target.value
                                        )
                                      }
                                      className="ml-2 p-2 border rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                      required={appliedDoses.includes(
                                        doseNumber
                                      )}
                                    />
                                  )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      handleSaveVaccines();
                      setShowVaccineModal(false);
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={() => setShowVaccineModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${
                    errorI?.birthdate ? "border-red-500" : "border-gray-300"
                  } ${
                    isExistingPatient
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={isExistingPatient}
                />
                {errorI?.birthdate && (
                  <div className="flex items-center mt-1">
                    <FaExclamationCircle className="text-red-600 mr-2" />
                    <p className="text-red-600 text-sm">{errorI.birthdate}</p>
                  </div>
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
                    isExistingPatient
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-100 text-gray-400"
                  } ${
                    error?.document ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  readOnly
                  disabled
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
                    isExistingPatient
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  } ${
                    errorI?.first_name ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={isExistingPatient}
                />
                {errorI?.first_name && (
                  <div className="flex items-center mt-1">
                    <FaExclamationCircle className="text-red-600 mr-2" />
                    <p className="text-red-600 text-sm">{errorI.first_name}</p>
                  </div>
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
                    isExistingPatient
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  }  ${
                    errorI?.last_name ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={isExistingPatient}
                />
                {errorI?.last_name && (
                  <div className="flex items-center mt-1">
                    <FaExclamationCircle className="text-red-600 mr-2" />
                    <p className="text-red-600 text-sm">{errorI.last_name}</p>
                  </div>
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
                    isExistingPatient
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-black"
                  }  ${
                    errorI?.email ? "border-red-500" : "border-gray-300"
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  disabled={isExistingPatient}
                />
                {errorI?.email && (
                  <div className="flex items-center mt-1">
                    <FaExclamationCircle className="text-red-600 mr-2" />
                    <p className="text-red-600 text-sm">{errorI.email}</p>
                  </div>
                )}
              </div>

              <GenderButtons
                selectedGender={formData.gender}
                onChange={handleGenderChange}
                disabled={isExistingPatient}
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
                    <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">
                      Nombre de la Vacuna
                    </th>
                    <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">
                      Total Dosis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appliedVaccines.map((vaccine) => (
                    <tr
                      key={vaccine.vaccine_id}
                      className={
                        vaccine.totalDoses === vaccine.max_doses
                          ? "bg-green-100 dark:bg-green-700"
                          : ""
                      }
                    >
                      <td className="py-2 px-4 text-gray-900 dark:text-gray-200">
                        {vaccine.commercial_name}
                      </td>
                      <td className="py-2 px-4 text-gray-900 dark:text-gray-200">
                        {vaccine.totalDoses}
                      </td>
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
          {selectedDependentDetails &&
            selectedDependentDetails.id !== 0 &&
            appliedVaccinesDependent.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Vacunas Aplicadas del Dependiente
                </h3>
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-4">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">
                        Nombre de la Vacuna
                      </th>
                      <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">
                        Total Dosis
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedVaccinesDependent.map((vaccine) => (
                      <tr
                        key={vaccine.vaccine_id}
                        className={
                          vaccine.totalDoses === vaccine.max_doses
                            ? "bg-green-100 dark:bg-green-700"
                            : ""
                        }
                      >
                        <td className="py-2 px-4 text-gray-900 dark:text-gray-200">
                          {vaccine.commercial_name}
                        </td>
                        <td className="py-2 px-4 text-gray-900 dark:text-gray-200">
                          {vaccine.totalDoses}
                        </td>
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
