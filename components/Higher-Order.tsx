import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import SessionExpirationModal from "./SessionExpirationModal";
import { refresh_Token } from "@/lib/api/auth";
import "./SessionExpirationStyle.css";

const AuthGuard = ({ children }: any) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleTokenCheck = async () => {
      const token = Cookies.get("access_token");
      if (!token) {
        router.push("/auth/login");
      } else {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error decoding token: ", error);
          handleLogout();
        }
      }
    };

    if (isMounted) {
      handleTokenCheck();
      const interval = setInterval(handleTokenCheck, 5000);
      return () => clearInterval(interval);
    }
  }, [isMounted, router]);

  const handleRefreshToken = async () => {
    try {
      const storedToken = localStorage.getItem("refresh_token");
      if (!storedToken) {
        throw new Error("No refresh token found");
      }

      const data = await refresh_Token(storedToken);
      console.log("Token refreshed successfully", data);
      Cookies.set("access_token", data.access_token, { expires: 1 });

      setShowModal(false); // Close the modal upon successful refresh
    } catch (error) {
      console.error("Refresh token error:", error);
      handleLogout(); // This could be leading to the unintended redirect
    }
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    router.push("/auth/login");
  };

  return (
    <>
      <SessionExpirationModal
        isOpen={showModal}
        onClose={handleLogout}
        onRefreshToken={handleRefreshToken}
      />
      {children}
    </>
  );
};

export default AuthGuard;
