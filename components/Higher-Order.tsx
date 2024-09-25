import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Ensure this import is correct
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode'; // Ensure this import is correct, sometimes it's 'jwt-decode'
import SessionExpirationModal from './SessionExpirationModal';  // Verify the correct path
import { refresh_Token } from '@/lib/api/auth';  // Verify the correct import path
import "./SessionExpirationStyle.css"

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Only set mounted state on the client side
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
          if (decoded.exp < currentTime) {
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error decoding token: ", error);
          handleLogout(); // Log out if the token is invalid
        }
      }
    };

    if (isMounted) {
      handleTokenCheck();
      const interval = setInterval(handleTokenCheck, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMounted, router]);

  const handleRefreshToken = async () => {
    try {
      const data = await refresh_Token();
      console.log('Token refreshed successfully', data);
      Cookies.set("access_token", data.access_token, { expires: 1 }); // Optionally set the cookie if needed
      // Handle further logic with new tokens, like updating state or UI
    } catch (error) {
      console.error("Refresh token error:", error);
      // Handle errors, possibly logging out the user or showing an error message
    }
  };
  

  const handleLogout = async () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    router.push("/auth/login");
  };

  if (!isMounted) {
    return null; // Optionally render a loading spinner here
  }

  return (
    <>
      <SessionExpirationModal isOpen={showModal} onClose={handleLogout} onRefreshToken={handleRefreshToken} />
      {children}
    </>
  );
};

export default AuthGuard;

