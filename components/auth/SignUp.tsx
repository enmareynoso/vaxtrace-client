"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../public/images/logo.png";
import MainImage from "../../public/images/heroImage.png";
import { Button } from "@/components/ui/button";
import Checkbox from "../ui/checkbox";
import { supabase } from "@/lib/supabaseClient";
import { registerCenter } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';

interface Province {
  province_id: number;
  name: string;
}

interface Municipality {
  municipality_id: number;
  name: string;
  province_id: number;
}

const CenterSignUp: React.FC = () => {
  const [rnc, setRnc] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [province, setProvince] = useState<string>("");
  const [municipality, setMunicipality] = useState("");
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProvincesAndMunicipalities = async () => {
      const { data: provinceData, error: provinceError } = await supabase
        .from("vaxtraceapi_province")
        .select("province_id, name");
  
      const { data: municipalityData, error: municipalityError } = await supabase
        .from("vaxtraceapi_municipality")
        .select("municipality_id, name, province_id");
  
      if (provinceError || municipalityError) {
        console.error("Error fetching data:", provinceError || municipalityError);
      } else {
        setProvinces(provinceData || []);
        setMunicipalities(municipalityData || []);
      }
    };
  
    fetchProvincesAndMunicipalities();
  }, []);

  const filteredMunicipalities = municipalities.filter(
    (muni) => muni.province_id === parseInt(province)
  );
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        RNC: rnc,
        name,
        address,
        phone_number: phoneNumber,
        email,
        municipality_id: parseInt(municipality),
        account: {
          email,
          password,
          role: "vaccination_center",
        },
      };

      const data = await registerCenter(payload);

      toast.success("Center registered successfully.");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
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
      <div className="w-full md:w-1/2 bg-cyan-900 flex items-center justify-center p-6 md:p-12 flex-1">
        <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center text-cyan-900">
            Center Sign Up
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">RNC</label>
              <input
                type="text"
                value={rnc}
                onChange={(e) => setRnc(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="RNC"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="Center Name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="Address"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="Phone Number"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Province</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                required
              >
                <option value="">Select Province</option>
                {provinces.map((prov) => (
                  <option key={prov.province_id} value={prov.province_id}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Municipality</label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                required
              >
                <option value="">Select Municipality</option>
                {filteredMunicipalities.map((muni) => (
                  <option key={muni.municipality_id} value={muni.municipality_id}>
                    {muni.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-cyan-900 font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="Password"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-cyan-900 font-semibold">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-300"
                placeholder="Confirm Password"
                required
              />
            </div>
            <div className="mb-6">
              <Checkbox
                label="Accept Terms and Conditions"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </div>
            <Button
              variant="outline"
              className="w-full bg-cyan-800 text-white py-2 rounded hover:text-white hover:bg-cyan-900 transition duration-200"
              disabled={loading}  // Deshabilitar el botón mientras se carga
            >
              {loading ? 'Cargando...' : 'Register'}
            </Button>
            <div className="mt-4 text-center">
              <a href="/auth/login" className="text-cyan-900 hover:underline">
                Already have an account?{" "}
                <span className="font-semibold">Login</span>
              </a>
            </div>
          </form>
          <Toaster position="bottom-center" reverseOrder={false} />
        </div>
      </div>
    </div>
  );
};

export default CenterSignUp;

