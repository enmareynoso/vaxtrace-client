"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { handleApplicationResponse } from "@/lib/api/auth";  // Asegúrate de ajustar el path según sea necesario

const ApproveApplicationPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const email = searchParams.get("email");
  const status = searchParams.get("status");
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResponse = async () => {
      try {
        if (!email || !status) {
          toast.error("Missing email or status");
          return;
        }

        const data = await handleApplicationResponse(email, status);

      } catch (error) {
        console.error("Error handling application response:", error);
      } finally {
        setLoading(false);
      }
    };

    handleResponse();
  }, [email, status, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-800"></div>
      ) : (
        <h1 className="text-2xl">
          {status === "approve"
            ? "Application Approved"
            : status === "reject"
            ? "Application Rejected"
            : "Invalid Status"}
        </h1>
      )}
    </div>
  );
};

export default ApproveApplicationPage;

