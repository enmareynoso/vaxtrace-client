import React, { useState } from "react";
import Image from "next/image";
import logo from "../../images/logo.png";
import MainImage from "../../images/heroImage.png";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/auth";
import { useRouter } from "next/router";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // -------------------------------------------------  Este log es temporal para realizar pruebas
    console.log("Email:", email);
    console.log("Password:", password);
    // -------------------------------------------------
    try {
      setError("");

      const data = await login(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/back-office/dashboard");
      } else {
        setError("Login failed: Invalid response from server.");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError("Login failed: An unexpected error occurred.");
      }
    }
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
        <div className="bg-transparent p-4 md:p-8 rounded w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center text-white">
            Vaxtrace
          </h1>
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-left text-white">
            Sign In
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Password"
                required
              />
            </div>
            <Button
              variant="outline"
              className="w-full bg-slate-900 text-white py-2 rounded hover:bg-gray-800 transition duration-200"
            >
              Login
            </Button>
            <div className="mt-4 text-center">
              <a
                href="/auth/forgot-password"
                className="text-white hover:underline"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
