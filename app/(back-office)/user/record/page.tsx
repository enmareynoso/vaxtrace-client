"use client";

import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";

// Interfaz para los registros de vacunación
interface VaccinationRecord {
  id: number;
  vaccine_id: number;
  dose: string;
  date: string;
  vaccine: {
    commercial_name: string;
    diseases_covered: string;
    max_doses: number;
  };
  vaccination_center_id: number;
  vaccination_center: {
    name: string;
  };
}

// Interfaz para dependientes
interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
}

// Interfaz para la información del usuario
interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  document: string;
  birthdate: string;
  gender: string;
  nationality: string;
}

// Componente principal
const VaccinationRecordPage: React.FC = () => {
  const [vaccinationRecords, setVaccinationRecords] = useState<
    VaccinationRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependent, setSelectedDependent] = useState<number | null>(
    null
  );
  const [currentPatient, setCurrentPatient] = useState<UserInfo | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [showEsaviModal, setShowEsaviModal] = useState(false);
  const [esaviSymptoms, setEsaviSymptoms] = useState<any[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [reportedSymptomsByRecord, setReportedSymptomsByRecord] = useState<{
    [key: number]: any[];
  }>({});

  // Función para obtener los registros de vacunación
  const fetchVaccinationRecords = async (
    patientId: number,
    isDependent: boolean
  ) => {
    try {
      setLoading(true);
      const { data: vaccinationRecords, error: vaccinationError } =
        await supabase
          .from("vaxtraceapi_vaccinationrecord")
          .select(
            `
            id,
            patient_id,
            vaccine_id,
            dose,
            date,
            vaccination_center_id,
            vaccine: vaxtraceapi_vaccine (commercial_name, diseases_covered, max_doses),
            vaccination_center: vaxtraceapi_vaccinationcenter (name)
          `
          )
          .eq(isDependent ? "child_id" : "patient_id", patientId);

      if (vaccinationError) {
        setError("Error fetching vaccination records.");
      } else {
        const filteredRecords = vaccinationRecords.reduce<VaccinationRecord[]>(
          (acc, current: any) => {
            const existing = acc.find(
              (record) => record.vaccine_id === current.vaccine_id
            );
            if (!existing) {
              acc.push(current);
            } else {
              const existingDate = new Date(existing.date);
              const currentDate = new Date(current.date);
              if (existingDate < currentDate) {
                const index = acc.indexOf(existing);
                acc.splice(index, 1, current);
              }
            }
            return acc;
          },
          []
        );

        setVaccinationRecords(filteredRecords || []);

        // Cargar síntomas reportados para cada registro
        const allReportedSymptoms: { [key: number]: any[] } = {};
        for (const record of filteredRecords) {
          const reportedSymptoms = await fetchReportedSymptoms(record.id);
          allReportedSymptoms[record.id] = reportedSymptoms;
        }
        setReportedSymptomsByRecord(allReportedSymptoms);
      }
    } catch (err) {
      setError("Error fetching vaccination records.");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener síntomas ESAVI desde la base de datos
  const fetchEsaviSymptoms = async () => {
    try {
      const { data: symptoms, error: symptomError } = await supabase
        .from("vaxtraceapi_esavisymptom")
        .select(
          `
        id,
        name,
        description
        `
        )
        .limit(6); // Limita los resultados a los primeros 6

      if (symptomError) {
        console.error("Error fetching ESAVI symptoms:", symptomError);
      } else {
        setEsaviSymptoms(symptoms);
      }
    } catch (err) {
      console.error("Error fetching ESAVI symptoms:", err);
    }
  };

  const fetchReportedSymptoms = async (vaccinationRecordId: number) => {
    try {
      const { data: reportedSymptoms, error: symptomError } = await supabase
        .from("vaxtraceapi_vaccinationrecord_esavi_symptoms")
        .select("id, esavisymptom_id (id, name)")
        .eq("vaccinationrecord_id", vaccinationRecordId);

      if (symptomError) {
        console.error("Error fetching reported symptoms:", symptomError);
        return [];
      }
      console.log("reportedSymptoms: ", reportedSymptoms);
      return reportedSymptoms;
    } catch (err) {
      console.error("Error fetching reported symptoms:", err);
      return [];
    }
  };

  const handleSubmitReport = async (vaccinationRecordId: number) => {
    if (selectedSymptoms.length === 0 && !otherSymptom) {
      toast.error(
        "Por favor selecciona al menos un síntoma o proporciona otro síntoma."
      );
      return;
    }

    try {
      // Almacenamos los insert de síntomas seleccionados
      let symptomInserts = selectedSymptoms.map((symptomId) => ({
        vaccinationrecord_id: vaccinationRecordId,
        esavisymptom_id: symptomId,
      }));

      // Manejo del "otro síntoma"
      if (otherSymptom) {
        const { data: existingSymptom, error: selectError } = await supabase
          .from("vaxtraceapi_esavisymptom")
          .select("id")
          .eq("name", otherSymptom)
          .single();

        let symptomId: number;

        // Si el síntoma no existe, lo insertamos
        if (!existingSymptom) {
          const { data: newSymptom, error: otherInsertError } = await supabase
            .from("vaxtraceapi_esavisymptom")
            .insert({ name: otherSymptom, description: "" })
            .select("id") // Asegúrate de que se retorna el id del nuevo registro
            .single();

          if (otherInsertError) {
            toast.error("Error al agregar el otro síntoma. Intenta de nuevo.");
            console.error(otherInsertError);
            return;
          }

          console.log("Nuevo síntoma insertado:", newSymptom);

          if (newSymptom && newSymptom.id) {
            symptomId = newSymptom.id;
          } else {
            toast.error("No se pudo obtener el ID del nuevo síntoma.");
            return;
          }
        } else {
          symptomId = existingSymptom.id;
        }

        // Añadimos el nuevo síntoma al array de inserts
        symptomInserts.push({
          vaccinationrecord_id: vaccinationRecordId,
          esavisymptom_id: symptomId,
        });
      }

      // Insertar todos los síntomas (seleccionados y el nuevo si existe)
      if (symptomInserts.length > 0) {
        const { error: insertError } = await supabase
          .from("vaxtraceapi_vaccinationrecord_esavi_symptoms")
          .insert(symptomInserts);

        if (insertError) {
          toast.error("Error enviando el reporte. Intenta de nuevo.");
          console.error(insertError);
          return;
        }
      }

      toast.success("Reporte enviado con éxito.");
      setShowEsaviModal(false);
      setSelectedSymptoms([]);
      setOtherSymptom("");
    } catch (err) {
      toast.error("Error enviando el reporte. Intenta de nuevo.");
      console.error("Error during ESAVI report submission:", err);
    }
  };

  // Función para obtener la información del usuario y dependientes
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("access_token");

      if (!token) {
        setError("Authorization token is missing.");
        setLoading(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.user_id;

      try {
        // Obtener información del usuario
        const { data: user, error: userError } = await supabase
          .from("vaxtraceapi_patientuser")
          .select(
            "first_name, last_name, document, birthdate, gender, nationality"
          )
          .eq("id", userId)
          .single();

        if (userError) {
          setError("Error fetching user information.");
          return;
        }

        // Almacena la información del usuario en userInfo
        setUserInfo({ ...user, id: userId });
        setCurrentPatient({ ...user, id: userId });

        // Obtener dependientes del usuario
        const { data: dependentsData, error: dependentsError } = await supabase
          .from("vaxtraceapi_child")
          .select("id, first_name, last_name, birthdate, gender")
          .eq("parent_id", userId);

        if (dependentsError) {
          setError("Error fetching dependents.");
        } else {
          setDependents((dependentsData as Dependent[]) || []);
        }

        // Establecer el usuario principal como dependiente seleccionado por defecto
        setSelectedDependent(userId);

        // Obtener los registros de vacunación del adulto
        fetchVaccinationRecords(userId, false);

        // Obtener síntomas ESAVI
        fetchEsaviSymptoms();
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Manejar el cambio de dependiente
  const handleDependentChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = Number(event.target.value);
    setSelectedDependent(selectedId);

    if (selectedId !== userInfo?.id) {
      const { data: dependent, error: dependentError } = await supabase
        .from("vaxtraceapi_child")
        .select("first_name, last_name, birthdate, gender")
        .eq("id", selectedId)
        .single();

      if (dependentError) {
        setError("Error fetching dependent information.");
      } else {
        setCurrentPatient({
          ...dependent,
          id: selectedId,
          document: userInfo?.document || "",
          nationality: userInfo?.nationality || "",
        });

        fetchVaccinationRecords(selectedId, true);
      }
    } else {
      setCurrentPatient(userInfo);
      fetchVaccinationRecords(userInfo.id, false);
    }
  };

  const handleGenerateCertificate = () => {
    const element = certificateRef.current;

    if (element) {
      html2pdf().from(element).save("vaccination_certificate.pdf");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />

      <main className="flex-grow p-8">
        {/* Dropdown de dependientes */}
        <div className="mb-6 ml-24">
          <label
            htmlFor="dependent-select"
            className="block mb-2 text-lg font-medium text-gray-700"
          >
            Seleccionar paciente:
          </label>
          <select
            id="dependent-select"
            value={selectedDependent || userInfo?.id || ""}
            onChange={handleDependentChange}
            className="block w-2/5 p-2 border border-gray-300 rounded-lg shadow-sm"
          >
            <option key={userInfo?.id} value={userInfo?.id}>
              {userInfo?.first_name} {userInfo?.last_name}
            </option>
            {dependents.map((dependent) => (
              <option key={dependent.id} value={dependent.id}>
                {dependent.first_name} {dependent.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Certificado de vacunación */}
        <div
          ref={certificateRef}
          className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto"
        >
          <div className="border-b-2 pb-4 mb-6">
            <h3 className="text-2xl font-semibold mb-5 text-center">
              Record de Vacunación
            </h3>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <strong>Nombre:</strong> {currentPatient?.first_name}
                {currentPatient?.last_name}
              </div>
              <div>
                <strong>Fecha de Nacimiento:</strong>
                {currentPatient?.birthdate
                  ? new Date(currentPatient.birthdate).toLocaleDateString()
                  : "N/A"}
              </div>
              <div>
                <strong>Nacionalidad:</strong> {currentPatient?.nationality}
              </div>
              <div>
                <strong>Género:</strong> {currentPatient?.gender}
              </div>
              <div>
                <strong>Documento de Identidad:</strong>
                {currentPatient?.document}
              </div>
            </div>
          </div>

          {/* Tabla de vacunación */}
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Vacuna
                </th>
                <th className="border border-gray-300 px-5 py-2 text-left">
                  Dosis
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Enfermedades cubiertas
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Fecha
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Lugar de Vacunación
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Esavi
                </th>
              </tr>
            </thead>
            <tbody>
              {vaccinationRecords.map((record) => {
                const reportedSymptoms =
                  reportedSymptomsByRecord[record.id] || [];
                return (
                  <tr key={record.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">
                      {record.vaccine.commercial_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.dose} de {record.vaccine.max_doses}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.vaccine.diseases_covered}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.vaccination_center.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {reportedSymptoms.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {reportedSymptoms.map((symptom) => (
                            <li key={symptom.id}>
                              {symptom.esavisymptom_id.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <button
                          className="text-blue-500 underline mt-2"
                          onClick={() => {
                            setSelectedRecordId(record.id);
                            setShowEsaviModal(true);
                          }}
                        >
                          Reportar síntomas
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Modal para el reporte de ESAVI */}
          {showEsaviModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Reportar ESAVI</h2>
                <p className="mb-4">
                  Un ESAVI es un evento supuestamente atribuido a la vacunación
                  o inmunización. Selecciona hasta 3 síntomas que hayas
                  experimentado:
                </p>

                {/* Lista de síntomas */}
                <div className="mb-4">
                  {esaviSymptoms.map((symptom) => (
                    <label key={symptom.id} className="block">
                      <input
                        type="checkbox"
                        value={symptom.id}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          // Verifica si el checkbox está siendo marcado o desmarcado
                          if (e.target.checked) {
                            // Solo agrega el síntoma si hay menos de 3 seleccionados
                            if (selectedSymptoms.length < 3) {
                              setSelectedSymptoms((prev) => [...prev, id]);
                            } else {
                              toast.custom(
                                "Solo puedes seleccionar hasta 3 síntomas."
                              );
                            }
                          } else {
                            // Elimina el síntoma si se desmarca
                            setSelectedSymptoms((prev) =>
                              prev.filter((s) => s !== id)
                            );
                          }
                        }}
                      />
                      {symptom.name}
                    </label>
                  ))}
                </div>
                <div className="mb-4">
                  <label htmlFor="other-symptom" className="block mb-2">
                    Otro síntoma:
                  </label>
                  <input
                    type="text"
                    id="other-symptom"
                    value={otherSymptom}
                    onChange={(e) => {
                      setOtherSymptom(e.target.value);
                      // Limpiar la selección si se escribe en el campo "Otro síntoma"
                      if (selectedSymptoms.length > 0) {
                        setSelectedSymptoms([]);
                      }
                    }}
                    className="border rounded p-2 w-full"
                  />
                </div>

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    handleSubmitReport(selectedRecordId!);
                    // Limpiar estados al enviar el reporte
                    setSelectedSymptoms([]);
                    setOtherSymptom("");
                  }}
                  disabled={
                    selectedSymptoms.length === 0 && otherSymptom.trim() === ""
                  }
                >
                  Enviar reporte
                </button>
                <button
                  className="ml-2 bg-gray-300 text-black px-4 py-2 rounded"
                  onClick={() => {
                    setShowEsaviModal(false);
                    // Limpiar estados al cerrar el modal
                    setSelectedSymptoms([]);
                    setOtherSymptom("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={handleGenerateCertificate}
              className="px-4 py-2 bg-cyan-800 text-white font-semibold rounded-md hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
            >
              Descargar Certificado
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VaccinationRecordPage;
