import React, { ReactNode } from "react";
import { UserRole } from "@/lib/types/UserRoles";
import { Layout } from "../layout";

interface CenterLayoutProps {
  children: ReactNode;
}

const CenterLayout = ({ children }: CenterLayoutProps) => {
  const userRole: UserRole = "center"; // Role should be determined dynamically

  return <Layout userRole={userRole}>{children}</Layout>;
};

export default CenterLayout;
