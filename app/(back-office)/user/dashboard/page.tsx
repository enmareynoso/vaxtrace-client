"use client";
import React, { useEffect, useState } from "react";
import { BookOpenCheck, UserRound, Waypoints } from "lucide-react";
import { CardSummary } from "@/components/dashboard/CardSummary";
import { LastUser } from "@/components/dashboard/LastUser";
import { supabase } from "@/lib/supabaseClient";
import { jwtDecode } from "jwt-decode";

const UserDashboardPage: React.FC = () => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");
  
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
  
        console.log("Token found in localStorage:", token); // <-- Añadir
  
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // Verificar que el token se decodifique correctamente
  
        const userId = decodedToken.user_id;
  
        if (!userId) {
          console.error("No user_id found in token");
          return;
        }
  
        // Obtener el `first_name`, `last_name` y `birthdate` utilizando el `user_id`
        const { data: user, error } = await supabase
          .from("vaxtraceapi_patientuser")
          .select("first_name, last_name, birthdate")
          .eq("id", userId)
          .single();
  
        if (error || !user) {
          console.error("Error fetching user information:", error);
          return;
        }
  
        console.log("User info fetched:", user); // <-- Añadir
  
        // Calcular la edad a partir de la fecha de nacimiento
        const birthDate = new Date(user.birthdate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const monthDiff = new Date().getMonth() - birthDate.getMonth();
  
        if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < birthDate.getDate())) {
          setAge(age - 1);
        } else {
          setAge(age);
        }
  
        setFullName(`${user.first_name} ${user.last_name}`);
      } catch (error) {
        console.error("Error during fetching process:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserInfo();
  }, []);
  

  const dataCardsSummary = [
    {
      icon: UserRound,
      total: "30",
      average: 10,
      title: "User Birthday",
      tooltipText: "G",
    },
    {
      icon: Waypoints,
      total: age?.toString() ?? "--", // Mostrar la edad calculada
      average: 60,
      title: "Age",
      tooltipText: "User's Age",
    },
    {
      icon: BookOpenCheck,
      total: "10",
      average: 20,
      title: "Recommended Vaccines",
      tooltipText: "Recommended Vaccines According to Age",
    },
  ];

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-800"></div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl mb-4">
            {fullName ? `Bienvenido, ${fullName}` : "User Dashboard"}
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

export default UserDashboardPage;
