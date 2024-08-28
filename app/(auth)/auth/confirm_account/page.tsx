"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { confirmAccount } from "@/lib/api/auth";

const ConfirmAccount: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const toastShownRef = useRef(false);  // Usando useRef para rastrear si el toast ha sido mostrado

  useEffect(() => {
    const handleAccountConfirmation = async () => {
      if (!token || toastShownRef.current) return; // No hacer nada si no hay token o ya se mostró un toast

      setLoading(true);
      toastShownRef.current = true; // Marcar como que el toast se ha mostrado

      try {
        const response = await confirmAccount(token);
        toast.success("Account confirmed successfully.");
        setTimeout(() => {
          router.push("/auth/confirm_account_success");
        }, 1000); // Redirigir después de 1 segundo
      } catch (error: any) {
        if (error.message.includes("Token has already been used")) {
          toast.error("This token has already been activated.");
        } else {
          toast.error(error.message || "Failed to confirm account.");
        }
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000); // Redirigir después de 1 segundo
      } finally {
        setLoading(false);
      }
    };

    handleAccountConfirmation();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden z-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1140 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            opacity="0.3"
            d="M193.307 -273.321L1480.87 1014.24L1121.85 1373.26C1121.85 1373.26 731.745 983.231 478.513 729.927C225.976 477.317 -165.714 85.6993 -165.714 85.6993L193.307 -273.321Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="1908.65"
              y1="1642.58"
              x2="602.827"
              y2="-418.681"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3056D3" stopOpacity="0.36" />
              <stop offset="1" stopColor="#3056D3" stopOpacity="0.3" />
              <stop offset="1" stopColor="#3056D3" stopOpacity="0.096144" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Confirmando cuenta...</h1>
        <p className="mb-4">Por favor espera mientras confirmamos tu cuenta.</p>
        <Toaster position="bottom-center" reverseOrder={false} />
      </div>
    </div>
  );
};

export default ConfirmAccount;




