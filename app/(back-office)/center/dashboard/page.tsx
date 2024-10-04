"use client";
import React, { useEffect, useState } from "react";
import { BookOpenCheck, UserRound, Waypoints, PhoneCall, MapIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";

const CenterDashboardPage: React.FC = () => {
  const [centerName, setCenterName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [directorDocument, setDirectorDocument] = useState<string | null>(null);
  const [municipalityName, setMunicipalityName] = useState<string | null>(null);
  const [provinceName, setProvinceName] = useState<string | null>(null);
  const [RNC, setRNC] = useState<string | null>(null);  // Estado para RNC
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenterInfo = async () => {
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

        const { data: userAccount, error } = await supabase
          .from("vaxtraceapi_vaccinationcenteraccount")
          .select("vaccination_center_id")
          .eq("id", userId)
          .single();

        if (error || !userAccount) {
          console.error("Error fetching vaccination center account:", error);
          return;
        }

        const vaccinationCenterId = userAccount.vaccination_center_id;

        const { data: center, error: centerError } = await supabase
          .from("vaxtraceapi_vaccinationcenter")
          .select("name, address, phone_number, director_document, municipality_id, RNC")
          .eq("vaccination_center_id", vaccinationCenterId)
          .single();

        if (centerError) {
          console.error("Error fetching center info:", centerError);
        } else {
          setCenterName(center?.name || "");
          setAddress(center?.address || "");
          setPhoneNumber(center?.phone_number || "");
          setDirectorDocument(center?.director_document || "");
          setRNC(center?.RNC || "");  // Guardamos el valor del RNC

          const { data: municipality, error: municipalityError } = await supabase
            .from("vaxtraceapi_municipality")
            .select("name, province_id")
            .eq("municipality_id", center?.municipality_id)
            .single();

          if (municipalityError) {
            console.error("Error fetching municipality info:", municipalityError);
          } else {
            setMunicipalityName(municipality?.name || "");

            const { data: province, error: provinceError } = await supabase
              .from("vaxtraceapi_province")
              .select("name")
              .eq("province_id", municipality?.province_id)
              .single();

            if (provinceError) {
              console.error("Error fetching province info:", provinceError);
            } else {
              setProvinceName(province?.name || "");
            }
          }
        }
      } catch (error) {
        console.error("Error during fetching process:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenterInfo();
  }, []);

  const dataCardsSummary = [
    {
      icon: BookOpenCheck,
      total: RNC || "No disponible",
      title: "RNC",
    },
    {
      icon: UserRound,
      total: directorDocument || "No disponible",
      title: "Documento del Director",
    },
    {
      icon: Waypoints,
      total: address || "No disponible",
      title: "Dirección",
    },
    {
      icon: PhoneCall,
      total: phoneNumber || "No disponible",
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

  return (
    <div className="container mx-auto p-8 bg-gray-50 dark:bg-transparent min-h-screen transition-colors duration-300">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500 border-b-4 border-gray-300 dark:border-gray-700"></div>
        </div>
      ) : (
        <>
          <h2 className="text-5xl font-bold text-gray-700 dark:text-gray-200 mb-10 text-center">
            {centerName ? `Bienvenido, ${centerName}` : "Vaccination Center Dashboard"}
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {dataCardsSummary.map(({ icon: Icon, total, title }) => (
              <div
                key={title}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-xl rounded-2xl p-8 transition-transform transform hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-gray-900"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <Icon className="w-12 h-12 text-cyan-800 dark:text-cyan-700" />
                  <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{title}</div>
                </div>
                <div className="text-2xl text-justify font-medium text-gray-900 dark:text-gray-100">{total}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CenterDashboardPage;

