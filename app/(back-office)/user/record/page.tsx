"use client";

import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";
import logo from "../../../../public/images/logo.png";
import Image from "next/image";

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
  const [symptomError, setSymptomError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [parentName, setParentName] = useState<string | null>(null);
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
      let symptomInserts = selectedSymptoms.map((symptomId) => ({
        vaccinationrecord_id: vaccinationRecordId,
        esavisymptom_id: symptomId,
      }));

      if (otherSymptom) {
        const { data: existingSymptom, error: selectError } = await supabase
          .from("vaxtraceapi_esavisymptom")
          .select("id")
          .eq("name", otherSymptom)
          .single();

        let symptomId;

        if (!existingSymptom) {
          const { data: newSymptom, error: otherInsertError } = await supabase
            .from("vaxtraceapi_esavisymptom")
            .insert({ name: otherSymptom, description: "" })
            .select("id")
            .single();

          if (otherInsertError) {
            toast.error("Error al agregar el otro síntoma. Intenta de nuevo.");
            return;
          }

          symptomId = newSymptom.id;
        } else {
          symptomId = existingSymptom.id;
        }

        symptomInserts.push({
          vaccinationrecord_id: vaccinationRecordId,
          esavisymptom_id: symptomId,
        });
      }

      if (symptomInserts.length > 0) {
        const { error: insertError } = await supabase
          .from("vaxtraceapi_vaccinationrecord_esavi_symptoms")
          .insert(symptomInserts);

        if (insertError) {
          toast.error("Error enviando el reporte. Intenta de nuevo.");
          return;
        }
      }

      toast.success("Reporte enviado con éxito.");
      setShowEsaviModal(false);
      setSelectedSymptoms([]);
      setOtherSymptom("");

      // Refresh the records for the current patient
      const patientId = selectedDependent || userInfo?.id;

      // Ensure patientId is valid before making the request
      if (typeof patientId === "number") {
        const isDependent = patientId !== userInfo?.id;
        await fetchVaccinationRecords(patientId, isDependent);
      } else {
        toast.error(
          "No se pudo identificar el ID del paciente. Verifica la información del usuario."
        );
        console.error("Patient ID is undefined.");
      }
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

    // Si se selecciona "Seleccionar dependiente" (valor 0 o vacío)
    if (!selectedId || selectedId === userInfo?.id) {
      // Si se selecciona la opción del padre o la opción vacía
      setSelectedDependent(userInfo?.id || null);
      setCurrentPatient(userInfo); // Cargar los datos del padre en currentPatient
      setParentName(null); // No hay padre que mostrar porque el paciente es el principal
      // Verificar que userInfo y userInfo.id existan antes de llamar a fetchVaccinationRecords
      if (userInfo?.id !== undefined) {
        await fetchVaccinationRecords(userInfo.id, false); // Cargar los registros de vacunación del padre
      } else {
        console.error("Error: userInfo o userInfo.id es undefined");
      }
    } else {
      // Si se selecciona un dependiente, buscar su información
      setSelectedDependent(selectedId);

      try {
        const { data: dependent, error: dependentError } = await supabase
          .from("vaxtraceapi_child")
          .select("first_name, last_name, birthdate, gender, parent_id")
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

          // Obtener el nombre del padre del dependiente
          const { data: parent, error: parentError } = await supabase
            .from("vaxtraceapi_patientuser")
            .select("first_name, last_name")
            .eq("id", dependent.parent_id)
            .single();

          if (parentError) {
            setError("Error fetching parent information.");
          } else {
            setParentName(`${parent.first_name} ${parent.last_name}`);
          }

          await fetchVaccinationRecords(selectedId, true); // Cargar los registros de vacunación del dependiente
        }
      } catch (err) {
        setError("Error fetching dependent information.");
        console.error(err);
      }
    }
  };

  const handleGenerateCertificate = () => {
    const element = certificateRef.current;
    const button = document.getElementById("download-btn");

    if (element && button) {
      // Cambiar el estado a "generando PDF"
      setIsGeneratingPDF(true);
      // Hide the button before generating the PDF
      button.style.display = "none";

      const options = {
        margin: [10, 1, 10, 1], // Top, right, bottom, left margins
        filename: "vaccination_certificate.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 3, // Scale up for better quality
          useCORS: true, // Handle cross-origin images if any
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait", // You can switch to 'landscape' if needed
        },
        pagebreak: { mode: ["avoid-all"] }, // Avoid breaking the table across pages
      };

      // Apply custom styling to the table cells for better layout
      const esaviCells = element.querySelectorAll("td:nth-child(6)");

      esaviCells.forEach((cell) => {
        const htmlCell = cell as HTMLElement; // Cast cell to HTMLElement
        htmlCell.style.whiteSpace = "normal"; // Ensure word wrapping
        htmlCell.style.width = "150px"; // Increase width of Esavi column
      });

      // Generate the PDF with the high-quality options
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          // Show the button again after the PDF is generated
          button.style.display = "block";
          // Cambiar el estado a "no generando PDF"
          setIsGeneratingPDF(false);
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-800"></div>
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
        <div className="mb-8 flex justify-center gap-4">
          {/* Dropdown para el padre */}
          <div className="w-full max-w-lg">
            <label
              htmlFor="parent-input"
              className="block mb-2 text-xl font-semibold text-gray-800 dark:text-gray-300"
            >
              Paciente:
            </label>
            <div className="relative">
              <input
                type="text"
                id="parent-input"
                value={`${userInfo?.first_name} ${userInfo?.last_name} (Padre)`}
                className="block w-full p-3 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 ease-in-out"
                readOnly
                disabled
              />
            </div>
          </div>

          {/* Mostrar el dropdown de dependientes solo si existen */}
          {dependents.length > 0 && (
            <div className="w-full max-w-lg">
              <label
                htmlFor="dependent-select"
                className="block mb-2 text-xl font-semibold text-gray-800 dark:text-gray-300"
              >
                Seleccionar dependiente:
              </label>
              <div className="relative">
                <select
                  id="dependent-select"
                  value={selectedDependent || ""} // Controlamos el valor del dependiente seleccionado
                  onChange={handleDependentChange}
                  className="block w-full p-3 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 ease-in-out"
                >
                  {/* Opción por defecto para seleccionar dependiente */}
                  <option value="">Seleccionar dependiente</option>
                  {dependents.map((dependent) => (
                    <option key={dependent.id} value={dependent.id}>
                      {dependent.first_name} {dependent.last_name} (Dependiente)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Certificado de vacunación */}
        <div
          ref={certificateRef}
          className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto dark:bg-gray-700"
        >
          {/* Add the logo here */}
          <div className="flex justify-center mb-6">
            <Image src={logo} alt="Vaxtrace Logo" width={50} height={50} />
          </div>
          <div className="border-b-2 pb-4 mb-6 dark:border-gray-400">
            <h3 className="text-2xl font-semibold mb-5 text-center">
              Record de Vacunación
            </h3>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <strong>Nombre:</strong> {currentPatient?.first_name}{" "}
                {currentPatient?.last_name}
              </div>
              <div>
                <strong>Fecha de Nacimiento: </strong>
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
              {parentName && (
                <div>
                  <strong>Nombre del Padre/Tutor:</strong> {parentName}
                </div>
              )}

              <div>
                <strong>Documento de Identidad: </strong>
                {currentPatient?.document}
              </div>
            </div>
          </div>

          {/* Tabla de vacunación */}
          <table className="w-full table-auto border-collapse border border-gray-300  dark:border-gray-400">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-500">
                <th className="border border-gray-300 px-4 py-2 text-left ">
                  Vacuna
                </th>
                <th className="border border-gray-300 px-5 py-2 text-left ">
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
                const recordDate = new Date(record.date);
                const isOlderThanTwoWeeks =
                  new Date().getTime() - recordDate.getTime() >
                  14 * 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
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
                      {/* Mostrar síntomas reportados o "No reportado" si no hay, en caso de estar generando PDF */}
                      {reportedSymptoms.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {reportedSymptoms.map((symptom) => (
                            <li key={symptom.id}>
                              {symptom.esavisymptom_id.name}
                            </li>
                          ))}
                        </ul>
                      ) : isGeneratingPDF || isOlderThanTwoWeeks ? (
                        // Mostrar "No reportado" en el PDF o si la vacuna fue subministrada hace más de dos semanas.
                        <span>No reportado</span>
                      ) : (
                        <button
                          className="text-blue-500 underline mt-2"
                          onClick={() => {
                            setSelectedRecordId(record.id);
                            setShowEsaviModal(true);
                          }}
                        >
                          Reportar síntomas
                        </button> // Mostrar botón si no está generando PDF
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Modal para el reporte de ESAVI */}
          {showEsaviModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg w-full max-w-md mx-4 shadow-lg relative dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center dark:text-gray-300">
                  Reportar ESAVI
                </h2>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed dark:text-gray-300">
                  Un ESAVI es un evento supuestamente atribuido a la vacunación
                  o inmunización. Selecciona hasta 3 síntomas que hayas
                  experimentado:
                </p>
                {/* Muestra el mensaje de error si existe */}
                {symptomError && (
                  <p className="text-red-500 text-sm mb-4">{symptomError}</p>
                )}

                {/* Lista de síntomas */}
                <div className="mb-6 space-y-3">
                  {esaviSymptoms.map((symptom) => (
                    <label
                      key={symptom.id}
                      className="flex items-center space-x-3"
                    >
                      <input
                        type="checkbox"
                        value={symptom.id}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          // Verifica si el checkbox está siendo marcado o desmarcado
                          if (e.target.checked) {
                            if (selectedSymptoms.length < 3) {
                              setSelectedSymptoms((prev) => [...prev, id]);
                              setSymptomError(null);
                            } else {
                              setSymptomError(
                                "Solo puedes seleccionar hasta 3 síntomas."
                              );
                            }
                          } else {
                            // Elimina el síntoma si se desmarca
                            setSelectedSymptoms((prev) =>
                              prev.filter((s) => s !== id)
                            );
                            setSymptomError(null);
                          }
                        }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {symptom.name}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Otro síntoma */}
                <div className="mb-6">
                  <label
                    htmlFor="other-symptom"
                    className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
                  >
                    Otro síntoma:
                  </label>
                  <input
                    type="text"
                    id="other-symptom"
                    value={otherSymptom}
                    onChange={(e) => {
                      setOtherSymptom(e.target.value);
                      if (selectedSymptoms.length > 0) {
                        setSelectedSymptoms([]);
                      }
                    }}
                    className="block w-full p-3 border rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                    placeholder="Describe otro síntoma"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg 
                      hover:bg-blue-700 transition duration-200 ease-in-out 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300`}
                    onClick={() => {
                      handleSubmitReport(selectedRecordId!);
                      setSelectedSymptoms([]);
                      setOtherSymptom("");
                    }}
                    disabled={
                      selectedSymptoms.length === 0 &&
                      otherSymptom.trim() === ""
                    }
                  >
                    Enviar reporte
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
                    onClick={() => {
                      setShowEsaviModal(false);
                      setSelectedSymptoms([]);
                      setOtherSymptom("");
                      setSymptomError(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              id="download-btn"
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
