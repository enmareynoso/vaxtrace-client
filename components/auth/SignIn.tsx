"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "@/public/images/logo.png";
import MainImage from "@/public/images/heroImage.png";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface CustomJwtPayload {
  user_id: number;
  user_type: string;
  role: string;
  type: string;
  exp: number;
  iat: number;
}

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      console.log("Login response data:", data); // Depuración de los datos recibidos

      if (data.access_token) {
        // Verificar la configuración de las cookies
        const isProduction = process.env.NODE_ENV === "production";

        Cookies.set("access_token", data.access_token, {
          secure: isProduction, // True en producción, false en desarrollo
          sameSite: "Strict",
        });
        Cookies.set("refresh_token", data.refresh_token, {
          secure: isProduction, // True en producción, false en desarrollo
          sameSite: "Strict",
        });

        // También almacenar en localStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        console.log(
          "Token saved to cookies and localStorage:",
          data.access_token
        );

        console.log("Access token cookie:", Cookies.get("access_token")); // Verificar si la cookie se establece correctamente

        const decoded: CustomJwtPayload = jwtDecode(data.access_token);
        console.log("Decoded JWT:", decoded); // Depuración del token decodificado

        if (decoded.role) {
          switch (decoded.role) {
            case "patient":
              router.push("/user/dashboard");
              break;
            case "vaccination_center":
              localStorage.setItem("account_id", decoded.user_id.toString());
              router.push("/center/dashboard");
              break;
            default:
              throw new Error("Unauthorized: No valid role found.");
          }
        } else {
          throw new Error("Invalid token: Cannot decode");
        }
      } else {
        toast.error("Login failed: Invalid response from server.");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-4 md:p-10 relative flex-1">
        <div className="absolute inset-0 overflow-hidden">
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
        <a
          href="/"
          className="absolute top-4 left-4 text-gray-800 hover:underline flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          <Image className="h-8 w-auto mr-2" src={logo} alt="Vaxtrace Logo" />
          Vaxtrace
        </a>

        <div className="relative z-10 inline-block pt-2 md:pt-11 lg:pt-0">
          <Image
            src={MainImage}
            alt="hero"
            width={400}
            height={300}
            className="max-w-xs md:max-w-sm h-auto"
          />
        </div>
      </div>
      <div className="w-full md:w-1/2 bg-cyan-900 flex items-center justify-center p-4 md:p-10 flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center text-cyan-900 dark:text-white border-b border-cyan-900 dark:border-white pb-4">
            Iniciar Sesión
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-cyan-900 dark:text-gray-100 font-semibold">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-cyan-900 dark:text-gray-100 font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-500 dark:text-white"
                  placeholder="Password"
                  required
                />
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-cyan-800 text-white py-2 rounded hover:text-white hover:bg-cyan-900 transition duration-200"
              disabled={loading} // Deshabilitar el botón mientras se carga
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Cargando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
            <div className="mt-4 text-center">
              <a
                href="/auth/forgot_password"
                className="text-cyan-900 dark:text-white hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
          <Toaster position="bottom-center" reverseOrder={false} />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
