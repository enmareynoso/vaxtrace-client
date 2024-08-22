"use client";
import React, { useEffect, useState } from "react";
import { BookOpenCheck, UserRound, Waypoints } from "lucide-react";
import { CardSummary } from "@/components/dashboard/CardSummary";
import { LastUser } from "@/components/dashboard/LastUser";
import { supabase } from "@/lib/supabaseClient"; // Importa tu supabase client
import { jwtDecode } from "jwt-decode";


const dataCardsSummary = [
  {
    icon: UserRound,
    total: "15",
    average: 12,
    title: "User Birthday",
    tooltipText: "G",
  },
  {
    icon: Waypoints,
    total: "20",
    average: 70,
    title: "Age",
    tooltipText: "G",
  },
  {
    icon: BookOpenCheck,
    total: "5",
    average: 25,
    title: "Recommended Vaccines",
    tooltipText: "Recommended Vaccines According to Age",
  },
];

const CenterDashboardPage: React.FC = () => {
  const [centerName, setCenterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Nuevo estado para controlar el loading

  useEffect(() => {
    const fetchCenterInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.error("No token found");
          return;
        }

        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const userId = decodedToken.user_id;

        if (!userId) {
          console.error("No user_id found in token");
          return;
        }

        // Obtener el vaccination_center_id utilizando el user_id
        const { data: userAccount, error } = await supabase
          .from('vaxtraceapi_vaccinationcenteraccount')
          .select('vaccination_center_id')
          .eq('id', userId)
          .single();

        if (error || !userAccount) {
          console.error("Error fetching vaccination center account:", error);
          return;
        }

        const vaccinationCenterId = userAccount.vaccination_center_id;

        // Ahora que tenemos el ID del centro, obtener el nombre del centro
        const { data: center, error: centerError } = await supabase
          .from('vaxtraceapi_vaccinationcenter')
          .select('name')
          .eq('vaccination_center_id', vaccinationCenterId)
          .single();

        if (centerError) {
          console.error("Error fetching center name:", centerError);
        } else {
          setCenterName(center?.name || '');
        }
      } catch (error) {
        console.error("Error during fetching process:", error);
      } finally {
        setLoading(false); // Asegúrate de desactivar el loading
      }
    };

    fetchCenterInfo();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-800"></div>
      </div>
      ) : (
        <>
          <h2 className="text-2xl mb-4">
            {centerName ? `Bienvenido, ${centerName}` : "Vaccination Center Dashboard"}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20">
            {dataCardsSummary.map(
              ({ icon: Icon, total, average, title, tooltipText }) => (
                <CardSummary
                  key={title}
                  icon={Icon}
                  total={total}
                  average={average}
                  title={title}
                  tooltipText={tooltipText}
                />
              )
            )}
          </div>
          <div className="grid grid-cols-1 mt-12 xl:grid-cols-2 md:gap-x-10">
            <LastUser />
          </div>
        </>
      )}
    </div>
  );
};

export default CenterDashboardPage;

