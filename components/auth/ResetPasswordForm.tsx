"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/public/images/logo.png";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { resetPassword, validateToken } from "@/lib/api/auth";

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await validateToken(token);
        if (response.message !== "Token is valid") {
          router.push("/auth/reset_password_failure");
        }
      } catch (err) {
        router.push("/auth/reset_password_failure");
      }
    };

    if (token) {
      checkToken();
    } else {
      router.push("/auth/reset_password_failure");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      if (!showToast) {
        toast.error("Passwords do not match", {
          style: {
            border: "1px solid #F44336",
            padding: "16px",
            color: "#F44336",
          },
          iconTheme: {
            primary: "#F44336",
            secondary: "#FFFAEE",
          },
        });
        setShowToast(true);
      }
      return;
    }
    setShowToast(false);
    setLoading(true);
    try {
      const resetRequest = {
        token,
        new_password: newPassword,
      };
      console.log("Sending reset request:", resetRequest); // Log the data being sent
      await resetPassword(resetRequest);
      toast.success("Password reset successful");
      setTimeout(() => {
        router.push("/auth/reset_password_success"); // Redirect after successful reset
      }, 1000); // 1 seconds delay
    } catch (err: any) {
      toast.error(err.message || "Token has expired, Ask For another");
    } finally {
      setLoading(false); // Establecer el estado de carga en false
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <Image
            className="mx-auto"
            src={logo}
            alt="Vaxtrace Logo"
            width={80}
            height={80}
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Welcome to Vaxtrace!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            To get started with your new account, please update your password.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 dark:text-gray-300"
            >
              New password:
            </label>
            <div className="password-wrapper relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-700 dark:text-gray-200"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="form-group mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 dark:text-gray-300"
            >
              Verify password:
            </label>
            <div className="password-wrapper relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-700 dark:text-gray-200"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Processing..." : "Set Password"}
          </button>
          <Toaster position="bottom-center" reverseOrder={false} />
        </form>
        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
