"use client";

import PatientInformation from "@/components/forms/PatientInformation";
import VaccineInformation from "@/components/forms/VaccineInformation";
import { Button } from "@/components/ui/button";
import toast, { Renderable, Toast, ValueFunction } from "react-hot-toast";
import { registerVaccinationRecord } from "@/lib/api/auth";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterVaccination() {
  const [patientInfo, setPatientInfo] = useState<any>(null); // Información del paciente
  const [vaccineInfo, setVaccineInfo] = useState<any[]>([]); // Información de la vacuna
  const [selectedDependent, setSelectedDependent] = useState<any>(null); // Dependiente seleccionado (hijo)
  const [centerId, setCenterId] = useState<string | null>(null); // ID del centro
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>({}); // Ahora es un objeto para manejar errores de cada campo
  const [vaccineSelections, setVaccineSelections] = useState<any[]>([]); // Selecciones de vacunas
  const [appliedVaccines, setAppliedVaccines] = useState<any[]>([]); // Vacunas aplicadas para el paciente
  const [appliedVaccinesDependent, setAppliedVaccinesDependent] = useState<any[]>([]); // Vacunas aplicadas para el dependiente


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

  const validateForm = () => {
    let newErrors: any = {};

    // Validación de los campos de patientInfo
    if (!patientInfo?.document)
      newErrors.document = "El documento es obligatorio.";
    if (!patientInfo?.first_name)
      newErrors.first_name = "El nombre es obligatorio.";
    if (!patientInfo?.last_name)
      newErrors.last_name = "El apellido es obligatorio.";
    if (!patientInfo?.birthdate)
      newErrors.birthdate = "La fecha de nacimiento es obligatoria.";
    if (!patientInfo?.gender) newErrors.gender = "El género es obligatorio.";

    // Validación de vaccineInfo
    if (vaccineInfo.length === 0)
      newErrors.vaccines = "Debe agregar al menos una vacuna.";

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
    console.log("Token:", token); // Verificar si el token está presente

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

      // Determinar si se debe registrar la vacuna para el padre o el dependiente
      const targetPatient = selectedDependent || patientInfo;

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
        vaccinations: vaccineInfo.map((v) => ({
          vaccine_id: v.vaccine_id,
          dose: v.dose,
          batch_lot_number: v.batch_lot_number,
        })),
        center_id: centerId?.toString(),
      };

      console.log("Sending vaccination record:", vaccinationRecord); // Debugging

      // Llamada al backend para registrar el registro de vacunación
      await registerVaccinationRecord(vaccinationRecord, token);

      // Mostrar mensajes de éxito personalizados
      toast.success(
        selectedDependent
          ? `Registro de vacunación creado para el usuario menor de edad ${selectedDependent.first_name}.`
          : `Registro de vacunación creado para el usuario ${patientInfo.first_name}.`
      );

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
        setSelectedDependent={setSelectedDependent}
        setError={setError}
      />

      {/* Componente para la información de la vacuna */}
      {(patientInfo !== null || selectedDependent !== null) && (
        <VaccineInformation
          setVaccineInfo={setVaccineInfo}
          patientId={patientInfo?.id}
          childId={selectedDependent?.id}
          birthDate={selectedDependent?.birthdate || patientInfo?.birthdate} // Pasar la fecha de nacimiento correcta
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
          {loading ? "Guardando..." : "Guardar Registro"}
        </Button>
      </div>
    </div>
  );
}
