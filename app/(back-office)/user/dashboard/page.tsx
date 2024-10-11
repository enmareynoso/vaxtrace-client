"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import { BookOpenCheck, UserRound, Waypoints } from "lucide-react";
import { CardSummary } from "@/components/dashboard/CardSummary";

interface Vaccine {
  vaccine_id: number;
  commercial_name: string;
  max_doses: number;
  missingDoses?: number;
  dose?: number;
  isOverdue?: boolean;
}

interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
}

const UserDashboardPage: React.FC = () => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [document, setDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedVaccines, setRecommendedVaccines] = useState<Vaccine[]>([]);
  const [appliedVaccines, setAppliedVaccines] = useState<Vaccine[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependent, setSelectedDependent] = useState<number | null>(null);
  const [mainUserId, setMainUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.user_id;
        setMainUserId(userId);

        if (!userId) {
          console.error("No user_id found in token");
          return;
        }

        const { data: user, error } = await supabase
          .from("vaxtraceapi_patientuser")
          .select("first_name, last_name, birthdate, document")
          .eq("id", userId)
          .single();

        if (error || !user) {
          console.error("Error fetching user information:", error);
          return;
        }

        const birthDateObj = new Date(user.birthdate);
        const ageInYears = new Date().getFullYear() - birthDateObj.getFullYear();
        setAge(ageInYears);
        setFullName(`${user.first_name} ${user.last_name}`);
        setBirthdate(birthDateObj.toLocaleDateString());
        setDocument(user.document);

        fetchDependents(userId);
        fetchRecommendedVaccines(calculateAgeInMonths(birthDateObj), userId, false);
        fetchAppliedVaccines(userId, false);
      } catch (error) {
        console.error("Error during fetching process:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const fetchDependents = async (userId: number) => {
    const { data: dependentsData, error } = await supabase
      .from("vaxtraceapi_child")
      .select("id, first_name, last_name, birthdate")
      .eq("parent_id", userId);

    if (error) {
      console.error("Error fetching dependents:", error);
    } else {
      setDependents(dependentsData || []);
    }
  };

  const handleDependentChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    setSelectedDependent(selectedId);

    if (!selectedId && mainUserId) {
      fetchMainUserData(mainUserId);
    } else if (selectedId) {
      const { data: dependentData } = await supabase
        .from("vaxtraceapi_child")
        .select("first_name, last_name, birthdate")
        .eq("id", selectedId)
        .single();

      if (dependentData) {
        const dependentBirthDate = new Date(dependentData.birthdate);
        setAge(new Date().getFullYear() - dependentBirthDate.getFullYear());
        setFullName(`${dependentData.first_name} ${dependentData.last_name}`);
        setBirthdate(dependentBirthDate.toLocaleDateString());

        fetchRecommendedVaccines(calculateAgeInMonths(dependentBirthDate), selectedId, true);
        fetchAppliedVaccines(selectedId, true);
      }
    }
  };

  const fetchMainUserData = async (userId: number) => {
    const { data: user, error } = await supabase
      .from("vaxtraceapi_patientuser")
      .select("first_name, last_name, birthdate, document")
      .eq("id", userId)
      .single();

    if (error || !user) {
      console.error("Error fetching user information:", error);
      return;
    }

    const birthDateObj = new Date(user.birthdate);
    const ageInYears = new Date().getFullYear() - birthDateObj.getFullYear();
    setAge(ageInYears);
    setFullName(`${user.first_name} ${user.last_name}`);
    setBirthdate(birthDateObj.toLocaleDateString());
    setDocument(user.document);

    fetchRecommendedVaccines(calculateAgeInMonths(birthDateObj), userId, false);
    fetchAppliedVaccines(userId, false);
  };

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

  const fetchRecommendedVaccines = async (ageInMonths: number, userId: number, isDependent: boolean) => {
    console.log(`Edad en meses: ${ageInMonths}`); // Mostrar la edad en meses en la consola
  
    const vaccineAgeRestrictions = {
      "0 Meses": {
        "BCG": 1,
        "Hepatitis B": 1,
      },
      "2 Meses": {
        "Rotavirus": 1,
        "IPV": 1,
        "Neumococo": 1,
        "Pentavalente": 1,
      },
      "4 Meses": {
        "Rotavirus": 2,
        "bOPV": 1,
        "Neumococo": 2,
        "Pentavalente": 2,
      },
      "6 Meses": {
        "IPV": 2,
        "Pentavalente": 3,
      },
      "12 Meses": {
        "SRP": 1,
        "Neumococo": 3,
      },
      "18 Meses": {
        "SRP": 2,
        "bOPV": 3,
        "DPT": 1,
      },
      "48 Meses": {
        "bOPV": 4,
        "DPT": 2,
      },
      "108-167 Meses": {
        "DPT": 3,
        "VPH": 2,
      },
      "168+ Meses": "all", // Indicador para incluir todas las vacunas disponibles
    };
  
    const { data: allVaccines, error } = await supabase
      .from("vaxtraceapi_vaccine")
      .select("vaccine_id, commercial_name, max_doses");
  
    if (error) {
      console.error("Error fetching vaccines:", error);
      return;
    }
  
    const { data: appliedVaccinesData } = await supabase
      .from("vaxtraceapi_vaccinationrecord")
      .select("vaccine_id, dose")
      .eq(isDependent ? "child_id" : "patient_id", userId);
  
    const dosesAppliedMap = (appliedVaccinesData || []).reduce((acc: any, record: any) => {
      acc[record.vaccine_id] = (acc[record.vaccine_id] || 0) + 1;
      return acc;
    }, {});
  
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
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["12 Meses"]);
    }
    if (ageInMonths >= 18) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["18 Meses"]);
    }
    if (ageInMonths >= 48) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["48 Meses"]);
    }
    if (ageInMonths >= 108) {
      Object.assign(recommendedVaccinesList, vaccineAgeRestrictions["108-167 Meses"]);
    }
    if (ageInMonths >= 168) {
      allVaccines.forEach(vaccine => {
        recommendedVaccinesList[vaccine.commercial_name] = vaccine.max_doses;
      });
    }
  
    const recommendedVaccines = allVaccines
      .filter(vaccine => recommendedVaccinesList.hasOwnProperty(vaccine.commercial_name))
      .map(vaccine => {
        const dosesRequired = recommendedVaccinesList[vaccine.commercial_name] || vaccine.max_doses;
        const dosesApplied = dosesAppliedMap[vaccine.vaccine_id] || 0;
        const missingDoses = Math.max(dosesRequired - dosesApplied, 0); // Calcula las dosis faltantes correctamente
        const isOverdue = dosesRequired > 0 && dosesApplied < dosesRequired && ageInMonths > 0; // Determinar si la vacuna está atrasada
  
        return {
          ...vaccine,
          missingDoses,
          isOverdue,
        };
      });
  
    setRecommendedVaccines(recommendedVaccines);
  };
  
  
  


  const fetchAppliedVaccines = async (userId: number, isDependent: boolean) => {
    try {
        const { data: appliedVaccinesData, error } = await supabase
            .from("vaxtraceapi_vaccinationrecord")
            .select(`vaccine_id, dose, vaccine:vaxtraceapi_vaccine(commercial_name)`)
            .eq(isDependent ? "child_id" : "patient_id", userId);

        if (error) {
            console.error("Error fetching applied vaccines:", error);
            return;
        }

        // Agrupar las dosis aplicadas por cada vacuna y sumar el total de dosis aplicadas
        const consolidatedVaccines = appliedVaccinesData.reduce((acc: any, record: any) => {
            const existingVaccine = acc.find((v: any) => v.vaccine_id === record.vaccine_id);

            if (existingVaccine) {
                existingVaccine.dose += 1; // Sumar una dosis al contador
            } else {
                acc.push({
                    vaccine_id: record.vaccine_id,
                    commercial_name: record.vaccine?.commercial_name || "Nombre no disponible",
                    dose: 1, // Empezar con la primera dosis
                });
            }

            return acc;
        }, []);

        setAppliedVaccines(consolidatedVaccines);
    } catch (err) {
        console.error("Error during fetching applied vaccines:", err);
    }
};


  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-800"></div>
        </div>
      ) : (
        <>
              {/* Título de bienvenida */}
    <h2 className="text-3xl font-bold mb-6 mt-4">{fullName ? `Bienvenido, ${fullName}` : "User Dashboard"}</h2>

    {/* Tarjetas de resumen */}
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-24 mb-8">
      <CardSummary
        icon={UserRound}
        total={birthdate || "--"}
        title="Fecha de Nacimiento"
        tooltipText="Fecha de nacimiento del usuario"
      />
      <CardSummary
        icon={Waypoints}
        total={age !== null ? age.toString() : "--"}
        title="Edad"
        tooltipText="Edad del usuario"
      />
      <CardSummary
        icon={BookOpenCheck}
        total={document || "--"}
        title="Documento"
        tooltipText="Documento del usuario"
      />
    </div>

{/* Dropdown de selección de dependientes */}
{dependents.length > 0 && (
  <div className="mb-8 mt-6">
    <label htmlFor="dependent-select" className="block mb-3 font-semibold text-lg text-gray-800 dark:text-gray-200">
      Visualizar Información de dependiente:
    </label>
    <select
      id="dependent-select"
      value={selectedDependent || ""}
      onChange={handleDependentChange}
      className="block w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                 rounded-lg text-gray-900 dark:text-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 
                 focus:border-blue-400 dark:focus:border-blue-500 
                 transition ease-in-out duration-150"
    >
            <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
              Seleccionar dependiente (Padre)
            </option>
            {dependents.map(dependent => (
              <option
                key={dependent.id}
                value={dependent.id}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              >
                {dependent.first_name} {dependent.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

            {/* Recommended Vaccines Table */}
      {/* Tabla de Vacunas Recomendadas */}
      <h3 className="text-xl font-semibold mt-8 mb-4">Vacunas requeridas según  edad del paciente</h3>
      {/* Explicación del proceso para determinar las vacunas recomendadas */}
      <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-sm mb-6">
        <p className="text-gray-800 dark:text-gray-200 text-justify">
          Las vacunas requeridas se determinan según la edad del usuario o dependiente en meses. 
          El sistema toma en cuenta las vacunas que deben administrarse en diferentes intervalos de edad 
          específicos para garantizar que se sigan las pautas del esquema de  vacunación. 
          Las vacunas que aparecen con un fondo <span className="bg-red-200 dark:bg-red-600 px-1 rounded">rojo</span> 
          indican que están atrasadas, mientras que las que tienen un fondo 
          <span className="bg-green-200 dark:bg-green-600 px-1 rounded">verde</span> 
          son aquellas para las que se han aplicado todas las dosis requeridas.
        </p>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-4">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Nombre de la Vacuna</th>
            <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Dosis Faltantes</th>
          </tr>
        </thead>
        <tbody>
          {recommendedVaccines.map(vaccine => (
            <tr
              key={vaccine.vaccine_id}
              className={`cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-700 ${
                vaccine.missingDoses === 0 
                  ? "bg-green-200 dark:bg-green-400"  // Fondo verde para vacunas con todas las dosis aplicadas
                  : vaccine.isOverdue 
                  ? "bg-red-200 dark:bg-red-400"    // Fondo rojo para vacunas que están atrasadas
                  : "dark:bg-gray-800"  // Fondo por defecto para otras filas en modo oscuro
              }`}
              title={vaccine.missingDoses === 0 ? "Completada" : "Atrasada"}
            >
              <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.commercial_name}</td>
              <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.missingDoses}</td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Tabla de Vacunas Aplicadas */}
      <h3 className="text-xl font-semibold mt-8">Vacunas Aplicadas</h3>
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-4">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Nombre de la Vacuna</th>
            <th className="py-2 pr-24 text-left text-gray-800 dark:text-gray-200">Dosis</th>
          </tr>
        </thead>
        <tbody>
          {appliedVaccines.map(vaccine => (
            <tr key={vaccine.vaccine_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="py-2 px-4 text-gray-900 dark:text-gray-200">{vaccine.commercial_name}</td>
              <td className="py-2 px-0 text-gray-900 dark:text-gray-200">{vaccine.dose}</td>
            </tr>
          ))}
        </tbody>
      </table>

              </>
            )}
          </div>
        );
      };

export default UserDashboardPage;
