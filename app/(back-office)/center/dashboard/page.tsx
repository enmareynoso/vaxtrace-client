"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpenCheck,
  UserRound,
  Waypoints,
  PhoneCall,
  MapIcon,
} from "lucide-react";
import { CardSummary } from "@/components/dashboard/CardSummary";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement
);

interface CenterInfo {
  name: string;
  address: string;
  phone_number: string;
  director_document: string;
  municipality_id: string;
  RNC: string;
}

interface ReportCounts {
  [key: string]: number;
}

interface UserReport {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  occupation?: string;
  reportCount: number;
  vaccinesReported?: string[];
}

const CenterDashboardPage: React.FC = () => {
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [municipalityName, setMunicipalityName] = useState<string | null>(null);
  const [provinceName, setProvinceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaccinesAdministered, setVaccinesAdministered] = useState<number>(0);
  const [esaviReports, setEsaviReports] = useState<ReportCounts>({});
  const [usersReports, setUsersReports] = useState<UserReport[]>([]);
  const [userReportsCount, setUserReportsCount] = useState<number>(0);
  const [vaccineData, setVaccineData] = useState<Record<string, number>>({});
  const [reportedData, setReportedData] = useState<Record<string, number>>({});

  async function fetchVaccinationCenterId(userId: string) {
    const { data: userAccount, error } = await supabase
      .from("vaxtraceapi_vaccinationcenteraccount")
      .select("vaccination_center_id")
      .eq("id", userId)
      .single();

    if (error || !userAccount) {
      console.error("Error fetching vaccination center account:", error);
      return null;
    }

    return userAccount.vaccination_center_id;
  }

  async function fetchCenterInfo(vaccinationCenterId: string) {
    const { data: center, error } = await supabase
      .from("vaxtraceapi_vaccinationcenter")
      .select(
        "name, address, phone_number, director_document, municipality_id, RNC"
      )
      .eq("vaccination_center_id", vaccinationCenterId)
      .single();

    if (error || !center) {
      console.error("Error fetching center info:", error);
      return null;
    }

    return center;
  }

  async function fetchMunicipalityInfo(municipalityId: string) {
    const { data: municipality, error } = await supabase
      .from("vaxtraceapi_municipality")
      .select("name, province_id")
      .eq("municipality_id", municipalityId)
      .single();

    if (error || !municipality) {
      console.error("Error fetching municipality info:", error);
      return null;
    }

    return municipality;
  }

  async function fetchProvinceInfo(provinceId: string) {
    const { data: province, error } = await supabase
      .from("vaxtraceapi_province")
      .select("name")
      .eq("province_id", provinceId)
      .single();

    if (error || !province) {
      console.error("Error fetching province info:", error);
      return null;
    }

    return province;
  }

  async function fetchVaccinesAdministered(vaccinationCenterId: string) {
    const { data: vaccines, error } = await supabase
      .from("vaxtraceapi_vaccinationrecord")
      .select("id")
      .eq("vaccination_center_id", vaccinationCenterId);

    if (error) {
      console.error("Error fetching vaccines administered:", error);
      return { count: 0, vaccineRecordIds: [] };
    }

    const vaccineRecordIds =
      vaccines?.map((record: any) => record.id).filter(Boolean) || [];
    return { count: vaccineRecordIds.length, vaccineRecordIds };
  }

  async function fetchEsaviReports(vaccineRecordIds: string[]) {
    const { data: esaviReportsData, error } = await supabase
      .from("vaxtraceapi_vaccinationrecord_esavi_symptoms")
      .select("vaccinationrecord_id")
      .in("vaccinationrecord_id", vaccineRecordIds);

    if (error) {
      console.error("Error fetching esavi reports:", error);
      return [];
    }

    return esaviReportsData;
  }

  async function fetchVaccinationRecords(vaccinationRecordIds: string[]) {
    const { data: vaccinationRecords, error } = await supabase
      .from("vaxtraceapi_vaccinationrecord")
      .select("id, patient_id, child_id, vaccination_center_id, vaccine_id")
      .in("id", vaccinationRecordIds);

    if (error) {
      console.error("Error fetching vaccination records:", error);
      return [];
    }

    return vaccinationRecords;
  }

  async function fetchUserReports(uniquePatientIds: Set<string>) {
    const { data: usersReportsData, error } = await supabase
      .from("vaxtraceapi_patientuser")
      .select("id, first_name, last_name, email, occupation")
      .in("id", Array.from(uniquePatientIds));

    if (error) {
      console.error("Error fetching user reports:", error);
      return [];
    }

    return usersReportsData;
  }

  async function fetchChildReports(uniquePatientIds: Set<string>) {
    const { data: childsReportsData, error } = await supabase
      .from("vaxtraceapi_child")
      .select("id, first_name, last_name, parent_id")
      .in("id", Array.from(uniquePatientIds));

    if (error) {
      console.error("Error fetching dependent reports:", error);
      return [];
    }

    return childsReportsData;
  }

  async function fetchVaccineNames(vaccineIds: string[]) {
    const { data: vaccinesData, error } = await supabase
      .from("vaxtraceapi_vaccine")
      .select("vaccine_id, commercial_name")
      .in("vaccine_id", vaccineIds);

    if (error) {
      console.error("Error fetching vaccine names:", error);
      return [];
    }

    return vaccinesData;
  }

  async function getUniqueReportCount(userId: any, vaccinationCenterId: any) {
    const { data: vaccinationRecords, error: recordsError } = await supabase
      .from("vaxtraceapi_vaccinationrecord")
      .select("id, vaccination_center_id")
      .or(`patient_id.eq.${userId},child_id.eq.${userId}`)
      .eq("vaccination_center_id", vaccinationCenterId);

    if (recordsError) {
      console.error("Error fetching vaccination records:", recordsError);
      return 0;
    }

    const vaccinationRecordIds = vaccinationRecords.map((record) => record.id);

    const { data: esaviReportsData, error: esaviReportsError } = await supabase
      .from("vaxtraceapi_vaccinationrecord_esavi_symptoms")
      .select("vaccinationrecord_id")
      .in("vaccinationrecord_id", vaccinationRecordIds);

    if (esaviReportsError) {
      console.error("Error fetching esavi reports:", esaviReportsError);
      return 0;
    }

    const uniqueVaccinationRecordIds = [
      ...Array.from(
        new Set(esaviReportsData.map((report) => report.vaccinationrecord_id))
      ),
    ];

    return uniqueVaccinationRecordIds.length;
  }

  // Función para llenar los datos de vacunas administradas
  async function loadVaccineData(vaccinationCenterId: string) {
    // Obtener todos los registros de vacunación para el centro
    const { data: vaccinationRecords, error } = await supabase
      .from("vaxtraceapi_vaccinationrecord")
      .select("vaccine_id")
      .eq("vaccination_center_id", vaccinationCenterId);

    if (error) {
      console.error("Error fetching vaccination records:", error);
      return;
    }

    const vaccineCountMap: Record<string, number> = {};

    // Verifica si hay registros de vacunación
    if (vaccinationRecords) {
      const uniqueVaccineIds = [
        ...Array.from(
          new Set(vaccinationRecords.map((record) => record.vaccine_id))
        ),
      ];

      // Itera sobre los vaccine_ids únicos
      uniqueVaccineIds.forEach((vaccineId) => {
        const count = vaccinationRecords.filter(
          (record) => record.vaccine_id === vaccineId
        ).length;

        // Agrega al mapa
        vaccineCountMap[vaccineId] = count;
      });
    }

    const vaccineIds = vaccinationRecords.map((record) => record.vaccine_id);

    const vaccinesData = await fetchVaccineNames(vaccineIds);
    const chartData = vaccinesData.map((vaccine) => {
      const vaccineId = vaccine.vaccine_id;
      const vaccineName = vaccine.commercial_name;

      return {
        name: vaccineName,
        count: vaccineCountMap[vaccineId] || 0,
      };
    });

    // Actualizar el estado del gráfico de vacunas
    const vaccineDataMap: Record<string, number> = chartData.reduce(
      (acc, { name, count }) => {
        acc[name] = count;
        return acc;
      },
      {} as Record<string, number>
    );
    setVaccineData(vaccineDataMap);
  }

  // Función para llenar los datos de reportes
  async function loadReportedData(vaccineRecordIds: string[]) {
    // Obtener reportes de ESAVI por registro de vacunación
    const { data: esaviReportsData, error } = await supabase
      .from("vaxtraceapi_vaccinationrecord_esavi_symptoms")
      .select("vaccinationrecord_id")
      .in("vaccinationrecord_id", vaccineRecordIds);

    if (error) {
      console.error("Error fetching esavi reports:", error);
      return;
    }

    // Extraer vaccinationRecordIds únicos para evitar duplicados por múltiples síntomas
    const uniqueVaccinationRecordIds = Array.from(
      new Set(esaviReportsData?.map((report) => report.vaccinationrecord_id))
    );

    // Contar cada registro único de vacunación como un reporte
    const reportCountMap: Record<string, number> = {};
    uniqueVaccinationRecordIds.forEach((vaccinationRecordId) => {
      reportCountMap[vaccinationRecordId] = 1; // Contar solo una vez por registro
    });

    // Obtener registros de vacunación para extraer vaccine_id
    const vaccinationRecords = await fetchVaccinationRecords(
      uniqueVaccinationRecordIds
    );

    // Crear un mapa de vaccine_id con sus respectivos nombres
    const vaccineIds = vaccinationRecords.map((record) => record.vaccine_id);
    const vaccinesData = await fetchVaccineNames(vaccineIds);
    const vaccineNamesMap = vaccinesData.reduce<Record<string, string>>(
      (acc, vaccine) => {
        acc[vaccine.vaccine_id] = vaccine.commercial_name;
        return acc;
      },
      {}
    );

    // Contar reportes por nombre de vacuna usando vaccine_id, evitando duplicados
    const reportedDataMap: Record<string, number> = {};
    vaccinationRecords.forEach((record) => {
      const vaccineId = record.vaccine_id;
      const vaccineName = vaccineNamesMap[vaccineId];

      if (vaccineName && reportCountMap[record.id]) {
        reportedDataMap[vaccineName] = (reportedDataMap[vaccineName] || 0) + 1; // Sumar 1 por cada vaccine_id
      }
    });

    // Actualizar el estado del gráfico de reportes
    setReportedData(reportedDataMap);
  }

  async function gatherReports() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.user_id;
      if (!userId) {
        console.error("No user_id found in token");
        return;
      }

      const vaccinationCenterId = await fetchVaccinationCenterId(userId);
      if (!vaccinationCenterId) return;

      const center = await fetchCenterInfo(vaccinationCenterId);
      if (!center) return;

      setCenterInfo(center);

      const municipality = await fetchMunicipalityInfo(center.municipality_id);
      if (municipality) {
        setMunicipalityName(municipality.name);
        const province = await fetchProvinceInfo(municipality.province_id);
        if (province) {
          setProvinceName(province.name);
        }
      }

      const { count: totalVaccinesAdministered, vaccineRecordIds } =
        await fetchVaccinesAdministered(vaccinationCenterId);

      setVaccinesAdministered(totalVaccinesAdministered);

      // Cargar datos de vacunas administradas
      await loadVaccineData(vaccinationCenterId);

      // Cargar datos de reportes
      await loadReportedData(vaccineRecordIds);

      const esaviReportsData = await fetchEsaviReports(vaccineRecordIds);
      const reportCounts = esaviReportsData.reduce<ReportCounts>(
        (acc, report) => {
          acc[report.vaccinationrecord_id] =
            (acc[report.vaccinationrecord_id] || 0) + 1;
          return acc;
        },
        {}
      );

      setEsaviReports(reportCounts);

      const vaccinationRecords = await fetchVaccinationRecords(
        esaviReportsData.map((report) => report.vaccinationrecord_id)
      );

      const uniquePatientIds = new Set<string>();
      vaccinationRecords.forEach((record) => {
        if (record.patient_id) uniquePatientIds.add(record.patient_id);
        if (record.child_id) uniquePatientIds.add(record.child_id);
      });

      const vaccinesData = await fetchVaccineNames(
        vaccinationRecords.map((record) => record.vaccine_id)
      );
      const vaccineNamesMap = vaccinesData.reduce<Record<string, string>>(
        (acc, vaccine) => {
          acc[vaccine.vaccine_id] = vaccine.commercial_name;
          return acc;
        },
        {}
      );

      const usersReportsData = await fetchUserReports(uniquePatientIds);
      const childReportsData = await fetchChildReports(uniquePatientIds);

      const userReportsWithCounts = await Promise.all(
        usersReportsData.map(async (user) => {
          const reportCount = await getUniqueReportCount(
            user.id,
            vaccinationCenterId
          );
          const userVaccinationRecords = vaccinationRecords
            .filter((record) => record.patient_id === user.id)
            .map((record) => vaccineNamesMap[record.vaccine_id]);

          return {
            ...user,
            reportCount,
            vaccinesReported: userVaccinationRecords,
          };
        })
      );

      const childReportsWithCounts = await Promise.all(
        childReportsData.map(async (child) => {
          const parentId = child.parent_id;
          const reportCount = await getUniqueReportCount(
            child.id,
            vaccinationCenterId
          );
          const { data: parentRecords, error } = await supabase
            .from("vaxtraceapi_patientuser")
            .select("email")
            .eq("id", parentId);

          if (error) console.error("Error fetching parent report:", error);

          const userVaccinationRecords = vaccinationRecords
            .filter((record) => record.child_id === child.id)
            .map((record) => vaccineNamesMap[record.vaccine_id]);
          const email = parentRecords ? parentRecords[0].email : undefined;

          return {
            id: child.id,
            first_name: child.first_name,
            last_name: child.last_name,
            email,
            reportCount,
            vaccinesReported: userVaccinationRecords,
          };
        })
      );

      const allUserReports = [
        ...userReportsWithCounts,
        ...childReportsWithCounts,
      ];
      setUsersReports(allUserReports);
      setUserReportsCount(allUserReports.length);
    } catch (error) {
      console.error("Error gathering reports:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    gatherReports();
  }, []);

  // Datos del centro
  const centerInfoCards = [
    {
      icon: BookOpenCheck,
      total: centerInfo?.RNC || "No disponible",
      title: "RNC",
    },
    {
      icon: UserRound,
      total: centerInfo?.director_document || "No disponible",
      title: "Documento del Director",
    },
    {
      icon: Waypoints,
      total: centerInfo?.address || "No disponible",
      title: "Dirección",
    },
    {
      icon: PhoneCall,
      total: centerInfo?.phone_number || "No disponible",
      title: "Teléfono",
    },
    {
      icon: MapIcon,
      total: municipalityName || "No disponible",
      title: "Municipio",
    },
    {
      icon: Waypoints,
      total: provinceName || "No disponible",
      title: "Provincia",
    },
  ];

  // Datos estadisticos
  const dataCardsSummary = [
    {
      icon: UserRound,
      total: vaccinesAdministered.toString(),
      average:
        vaccinesAdministered > 0
          ? parseFloat((vaccinesAdministered / 30).toFixed(2))
          : undefined,
      title: "Vacunas Administradas",
      tooltipText: "Cantidad de vacunas administradas por este centro.",
    },
    {
      icon: Waypoints,
      total: Object.keys(esaviReports).length.toString(),
      average:
        vaccinesAdministered > 0
          ? parseFloat((Object.keys(esaviReports).length / 30).toFixed(2))
          : undefined,
      title: "Reportes Esavi",
      tooltipText:
        "Cantidad de reportes Esavi relacionados con vacunas administradas por este centro.",
    },
    {
      icon: UserRound,
      total: userReportsCount.toString(),
      average:
        userReportsCount > 0
          ? parseFloat((userReportsCount / 30).toFixed(2))
          : undefined,
      title: "Usuarios que han hecho Reportes",
    },
  ];

  // Datos del gráfico de vacunas suministradas
  const barChartData = {
    labels: Object.keys(vaccineData),
    datasets: [
      {
        label: "Vacunas administradas",
        data: Object.values(vaccineData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Datos del gráfico de vacunas reportadas
  const reportedChartData = {
    labels: Object.keys(reportedData),
    datasets: [
      {
        label: "Vacunas reportadas",
        data: Object.values(reportedData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Cantidad",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Vacunas",
        },
      },
    },
    responsive: true,
  };

  const reportedChartOptions = {
    indexAxis: "y" as const,
    scales: {
      x: {
        title: {
          display: true,
          text: "Cantidad",
        },
      },
      y: {
        title: {
          display: true,
          text: "Vacunas",
        },
      },
    },
    responsive: true,
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 dark:bg-transparent min-h-screen transition-colors duration-300">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-cyan-800 "></div>
        </div>
      ) : (
        <>
          <h2 className="text-5xl font-bold text-gray-700 dark:text-gray-200 mb-10 text-center">
            {centerInfo
              ? `Bienvenido, ${centerInfo.name}`
              : "Vaccination Center Dashboard"}
          </h2>

          {/* Sección de Información del Centro */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-6">
              Información del Centro
            </h3>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20">
              {centerInfoCards.map(({ icon: Icon, total, title }) => (
                <CardSummary
                  key={title}
                  icon={Icon}
                  total={total}
                  title={title}
                  className="transition-transform transform hover:-translate-y-3 cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Sección de Datos Estadisticos */}
          <div className="mb-6 pt-5">
            <h3 className="text-xl font-semibold mb-6">Datos estadisticos</h3>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20">
              {dataCardsSummary.map(
                ({ icon: Icon, total, average, title, tooltipText }) => (
                  <CardSummary
                    key={title}
                    icon={Icon}
                    total={total}
                    title={title}
                    average={average}
                    tooltipText={tooltipText}
                  />
                )
              )}
            </div>
          </div>

          {/* Tabla de Usuarios que han realizado reportes */}
          <div className="mb-6 pt-5">
            <h3 className="text-xl font-semibold mb-6">
              Pacientes que han realizado reportes
            </h3>
            <table className="min-w-full bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-500">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Correo Electrónico</th>
                  <th className="py-2 px-4 border-b">Ocupación</th>
                  <th className="py-2 px-4 border-b">Total de Reportes</th>
                  <th className="py-2 px-4 border-b">Vacunas reportadas</th>
                </tr>
              </thead>
              <tbody>
                {usersReports.length > 0 ? (
                  usersReports.map((user, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <td className="py-2 px-4 border-b text-center ">
                        {user.first_name} {user.last_name}
                        {!user.occupation && (
                          <span className="text-gray-500 text-xs ml-1 dark:text-blue-950">
                            (Dependiente)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-center ">
                        {user.email}
                      </td>
                      <td className="py-2 px-4 border-b text-center ">
                        {user.occupation ? user.occupation : "Menor"}
                      </td>
                      <td className="py-2 px-4 border-b text-center ">
                        {user.reportCount}
                      </td>
                      <td className="py-2 px-4 border-b text-center ">
                        {user.vaccinesReported?.join(", ") || "No disponible"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-2 px-4 text-center border-b dark:bg-gray-500"
                    >
                      No hay usuarios que hayan realizado reportes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Gráficos */}
          <div className="mb-6 pt-5">
            <h3 className="text-xl font-semibold mb-6">Gráficos</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "20px",
              }}
            >
              <div style={{ width: "40%" }}>
                <h3>Vacunas Suministradas</h3>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
              <div style={{ width: "40%" }}>
                <h3>Vacunas Reportadas</h3>
                <Bar data={reportedChartData} options={reportedChartOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CenterDashboardPage;
