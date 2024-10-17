"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/images/logo.png";
import { Button } from "@headlessui/react";

const ConfirmAccountSuccess: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login"); // Redirige al usuario a la página de inicio de sesión
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
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
      <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="text-center mb-6">
          <Image
            className="mx-auto"
            src={logo}
            alt="Vaxtrace Logo"
            width={80}
            height={80}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ¡Cuenta Confirmada!
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Tu cuenta ha sido confirmada exitosamente. Ahora puedes iniciar sesión
          y comenzar a usar nuestros servicios.
        </p>
        <Button
          onClick={handleLogin}
          className="mt-6 px-6 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900 transition duration-150"
        >
          Ir a Iniciar Sesión
        </Button>
      </div>
    </div>
  );
};

export default ConfirmAccountSuccess;
