"use client";

import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import { Button } from "@/components/ui/button";
import toast, { Renderable, Toast, ValueFunction } from "react-hot-toast";
import { registerVaccinationRecord } from "@/lib/api/auth";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { supabase } from "@/lib/supabaseClient";
import { FaSpinner } from "react-icons/fa";

export default function RegisterVaccination() {
  const [patientInfo, setPatientInfo] = useState<any>(null); // Información del paciente
  const [vaccineInfo, setVaccineInfo] = useState<any[]>([]); // Información de la vacuna
  const [selectedDependent, setSelectedDependent] = useState<any>(null); // Dependiente seleccionado (hijo)
  const [centerId, setCenterId] = useState<string | null>(null); // ID del centro
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>({}); // Ahora es un objeto para manejar errores de cada campo
  const [vaccineSelections, setVaccineSelections] = useState<any[]>([]); // Selecciones de vacunas
  const [appliedVaccines, setAppliedVaccines] = useState<any[]>([]); // Vacunas aplicadas para el paciente
  const [appliedVaccinesDependent, setAppliedVaccinesDependent] = useState<
    any[]
  >([]); // Vacunas aplicadas para el dependiente
  const [patientExists, setPatientExists] = useState<boolean>(false); // New state to track if the patient exists

  // Obtener el ID del centro desde localStorage al cargar el componente
  useEffect(() => {
    const fetchCenterId = async () => {
      setLoading(true);
      const accountId = localStorage.getItem("account_id");

      if (!accountId) {
        setError((prevError: any) => ({
          ...prevError,
          center: "No account_id found.",
        }));
        setLoading(false);
        return;
      }

      // Paso 1: Obtener vaccination_center_id desde vaxtraceapi_vaccinationcenteraccount
      const { data: account, error: accountError } = await supabase
        .from("vaxtraceapi_vaccinationcenteraccount")
        .select("vaccination_center_id")
        .eq("id", accountId)
        .single();

      if (accountError || !account) {
        setError((prevError: any) => ({
          ...prevError,
          center: "Error obteniendo el vaccination_center_id.",
        }));
        setLoading(false);
        return;
      }

      const vaccination_center_id = account.vaccination_center_id;

      // Paso 2: Obtener detalles del centro de vacunación si es necesario
      const { data: center, error: centerError } = await supabase
        .from("vaxtraceapi_vaccinationcenter")
        .select("RNC, name, address, phone_number, email, municipality_id")
        .eq("vaccination_center_id", vaccination_center_id)
        .single();

      if (centerError || !center) {
        setError((prevError: any) => ({
          ...prevError,
          center: "Error obteniendo los detalles del centro.",
        }));
        setLoading(false);
        return;
      }

      setCenterId(vaccination_center_id);
      setLoading(false);
    };

    fetchCenterId();
  }, []);

  const calculateAge = (dob: Date): number => {
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSetVaccineInfo = (newVaccineInfo: any) => {
    setVaccineInfo(newVaccineInfo);
  };

  const validateForm = () => {
    let newErrors: any = {};

    // Validación de los campos de patientInfo
    if (!patientInfo?.document)
      newErrors.document = "El documento es obligatorio.";
    if (!patientInfo?.first_name)
      newErrors.first_name = "El nombre es obligatorio.";
    if (!patientInfo?.last_name)
      newErrors.last_name = "El apellido es obligatorio.";
    if (!patientInfo?.birthdate) {
      newErrors.birthdate = "La fecha de nacimiento es obligatoria.";
    } else {
      const age = calculateAge(new Date(patientInfo.birthdate));
      if (age < 18) {
        newErrors.birthdate = "El usuario no es mayor de edad.";
      }
    }
    if (!patientInfo?.gender) newErrors.gender = "El género es obligatorio.";

    // Validación del email
    if (!patientInfo?.email) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(patientInfo.email)) {
      newErrors.email = "El formato del email no es válido.";
    } else if (
      !/(gmail\.com|hotmail\.com|yahoo\.com|outlook\.es|outlook\.com)$/i.test(
        patientInfo.email
      )
    ) {
      newErrors.email =
        "El email debe tener un dominio válido (ej. gmail.com, outlook.es).";
    }

    setError(newErrors);

    // Retorna true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    // Reiniciar todos los estados a sus valores iniciales
    setPatientInfo(null);
    setVaccineInfo([]);
    setSelectedDependent(null);
    setError({});
    setAppliedVaccines([]); // Limpiar las vacunas aplicadas del paciente
    setVaccineSelections([]);
    setAppliedVaccinesDependent([]); // Limpiar las vacunas aplicadas del dependiente
  };

  const handleSaveRecord = async () => {
    const token = Cookies.get("access_token"); // Obtener el token de las cookies

    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }

    if (!validateForm()) {
      toast.error("Por favor, complete todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      // Formatear la fecha de nacimiento
      const formattedBirthdate = patientInfo.birthdate
        ? new Date(patientInfo.birthdate).toISOString().split("T")[0]
        : null;

      // Verificar si es para un usuario dependiente
      const isChild = Boolean(selectedDependent);

      // Construir los datos del registro de vacunación
      const vaccinationRecord = {
        patient: {
          document: patientInfo.document,
          first_name: patientInfo.first_name,
          last_name: patientInfo.last_name,
          birthdate: formattedBirthdate ?? "",
          gender: patientInfo.gender,
          email: patientInfo.email,
          occupation: patientInfo.occupation,
          address: patientInfo.address,
        },
        dependent: isChild
          ? {
              id: selectedDependent.id,
              first_name: selectedDependent.first_name,
              last_name: selectedDependent.last_name,
              birthdate: selectedDependent.birthdate,
              gender: selectedDependent.gender,
            }
          : null, // Solo incluir si es un dependiente
        is_child: isChild, // Flag to indicate if it's for a child
        vaccinations:
          vaccineInfo.length > 0
            ? vaccineInfo.map((v) => ({
                vaccine_id: v.vaccine_id,
                dose: v.dose,
                batch_lot_number: v.batch_lot_number,
                application_date: v.application_date,
              }))
            : [], // Solo incluir las vacunas si hay información
        center_id: centerId?.toString(),
      };

      console.log("Sending vaccination record:", vaccinationRecord);

      // Llamada al backend para registrar el registro de vacunación
      const response = await registerVaccinationRecord(
        vaccinationRecord,
        token
      );
      console.log("Backend response:", response); // Log para verificar la respuesta del backend

      // Comprobar el mensaje devuelto por el backend para diferenciar un nuevo paciente
      if (response && response.message) {
        const expectedMessage = `Paciente ${patientInfo.first_name} registrado exitosamente.`;
        if (response.message === expectedMessage) {
          toast.success(response.message); // Mostrar directamente el mensaje del backend
        } else {
          // Mostrar mensaje estándar para el registro de vacunación
          toast.success(
            selectedDependent
              ? `Registro de vacunación creado para el usuario menor de edad ${selectedDependent.first_name}.`
              : `Registro de vacunación creado para el usuario ${patientInfo.first_name}.`
          );
        }
      } else {
        toast.error("No se recibió respuesta válida del servidor.");
      }

      // Llamar a la función para reiniciar el formulario
      resetForm();
    } catch (error: any) {
      if (error.response?.data?.errors?.length > 0) {
        error.response.data.errors.forEach(
          (err: Renderable | ValueFunction<Renderable, Toast>) => {
            toast.error(err);
          }
        );
      } else {
        toast.error("Fallo al guardar el registro.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Componente para la información del paciente */}
      <PatientInformation
        setPatientInfo={setPatientInfo}
        setPatientExists={setPatientExists}
        setSelectedDependent={setSelectedDependent}
        setVaccineInfo={handleSetVaccineInfo}
        setError={setError}
        errorI={error} // Pasa el estado de error correctamente al componente
      />

      {/* Conditionally render the VaccineInformation component */}
      {patientInfo && (
        <VaccineInformation
          setVaccineInfo={handleSetVaccineInfo}
          patientId={patientInfo?.id}
          childId={selectedDependent?.id}
          birthDate={selectedDependent?.birthdate || patientInfo?.birthdate} // Pass the correct birthdate
        />
      )}

      {/* Botón para guardar el registro */}
      <div className="pt-6">
        <Button
          onClick={handleSaveRecord}
          disabled={loading}
          className={`w-full py-3 bg-cyan-800 text-white font-semibold rounded-md ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-cyan-900"
          } transition duration-150`}
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" /> // Muestra el ícono de carga cuando loading es true
          ) : (
            "Guardar Registro"
          )}
        </Button>
      </div>
    </div>
  );
}
