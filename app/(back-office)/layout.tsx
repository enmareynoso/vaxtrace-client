import { Navbar, Sidebar } from "@/components/dashboard";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  // Variable de rol del usuario (puedes cambiarla para probar diferentes casos)
  const userRole = "center"; // Puede ser "admin", "user" o "center"

  return (
    <div className="flex w-full h-full">
      <div className="hidden xl:block w-80 h-full xl:fixed">
        <Sidebar userRole={userRole} />
      </div>
      <div className="w-full xl:ml-80">
        <Navbar />
        <div className="p-6 bg-[#fafbfc] dark:bg-secondary">{children}</div>
      </div>
    </div>
  );
}
