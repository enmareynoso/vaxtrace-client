import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Solo se ejecuta en el cliente
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token = Cookies.get("access_token"); // Obtener el token de la cookie

      if (!token) {
        // Si no hay token, redirige a la página de login
        router.push("/auth/login");
      } else {
        try {
          const decoded: any = jwtDecode(token);

          // Verificar si el token es válido y no ha expirado
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Si el token ha expirado, redirigir al login y eliminar tokens de las cookies
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            router.push("/auth/login");
          }
        } catch (error) {
          console.error("Invalid token:", error);
          router.push("/auth/login");
        }
      }
    }
  }, [isMounted, router]);

  // Esperar a que el componente esté montado en el cliente
  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
